interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max,
  color = 'primary',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-(--ink)',
    secondary: 'bg-(--warning)',
    accent: 'bg-(--accent)',
    success: 'bg-(--success)',
  };

  const sizes = {
    sm: 'h-[5px]',
    md: 'h-[6px]',
    lg: 'h-[6px]',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-(--line) rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-(--muted)">
          <span>{value} pts</span>
          <span>{max} pts</span>
        </div>
      )}
    </div>
  );
}
