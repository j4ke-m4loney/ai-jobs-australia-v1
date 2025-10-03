export function formatSalary(
  min: number | null,
  max: number | null,
  period: string = 'year'
): string | null {
  if (!min && !max) return null;

  // Get the period display text
  const periodText = getPeriodText(period);

  // If min and max are the same, show only one value
  if (min && max && min === max) {
    return `$${min.toLocaleString()}${periodText}`;
  }

  // If both min and max exist and are different, show range
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}${periodText}`;
  }

  // If only min exists
  if (min) {
    return `From $${min.toLocaleString()}${periodText}`;
  }

  // If only max exists
  if (max) {
    return `Up to $${max.toLocaleString()}${periodText}`;
  }

  return null;
}

function getPeriodText(period: string): string {
  const periodMap: { [key: string]: string } = {
    hour: ' an hr',
    day: ' per day',
    week: ' per wk',
    month: ' per mo',
    year: ' per yr',
  };

  return periodMap[period] || ' per yr';
}
