import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Appends UTM tracking parameters to an application URL
 * Automatically handles URLs with existing query parameters
 * @param url - The application URL
 * @param jobId - Optional job ID to include in tracking
 */
export function appendUtmParams(url: string, jobId?: string): string {
  if (!url) return url;

  let utmParams = "utm_source=aijobsaustralia&utm_campaign=jobpost";
  if (jobId) {
    utmParams += `&utm_content=${jobId}`;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}${utmParams}`;
}
