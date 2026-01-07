import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Company {
  id: string;
  name: string;
  website: string | null;
}

interface DuplicateGroup {
  normalized: string;
  companies: Company[];
}

async function analyzeCompanies() {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, website')
    .order('name');

  if (error) {
    console.error('Error fetching companies:', error);
    return;
  }

  console.log('\n=== ALL COMPANIES ===\n');
  companies?.forEach((company, index) => {
    console.log(`${index + 1}. ${company.name}`);
    if (company.website) {
      console.log(`   Website: ${company.website}`);
    }
    console.log(`   ID: ${company.id}\n`);
  });

  console.log(`\nTotal: ${companies?.length} companies\n`);

  // Analyze for potential duplicates
  console.log('\n=== POTENTIAL DUPLICATES ANALYSIS ===\n');

  const nameMap = new Map<string, Company[]>();

  companies?.forEach(company => {
    // Normalize name for comparison
    const normalized = company.name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\b(pty|ltd|limited|inc|incorporated|llc|group|australia|au)\b/gi, '')
      .trim();

    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, []);
    }
    nameMap.get(normalized)!.push(company);
  });

  // Find potential duplicates
  const potentialDuplicates: DuplicateGroup[] = [];

  nameMap.forEach((companies, normalizedName) => {
    if (companies.length > 1) {
      potentialDuplicates.push({
        normalized: normalizedName,
        companies: companies
      });
    }
  });

  if (potentialDuplicates.length === 0) {
    console.log('No obvious duplicates found based on name normalization.');
  } else {
    potentialDuplicates.forEach((dup, index) => {
      console.log(`\nDuplicate Group ${index + 1}:`);
      console.log(`Normalized name: "${dup.normalized}"`);
      dup.companies.forEach((company: Company) => {
        console.log(`  - "${company.name}" (ID: ${company.id.substring(0, 8)}...)`);
        if (company.website) {
          console.log(`    Website: ${company.website}`);
        }
      });
    });
  }

  // Also check for very similar names
  console.log('\n\n=== SIMILAR NAME PATTERNS ===\n');
  const allNames = companies?.map(c => c.name) || [];
  const similarGroups: Record<string, string[]> = {};

  allNames.forEach((name, i) => {
    allNames.forEach((otherName, j) => {
      if (i >= j) return;

      const name1 = name.toLowerCase();
      const name2 = otherName.toLowerCase();

      // Check if one is a substring of the other
      if (name1.includes(name2) || name2.includes(name1)) {
        const key = [name, otherName].sort().join('|||');
        if (!similarGroups[key]) {
          similarGroups[key] = [name, otherName];
        }
      }
    });
  });

  const similarGroupsArray = Object.values(similarGroups);
  if (similarGroupsArray.length > 0) {
    similarGroupsArray.forEach((group: string[], index) => {
      console.log(`\nSimilar Group ${index + 1}:`);
      group.forEach((name: string) => {
        const company = companies?.find(c => c.name === name);
        console.log(`  - "${name}" (ID: ${company?.id.substring(0, 8)}...)`);
        if (company?.website) {
          console.log(`    Website: ${company.website}`);
        }
      });
    });
  }
}

analyzeCompanies();
