import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWorkoutTimerOptions {
  initialSeconds: number;
  mode: 'countdown' | 'countup';
  onComplete?: () => void;
  autoStart?: boolean;
}

interface UseWorkoutTimerReturn {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newSeconds?: number) => void;
}

export function useWorkoutTimer({
  initialSeconds,
  mode,
  onComplete,
  autoStart = false,
}: UseWorkoutTimerOptions): UseWorkoutTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete callback fresh
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (mode === 'countdown') {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, mode, clearTimer]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    clearTimer();
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(false);
  }, [initialSeconds, clearTimer]);

  return {
    seconds,
    isRunning,
    isPaused: !isRunning && seconds > 0 && seconds !== initialSeconds,
    start,
    pause,
    resume,
    reset,
  };
}
