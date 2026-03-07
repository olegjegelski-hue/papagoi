/**
 * Sektsioonide vahele paigutatav dekoratiivne riba (brändi motiiv: suled/laine).
 * Kasutamine: <SectionDivider /> või <SectionDivider variant="wave" />
 */
export default function SectionDivider({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'wave';
  className?: string;
}) {
  return (
    <div
      className={`papagoi-section-divider ${variant === 'wave' ? 'papagoi-section-divider--wave' : ''} ${className}`}
      aria-hidden
    />
  );
}
