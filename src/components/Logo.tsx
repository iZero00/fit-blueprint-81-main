interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src="/images/logo bassinifit.png"
        alt="BassiniFit"
        className={`${sizeClasses[size]} w-auto`}
      />
      {!showText && <span className="sr-only">BassiniFit</span>}
    </div>
  );
}
