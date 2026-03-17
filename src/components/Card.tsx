import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  style?: CSSProperties;
}

export function Card({ children, className = '', onClick, animate = false, style }: CardProps) {
  return (
    <div
      className={`
        bg-(--off) rounded-2xl p-5
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all touch-feedback' : ''}
        ${animate ? 'animate-fade-in' : ''}
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
