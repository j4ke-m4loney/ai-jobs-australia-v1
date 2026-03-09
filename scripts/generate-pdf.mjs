#!/usr/bin/env npx puppeteer

// Run with: npx puppeteer runScripts/generate-pdf.mjs
// Or: node --experimental-modules scripts/generate-pdf.mjs

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Dynamic import so npx can resolve it
  const puppeteer = await import('puppeteer');

  const htmlPath = path.join(__dirname, 'report-feb-2026-hiring-managers.html');
  const pdfPath = path.join(__dirname, 'AI-Jobs-Australia-Employer-Report-Feb-2026.pdf');

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  console.log(`PDF generated: ${pdfPath}`);
}

main().catch(console.error);
