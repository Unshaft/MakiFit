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
        bg-surface rounded-3xl p-6
        ${onClick ? 'cursor-pointer hover:bg-dark-light active:scale-98 transition-all' : ''}
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