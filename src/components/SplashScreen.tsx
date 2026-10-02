import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 400 : 1200;

    const timer = setTimeout(() => {
      setFadingOut(true);
      const exitTimer = setTimeout(() => {
        onFinish();
      }, prefersReducedMotion ? 50 : 350);
      return () => clearTimeout(exitTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-label="Loading SpeedTest"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center px-4 animate-fade-in">
        {/* Logo Icon */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-2xl">
            <Activity className="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
          SpeedTest
        </h1>

        {/* Subtitle brand requirement */}
        <p className="mt-3 text-sm sm:text-base font-medium text-slate-400 tracking-wide flex items-center gap-1.5">
          <span>Made with</span>
          <span className="text-red-500 inline-block animate-pulse select-none" aria-hidden="true">♥</span>
          <span>by Sanjid</span>
        </p>

        {/* Subtle loader bar */}
        <div className="mt-6 w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 w-full animate-progress" />
        </div>
      </div>
    </div>
  );
};
