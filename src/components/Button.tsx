import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from 'react';
import { hapticLight } from '../utils/haptics';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  haptic?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  haptic = true,
  onClick,
  ...props
}: ButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (haptic && !disabled) hapticLight();
    onClick?.(e);
  };

  const baseStyles = 'font-syne font-bold rounded-xl transition-all duration-200 active:scale-[0.97] active:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:     'bg-(--ink) text-white',
    secondary:   'bg-(--warning) text-(--ink)',
    outline:     'border-[1.5px] border-(--ink) text-(--ink) bg-transparent',
    ghost:       'text-(--muted)',
    destructive: 'border-[1.5px] border-(--marianne) text-(--marianne) bg-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
    xl: 'px-8 py-5 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
