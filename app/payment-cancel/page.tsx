"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Payment Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges have been made to your account.
            </p>

            <div className="bg-orange-50 p-4 rounded-lg text-left">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 mb-1">
                    Your job posting was not created
                  </h4>
                  <p className="text-sm text-orange-700">
                    Since the payment was cancelled, your job posting has not been submitted.
                    You can return to complete the posting process anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/post-job')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Complete Job Posting
              </Button>
              <Button variant="outline" onClick={() => router.push('/employer')}>
                Go to Dashboard
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}