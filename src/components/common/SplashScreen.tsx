import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
}

const LOADING_PHRASES = [
  'Penyediaan Nota KSSM Baharu...',
  'Memuatkan Kuiz Interaktif...',
  'Menyelaraskan Progress Anda...',
  'Mengaktifkan Streak Pembelajaran...',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Cycle phrases every 700ms
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 700);

    return () => clearInterval(phraseInterval);
  }, []);

  // Animate progress bar to 100% over ~2800ms, then trigger fade out at 3000ms
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // time to reach ~100%

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 40);

    // Complete and fade out around 3 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3000);

    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      id="splash-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-md mx-auto text-center flex flex-col items-center justify-center">
        {/* Logo with light/dark mode support */}
        <img
          src="/logo-light.png"
          alt="Logo"
          className="h-20 w-auto mb-4 mx-auto block dark:hidden object-contain"
          referrerPolicy="no-referrer"
        />
        <img
          src="/logo-dark.png"
          alt="Logo"
          className="h-20 w-auto mb-4 mx-auto hidden dark:block object-contain"
          referrerPolicy="no-referrer"
        />

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Selamat Datang ke study.dermaa!
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          Platform Pembelajaran Online KSSM Terunggul.
        </p>

        {/* Progress Bar Container */}
        <div className="w-64 sm:w-80 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner mx-auto mb-4 relative">
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Loading Text */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-300">
            {LOADING_PHRASES[phraseIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};
