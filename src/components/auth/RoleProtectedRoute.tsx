import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { UserRole } from '../../types';
import { Loader2 } from 'lucide-react';

export interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[] | ('student' | 'teacher' | 'admin')[];
  navigate: (route: string) => void;
  redirectTo?: string;
  onAccessDenied?: (message: string) => void;
}

/**
 * Strict Role-Based Access Control (RBAC) Route Guard.
 * Directly fetches the authenticated user's role from the Firestore 'users' collection
 * to ensure that client-side state cannot be tampered with.
 *
 * If an unauthorized user (e.g., role === 'student') attempts to access a protected route
 * (e.g., /teacher-dashboard or /teacher/*), they are immediately redirected to the student
 * dashboard with an 'Access Denied' alert.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  navigate,
  redirectTo = '/dashboard',
  onAccessDenied,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (isMounted) {
          setIsVerifying(false);
          navigate('/login');
        }
        return;
      }

      try {
        // STRICT REQUIREMENT: Fetch user role directly from Firestore 'users' collection
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userRole: UserRole = 'student';
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          userRole = (userData.role as UserRole) || 'student';
        } else {
          console.warn(`[RBAC] No user profile document found in Firestore for UID: ${currentUser.uid}`);
        }

        // Validate role against allowed roles
        const hasAccess = allowedRoles.includes(userRole);

        if (!isMounted) return;

        if (hasAccess) {
          setIsAuthorized(true);
          setIsVerifying(false);
        } else {
          // ACCESS DENIED: Student or unauthorized role attempting to access protected route
          const deniedMessage = 'Access Denied: You do not have permission to access the Teacher Portal.';
          console.warn(`[RBAC Access Denied] UID: ${currentUser.uid}, Role: '${userRole}'. Allowed: [${allowedRoles.join(', ')}]`);

          // 1. Store in sessionStorage for persistent display on destination page
          try {
            sessionStorage.setItem('access_denied_alert', deniedMessage);
          } catch (storageErr) {
            console.warn('[RBAC] Could not write to sessionStorage:', storageErr);
          }

          // 2. Invoke callback if provided (e.g., App-level toast / banner state)
          if (onAccessDenied) {
            onAccessDenied(deniedMessage);
          }

          // 3. Trigger native browser alert safely (guarded against iframe restrictions)
          try {
            if (typeof window !== 'undefined' && typeof window.alert === 'function') {
              window.alert(deniedMessage);
            }
          } catch (alertErr) {
            // Ignored in sandboxed iframes
          }

          // 4. Immediately redirect to student dashboard
          setIsVerifying(false);
          navigate(redirectTo);
        }
      } catch (error) {
        console.error('[RBAC] Error querying Firestore users collection:', error);
        if (isMounted) {
          setIsVerifying(false);
          navigate(redirectTo);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [allowedRoles, navigate, redirectTo, onAccessDenied]);

  if (isVerifying) {
    return (
      <div
        id="rbac-verifying-container"
        className="min-h-screen flex flex-col items-center justify-center bg-stone-50/60 dark:bg-stone-950 p-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-bold text-stone-600 dark:text-stone-400">
          Mengesahkan kebenaran akses (RBAC)...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
