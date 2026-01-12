import { Dumbbell } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
        <div className="relative bg-primary rounded-xl p-2">
          <Dumbbell className={`${sizeClasses[size]} text-primary-foreground`} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${textClasses[size]}`}>
          <span className="text-foreground">Bassini</span>
          <span className="text-primary">Fit</span>
        </span>
      )}
    </div>
  );
}
