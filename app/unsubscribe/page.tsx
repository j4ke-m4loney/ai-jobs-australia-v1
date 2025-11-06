'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid unsubscribe link');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('An unexpected error occurred');
      console.error('Unsubscribe error:', error);
    }
  };

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid unsubscribe link');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Newsletter Unsubscribe</CardTitle>
          <CardDescription>
            {status === 'idle' && 'Manage your newsletter subscription'}
            {status === 'loading' && 'Processing your request...'}
            {status === 'success' && 'You have been unsubscribed'}
            {status === 'error' && 'Something went wrong'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'idle' && (
            <>
              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">
                  Are you sure you want to unsubscribe from AI Jobs Australia newsletter?
                </p>
                <p className="mb-2">
                  You will no longer receive updates about:
                </p>
                <ul className="text-left space-y-2 mb-4 text-gray-500">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>New AI and ML job opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Latest positions in Australia</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Weekly job roundups</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleUnsubscribe}
                  variant="destructive"
                  className="w-full"
                  disabled={!token}
                >
                  Yes, Unsubscribe
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/">
                    No, Keep Me Subscribed
                  </Link>
                </Button>
              </div>
            </>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">
                Processing your request...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">
                  Successfully Unsubscribed
                </p>
                <p className="text-sm text-gray-600">
                  You have been removed from our newsletter mailing list.
                </p>
                <p className="text-sm text-gray-500">
                  We&apos;re sorry to see you go! If you change your mind, you can always resubscribe from your account settings.
                </p>
              </div>
              <Button
                asChild
                className="mt-4"
              >
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <XCircle className="h-16 w-16 text-red-600" />
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">
                  Unsubscribe Failed
                </p>
                <p className="text-sm text-gray-600">
                  {errorMessage}
                </p>
                <p className="text-sm text-gray-500">
                  If this problem persists, please contact support at{' '}
                  <a
                    href="mailto:jake@aijobsaustralia.com.au"
                    className="text-blue-600 hover:underline"
                  >
                    jake@aijobsaustralia.com.au
                  </a>
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4"
              >
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Newsletter Unsubscribe</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
