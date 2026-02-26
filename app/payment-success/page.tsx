"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Loading component for Suspense fallback
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Loading...
            </h2>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

// Main component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'processing' | 'error'>('processing');

  useEffect(() => {
    if (!sessionId) {
      setPaymentStatus('error');
      setLoading(false);
      return;
    }

    // In a real implementation, you might want to verify the payment status
    // by calling your backend API to check the session status
    const timer = setTimeout(() => {
      setPaymentStatus('success');
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32 pb-20">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Processing Payment
              </h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32 pb-20">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                Payment Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push('/post-job')}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push('/employer')}>
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Thank you for your payment. Your job posting has been submitted for review.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Your job will be reviewed within 24 hours</li>
                    <li>• Once approved, it will go live on AI Jobs Australia</li>
                    <li>• You&apos;ll receive email notifications about applications — check your Spam or Junk folder if you don&apos;t see them</li>
                    <li>• Manage your job postings from your employer dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/employer/jobs')}>
                View My Jobs
              </Button>
              <Button variant="outline" onClick={() => router.push('/post-job')}>
                Post Another Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

// Main page component with Suspense wrapper
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}