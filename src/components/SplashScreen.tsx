import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 1500 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500); // Wait for fade animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={`
        fixed inset-0 z-[100] bg-dark flex flex-col items-center justify-center
        transition-opacity duration-500
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Logo with bounce animation */}
      <div className="animate-bounce-in">
        <img
          src="/web-app-manifest-192x192.png"
          alt="MakiFit"
          className="w-32 h-32 drop-shadow-2xl"
        />
      </div>

      {/* App name with fade in */}
      <h1
        className="text-4xl font-bold mt-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        MakiFit
      </h1>

      {/* Tagline */}
      <p
        className="text-text-muted mt-2 animate-fade-in"
        style={{ animationDelay: '0.5s' }}
      >
        Bougez ensemble
      </p>

      {/* Loading dots */}
      <div
        className="flex gap-2 mt-8 animate-fade-in"
        style={{ animationDelay: '0.7s' }}
      >
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}
