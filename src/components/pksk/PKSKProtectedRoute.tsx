import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Loader2, Sparkles, Lock, ArrowRight } from 'lucide-react';

export interface PKSKProtectedRouteProps {
  children: React.ReactNode;
  navigate: (route: string) => void;
  redirectTo?: string;
}

/**
 * PKSK Access Control Guard
 * Directly verifies the user's Firestore document in 'users/{userId}'.
 * If pksk_access === true, allows access to the exclusive PKSK simulation portal.
 * If not, immediately redirects to the Purchase Access page.
 */
export const PKSKProtectedRoute: React.FC<PKSKProtectedRouteProps> = ({
  children,
  navigate,
  redirectTo = '/pksk/purchase',
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        if (isMounted) {
          setIsVerifying(false);
          navigate('/login');
        }
        return;
      }

      // Real-time listener for the user's document in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      unsubscribeDoc = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (!isMounted) return;

          if (docSnap.exists()) {
            const data = docSnap.data();
            const accessGranted = data.pksk_access === true;
            setHasAccess(accessGranted);
            setIsVerifying(false);

            if (!accessGranted) {
              navigate(redirectTo);
            }
          } else {
            setHasAccess(false);
            setIsVerifying(false);
            navigate(redirectTo);
          }
        },
        (error) => {
          console.warn('[PKSK Protected Route] Firestore listener error:', error);
          if (isMounted) {
            setHasAccess(false);
            setIsVerifying(false);
            navigate(redirectTo);
          }
        }
      );
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [navigate, redirectTo]);

  if (isVerifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border-2 border-white dark:border-stone-900 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-stone-900" />
          </div>
        </div>
        <h2 className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100 mb-2">
          Mengesahkan Akses Portal PKSK
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mb-6">
          Menyemak status langganan Pentaksiran Kemasukan Sekolah Khusus anda...
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuatkan kelayakan...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-2">
          Akses Eksklusif PKSK Diperlukan
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mb-6">
          Modul simulasi PKSK khusus untuk calon Tahun 6 dan Tingkatan 3 memerlukan akses aktif. Sila dapatkan pas akses untuk membuka simulasi penuh.
        </p>
        <button
          id="pksk-redirect-purchase-btn"
          onClick={() => navigate(redirectTo)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <span>Dapatkan Pas PKSK</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
