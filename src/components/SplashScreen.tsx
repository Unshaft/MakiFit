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
      setTimeout(onComplete, 400);
    }, minDuration);
    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div className={`fixed inset-0 z-100 bg-white flex flex-col items-center justify-center transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="animate-fade-in">
        <img src="/web-app-manifest-192x192.png" alt="MakiFit" className="w-24 h-24 rounded-3xl" />
      </div>

      <h1 className="font-syne font-extrabold text-4xl mt-6 text-(--ink) animate-fade-in delay-5 leading-hero">
        MakiFit
      </h1>

      <p className="text-(--muted) mt-2 text-sm animate-fade-in delay-8">
        Bougez ensemble
      </p>

      <div className="flex gap-1.5 mt-10 animate-fade-in delay-10">
        <span className="w-1.5 h-1.5 bg-(--ink) rounded-full animate-pulse" />
        <span className="w-1.5 h-1.5 bg-(--ink) rounded-full animate-pulse delay-5" />
        <span className="w-1.5 h-1.5 bg-(--ink) rounded-full animate-pulse delay-10" />
      </div>
    </div>
  );
}
