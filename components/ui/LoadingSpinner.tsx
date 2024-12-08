interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`animate-spin ${className}`}>
      {/* Your spinner SVG or content */}
    </div>
  );
} 