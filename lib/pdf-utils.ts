import { extractText, getDocumentProxy } from 'unpdf';

/**
 * Extract text from a PDF buffer using unpdf (Next.js App Router compatible).
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8Array);
  const { text } = await extractText(pdf, { mergePages: true });
  return (typeof text === 'string' ? text : (text as string[]).join('\n')).trim();
}
