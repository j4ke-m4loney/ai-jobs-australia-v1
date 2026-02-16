import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface CompanyMatch {
  id: string;
  name: string;
}

/**
 * Use Claude to find the best matching company from the database.
 * Returns the match or null if none found.
 */
export async function matchCompany(
  extractedName: string,
  companies: { id: string; name: string }[]
): Promise<CompanyMatch | null> {
  if (!extractedName || companies.length === 0) return null;

  // Build a compact list: "id|name" per line
  const companyList = companies.map((c) => `${c.id}|${c.name}`).join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 128,
    system: `You match company names. Given an extracted company name and a list of existing companies (id|name), find the best match from the list.

Rules:
- Match even if names differ in form: abbreviations, trading names, formal vs informal, with/without suffixes like "Pty Ltd", "Inc", "Australia"
- Examples: "Commonwealth Bank" matches "CommBank"; "National Australia Bank" matches "NAB"; "Canva Pty Ltd" matches "Canva"
- Only match if you are confident it is the SAME company
- IMPORTANT: Return the id and name EXACTLY as they appear in the provided list — never modify the name

Return ONLY a JSON object, no markdown:
- If match found: {"id":"<id>","name":"<name>"}
- If no match: {"id":null,"name":null}`,
    messages: [
      {
        role: 'user',
        content: `Extracted company name: "${extractedName}"\n\nExisting companies:\n${companyList}`,
      },
    ],
  });

  const textContent = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  if (!textContent) return null;

  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const result = JSON.parse(jsonMatch[0]);
    if (result.id && result.name) {
      return { id: result.id, name: result.name };
    }
  } catch {
    // Parse failure — no match
  }

  return null;
}
