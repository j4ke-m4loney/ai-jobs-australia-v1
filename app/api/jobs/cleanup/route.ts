import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkJobUrl } from "@/lib/job-cleanup/url-checker";

const BATCH_SIZE = 25; // Process 100 jobs per cron run (temporarily increased for restoration)
const MIN_CHECK_INTERVAL_HOURS = 48; // Don't re-check jobs more than every 2 days

// This endpoint should be called by a cron job to clean up expired or invalid jobs
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify the request is from a cron job (Vercel Cron sends an authorization header)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
      checked: 0,
      expired: 0,
      needsReview: 0,
      keptActive: 0,
      errors: 0,
    };

    console.log("[JobCleanup] Starting cleanup run", {
      timestamp: now,
      batchSize: BATCH_SIZE,
      minCheckIntervalHours: MIN_CHECK_INTERVAL_HOURS,
    });

    // NOTE: We do NOT auto-expire based on expires_at date
    // URL check is the source of truth - jobs stay active as long as URL is valid

    // Step 1: Get approved jobs that need URL checking
    const { data: jobs, error: fetchError } = await supabaseAdmin
      .from("jobs")
      .select(
        "id, title, application_url, last_checked_at, check_count, employer_id"
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
          updateData.status = "needs_review";
          updateData.check_failure_reason =
            result.errorMessage || result.evidence?.join(", ");
          stats.needsReview++;
          console.log(
            `[JobCleanup] Flagging for review: ${job.id} - ${job.title}`
          );
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
