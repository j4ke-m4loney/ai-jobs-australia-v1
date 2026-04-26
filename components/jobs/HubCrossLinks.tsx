import Link from 'next/link';

// Renders a "Related searches" block at the bottom of /jobs/seniority/*,
// /jobs/type/*, and /jobs/salary/* hub pages. Each hub points to its
// siblings on the OTHER axes — a senior page links to salary tiers and
// job types, etc. The current page is excluded so we don't link to self.
//
// Internal cross-linking does two things: helps users explore adjacent
// queries, and tells Google that all hub pages reinforce each other
// (prevents Google from treating them as isolated thin pages).

interface CrossLinkItem {
  href: string;
  label: string;
}

const ALL_LINKS: CrossLinkItem[] = [
  { href: '/jobs/seniority/senior', label: 'Senior AI Jobs' },
  { href: '/jobs/type/contract', label: 'Contract AI Jobs' },
  { href: '/jobs/type/internship', label: 'AI Internships' },
  { href: '/jobs/salary/100k-plus', label: 'AI Jobs $100k+' },
  { href: '/jobs/salary/120k-plus', label: 'AI Jobs $120k+' },
  { href: '/jobs/salary/150k-plus', label: 'AI Jobs $150k+' },
  { href: '/jobs/salary/200k-plus', label: 'AI Jobs $200k+' },
];

interface HubCrossLinksProps {
  /** Path of the current hub page so we can omit it from the list. */
  currentHref: string;
}

export function HubCrossLinks({ currentHref }: HubCrossLinksProps) {
  const links = ALL_LINKS.filter(link => link.href !== currentHref);

  return (
    <nav aria-label="Related job searches" className="mt-12 pt-8 border-t border-border">
      <h2 className="text-lg font-semibold mb-4">Related searches</h2>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-primary hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
