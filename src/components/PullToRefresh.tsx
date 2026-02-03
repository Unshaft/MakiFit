import { useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { hapticMedium } from '../utils/haptics';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const THRESHOLD = 80;

export function PullToRefresh({ children, onRefresh, className = '' }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (refreshing) return;
    if (containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance to the pull
      const resistance = Math.min(diff * 0.5, THRESHOLD * 1.5);
      setPullDistance(resistance);

      // Haptic at threshold
      if (resistance >= THRESHOLD && pullDistance < THRESHOLD) {
        hapticMedium();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);

      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  };

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          top: pullDistance - 40,
          opacity: progress,
        }}
      >
        <div
          className={`
            w-10 h-10 bg-surface rounded-full flex items-center justify-center shadow-lg
            ${refreshing ? 'animate-spin' : ''}
          `}
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
          }}
        >
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
