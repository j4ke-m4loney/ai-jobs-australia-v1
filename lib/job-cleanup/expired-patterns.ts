export interface ExpiredPattern {
  phrase: string;
  confidence: 'high' | 'medium' | 'low';
  category: 'expired' | 'filled' | 'closed' | 'removed';
}

export const EXPIRED_PATTERNS: ExpiredPattern[] = [
  // High confidence - clear indicators
  { phrase: 'job expired', confidence: 'high', category: 'expired' },
  { phrase: 'position has been filled', confidence: 'high', category: 'filled' },
  { phrase: 'no longer accepting applications', confidence: 'high', category: 'closed' },
  { phrase: 'this job is no longer available', confidence: 'high', category: 'removed' },
  { phrase: 'posting has expired', confidence: 'high', category: 'expired' },
  { phrase: 'application deadline has passed', confidence: 'high', category: 'expired' },
  { phrase: 'this position is closed', confidence: 'high', category: 'closed' },
  { phrase: 'job has been removed', confidence: 'high', category: 'removed' },
  { phrase: 'this posting is no longer active', confidence: 'high', category: 'expired' },
  { phrase: 'applications are closed', confidence: 'high', category: 'closed' },

  // High confidence - ATS-specific patterns
  { phrase: 'this role is no longer available', confidence: 'high', category: 'removed' },
  { phrase: 'this job has expired', confidence: 'high', category: 'expired' },
  { phrase: 'this requisition is no longer active', confidence: 'high', category: 'expired' },
  { phrase: 'sorry, this position has been closed', confidence: 'high', category: 'closed' },
  { phrase: 'this job listing has expired', confidence: 'high', category: 'expired' },
  { phrase: 'this vacancy has been filled', confidence: 'high', category: 'filled' },
  { phrase: 'the application period for this job has ended', confidence: 'high', category: 'expired' },
  { phrase: 'this job ad has expired', confidence: 'high', category: 'expired' },
  { phrase: 'this position is no longer open', confidence: 'high', category: 'closed' },
  { phrase: 'this job is no longer active', confidence: 'high', category: 'expired' },
  { phrase: 'this opportunity is no longer available', confidence: 'high', category: 'removed' },

  // Medium confidence
  { phrase: 'position filled', confidence: 'medium', category: 'filled' },
  { phrase: 'applications closed', confidence: 'medium', category: 'closed' },
  { phrase: 'not currently hiring', confidence: 'medium', category: 'closed' },
  { phrase: 'no longer hiring', confidence: 'medium', category: 'closed' },
  { phrase: 'job posting closed', confidence: 'medium', category: 'closed' },
  { phrase: 'explore other opportunities', confidence: 'medium', category: 'removed' },
  { phrase: 'view other open positions', confidence: 'medium', category: 'removed' },
  { phrase: 'this job may have been removed', confidence: 'medium', category: 'removed' },

  // Low confidence - may need review
  { phrase: 'temporarily unavailable', confidence: 'low', category: 'removed' },
  { phrase: 'check back later', confidence: 'low', category: 'removed' },
  { phrase: 'page not found', confidence: 'low', category: 'removed' },
];

export const HTTP_ERROR_CODES = {
  DEFINITELY_EXPIRED: [404, 410], // Not Found, Gone
  PROBABLY_EXPIRED: [403, 500, 503], // Forbidden, Server Error, Unavailable (needs review)
  TEMPORARY_ISSUE: [429, 502, 504], // Rate limit, Bad Gateway, Timeout (retry later)
};

export interface ExpiredDetectionResult {
  found: ExpiredPattern[];
  confidence: 'high' | 'medium' | 'low' | 'none';
  shouldExpire: boolean;
  shouldReview: boolean;
}

export function detectExpiredIndicators(html: string): ExpiredDetectionResult {
  const normalizedHtml = html.toLowerCase();
  const found: ExpiredPattern[] = [];

  for (const pattern of EXPIRED_PATTERNS) {
    if (normalizedHtml.includes(pattern.phrase.toLowerCase())) {
      found.push(pattern);
    }
  }

  // Decision logic
  const hasHighConfidence = found.some(p => p.confidence === 'high');
  const hasMediumConfidence = found.some(p => p.confidence === 'medium');
  const hasLowConfidence = found.some(p => p.confidence === 'low');

  let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (hasHighConfidence) confidence = 'high';
  else if (hasMediumConfidence) confidence = 'medium';
  else if (hasLowConfidence) confidence = 'low';

  return {
    found,
    confidence,
    shouldExpire: hasHighConfidence,
    shouldReview: (hasMediumConfidence || hasLowConfidence) && !hasHighConfidence,
  };
}
