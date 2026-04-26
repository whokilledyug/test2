interface SeverityBadgeProps {
  severity: string | null;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (!severity) return null;
  const cls = `severity-${severity.toLowerCase()}`;
  return <span className={cls}>{severity}</span>;
}
