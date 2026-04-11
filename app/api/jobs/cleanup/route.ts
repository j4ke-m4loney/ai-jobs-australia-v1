import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkJobUrl } from "@/lib/job-cleanup/url-checker";

const BATCH_SIZE = 50; // Process 50 jobs per cron run
const MIN_CHECK_INTERVAL_HOURS = 24; // Re-check jobs daily
const MAX_JOB_AGE_DAYS = 60; // Auto-expire jobs older than this
const REVIEW_GRACE_PERIOD_DAYS = 20; // Don't flag jobs for review if posted within this many days

// This endpoint should be called by a cron job to clean up expired or invalid jobs
// Add ?dryRun=true to preview what would be expired without making changes
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";

  try {
    // Verify the request is from a cron job (Vercel Cron sends an authorization header)
    // Skip auth check in dry-run mode for local testing
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!dryRun && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date().toISOString();
    const cutoffTime = new Date(
      Date.now() - MIN_CHECK_INTERVAL_HOURS * 60 * 60 * 1000
    );

    const stats = {
      dryRun,
      paidExpired: 0,
      ageExpired: 0,
      checked: 0,
      expired: 0,
      needsReview: 0,
      keptActive: 0,
      errors: 0,
    };

    console.log("[JobCleanup] Starting cleanup run", {
      timestamp: now,
      dryRun,
      batchSize: BATCH_SIZE,
      minCheckIntervalHours: MIN_CHECK_INTERVAL_HOURS,
      maxJobAgeDays: MAX_JOB_AGE_DAYS,
      reviewGracePeriodDays: REVIEW_GRACE_PERIOD_DAYS,
    });

    // Step 0a: Expire paid (non-admin) jobs past their expires_at date (30-day paid listing)
    const { data: paidExpiredJobs, error: paidError } = dryRun
      ? await supabaseAdmin
          .from("jobs")
          .select("id, title, expires_at, employer_id")
          .eq("status", "approved")
          .neq("posted_by_admin", true)
          .lt("expires_at", now)
      : await supabaseAdmin
          .from("jobs")
          .update({
            status: "expired",
            expired_evidence: "Auto-expired: paid listing past expires_at",
          })
          .eq("status", "approved")
          .neq("posted_by_admin", true)
          .lt("expires_at", now)
          .select("id");

    if (paidError) {
      console.error("[JobCleanup] Error in paid job expiry:", paidError);
      stats.errors++;
    } else {
      stats.paidExpired = paidExpiredJobs?.length || 0;
      if (stats.paidExpired > 0) {
        console.log(
          `[JobCleanup] ${dryRun ? "Would expire" : "Expired"} ${stats.paidExpired} paid jobs past their expires_at date`
        );
      }
    }

    // Step 0b: Auto-expire all remaining jobs older than MAX_JOB_AGE_DAYS (60 days)
    const ageCutoff = new Date(
      Date.now() - MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: agedOutJobs, error: ageError } = dryRun
      ? await supabaseAdmin
          .from("jobs")
          .select("id, title, created_at, application_url, employer_id")
          .eq("status", "approved")
          .lt("created_at", ageCutoff)
      : await supabaseAdmin
          .from("jobs")
          .update({
            status: "expired",
            expired_evidence: `Auto-expired: older than ${MAX_JOB_AGE_DAYS} days`,
          })
          .eq("status", "approved")
          .lt("created_at", ageCutoff)
          .select("id");

    if (ageError) {
      console.error("[JobCleanup] Error in age-based expiry:", ageError);
      stats.errors++;
    } else {
      stats.ageExpired = agedOutJobs?.length || 0;
      if (stats.ageExpired > 0) {
        console.log(
          `[JobCleanup] ${dryRun ? "Would expire" : "Expired"} ${stats.ageExpired} jobs older than ${MAX_JOB_AGE_DAYS} days`
        );
      }
    }

    if (dryRun) {
      const duration = Date.now() - startTime;
      return NextResponse.json({
        message: "DRY RUN — no changes made",
        stats,
        ageExpiry: {
          cutoffDate: ageCutoff,
          jobsThatWouldExpire: stats.ageExpired,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jobs: agedOutJobs?.map((j: any) => ({
            id: j.id,
            title: j.title,
            ageDays: Math.floor(
              (Date.now() - new Date(j.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            hasUrl: !!j.application_url,
            employerId: j.employer_id,
          })),
        },
        timestamp: now,
        duration,
      });
    }

    // Step 1: Get approved jobs that need URL checking
    const { data: jobs, error: fetchError } = await supabaseAdmin
      .from("jobs")
      .select(
        "id, title, application_url, last_checked_at, check_count, employer_id, created_at"
      )
      .eq("status", "approved")
      .not("application_url", "is", null)
      .or(
        `last_checked_at.is.null,last_checked_at.lt.${cutoffTime.toISOString()}`
      )
      .order("last_checked_at", { ascending: true, nullsFirst: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error("[JobCleanup] Error fetching jobs:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      console.log("[JobCleanup] No jobs to check");
      return NextResponse.json({
        message: "Job cleanup completed",
        stats,
        timestamp: now,
        duration: Date.now() - startTime,
      });
    }

    console.log("[JobCleanup] Found jobs to check:", jobs.length);
    stats.checked = jobs.length;

    // Step 2: Check each job URL
    for (const job of jobs) {
      try {
        console.log(`[JobCleanup] Checking job: ${job.id} - ${job.title}`);

        const result = await checkJobUrl(job.application_url, true);

        console.log("[JobCleanup] Job checked", {
          jobId: job.id,
          method: result.method,
          decision: result.decision,
          responseTime: result.responseTimeMs,
          evidence: result.evidence,
        });

        // Log the check to audit table
        const { error: logError } = await supabaseAdmin
          .from("job_check_logs")
          .insert({
            job_id: job.id,
            check_method: result.method,
            status_code: result.statusCode,
            evidence_found: result.evidence || [],
            decision: result.decision,
            error_message: result.errorMessage,
            response_time_ms: result.responseTimeMs,
          });

        if (logError) {
          console.error("[JobCleanup] Error logging check:", logError);
        }

        // Update job based on decision
        const updateData: {
          last_checked_at: string;
          check_count: number;
          check_method: string;
          status?: string;
          expired_evidence?: string;
          check_failure_reason?: string;
        } = {
          last_checked_at: new Date().toISOString(),
          check_count: (job.check_count || 0) + 1,
          check_method: result.method,
        };

        if (result.decision === "mark_expired") {
          updateData.status = "expired";
          updateData.expired_evidence = result.evidence?.join(", ");
          stats.expired++;
          console.log(
            `[JobCleanup] Marking as expired: ${job.id} - ${job.title}`
          );

        } else if (result.decision === "needs_review") {
          // Don't flag recently posted jobs for review — many ATS systems
          // return 403/errors to automated requests even for valid listings
          const jobAgeDays = Math.floor(
            (Date.now() - new Date(job.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (jobAgeDays < REVIEW_GRACE_PERIOD_DAYS) {
            console.log(
              `[JobCleanup] Skipping review flag for recent job (${jobAgeDays} days old): ${job.id} - ${job.title}`
            );
            stats.keptActive++;
          } else {
            updateData.status = "needs_review";
            updateData.check_failure_reason =
              result.errorMessage || result.evidence?.join(", ");
            stats.needsReview++;
            console.log(
              `[JobCleanup] Flagging for review: ${job.id} - ${job.title}`
            );
          }
        } else {
          // keep_active
          stats.keptActive++;
        }

        const { error: updateError } = await supabaseAdmin
          .from("jobs")
          .update(updateData)
          .eq("id", job.id);

        if (updateError) {
          console.error("[JobCleanup] Error updating job:", updateError);
          stats.errors++;
        }
      } catch (error) {
        console.error(`[JobCleanup] Error checking job ${job.id}:`, error);
        stats.errors++;
      }
    }

    const duration = Date.now() - startTime;
    console.log("[JobCleanup] Cleanup complete", {
      stats,
      duration,
    });

    return NextResponse.json({
      message: "Job cleanup completed",
      stats,
      timestamp: new Date().toISOString(),
      duration,
    });
  } catch (error) {
    console.error("[JobCleanup] Error in job cleanup:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
