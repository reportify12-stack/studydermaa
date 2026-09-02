import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, getIdTokenResult } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { fetchUserProfile, logoutUser } from '../firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isStudent: boolean;
  hasAdminClaim: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  forceRefreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasAdminClaim, setHasAdminClaim] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkClaims = useCallback(async (user: FirebaseUser, forceRefresh = false) => {
    try {
      const tokenResult = await getIdTokenResult(user, forceRefresh);
      const isAdminToken = !!tokenResult.claims.admin;
      setHasAdminClaim(isAdminToken);
      return isAdminToken;
    } catch (err) {
      console.warn('Error fetching token claims:', err);
      setHasAdminClaim(false);
      return false;
    }
  }, []);

  const forceRefreshToken = useCallback(async () => {
    if (!auth.currentUser) return false;
    return await checkClaims(auth.currentUser, true);
  }, [checkClaims]);

  const refreshProfile = useCallback(async () => {
    if (!currentUser) {
      setUserProfile(null);
      setHasAdminClaim(false);
      return;
    }
    try {
      const [profile] = await Promise.all([
        fetchUserProfile(currentUser.uid),
        checkClaims(currentUser, true),
      ]);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, [currentUser, checkClaims]);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (user) {
        // Check ID token custom claims
        checkClaims(user, false);

        // Real-time listener for the active user's own profile
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            } else {
              setUserProfile(null);
            }
            setIsLoading(false);
          },
          async (err) => {
            console.warn('[Firestore] Snapshot listener on user profile encountered a temporary delay or rule check:', err.message);
            // Fallback attempt with fetchUserProfile in case of listener latency
            try {
              const fallbackProfile = await fetchUserProfile(user.uid);
              if (fallbackProfile) {
                setUserProfile(fallbackProfile);
              }
            } catch (fallbackErr) {
              console.warn('[Firestore] Fallback profile fetch delayed:', fallbackErr);
            } finally {
              setIsLoading(false);
            }
          }
        );
      } else {
        setUserProfile(null);
        setHasAdminClaim(false);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, [checkClaims]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserProfile(null);
      setCurrentUser(null);
      setHasAdminClaim(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const ADMIN_EMAILS = ['reportify12@gmail.com'];

  const isEmailAdmin =
    (currentUser?.email ? ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false) ||
    (userProfile?.email ? ADMIN_EMAILS.includes(userProfile.email.toLowerCase()) : false);

  const isAdmin = userProfile?.role === 'admin' || hasAdminClaim || isEmailAdmin;
  const role: UserRole | null = isAdmin ? 'admin' : (userProfile?.role || (currentUser ? 'student' : null));
  const isStudent = !isAdmin && (userProfile?.role === 'student' || (!userProfile && !!currentUser));

  // If user matches admin criteria but Firestore doc role is not 'admin', sync it automatically
  useEffect(() => {
    if (currentUser && userProfile && isEmailAdmin && userProfile.role !== 'admin') {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { role: 'admin' }, { merge: true }).catch((err) => {
        console.warn('Could not auto-sync admin role to Firestore:', err);
      });
    }
  }, [currentUser, userProfile, isEmailAdmin]);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        userProfile,
        role,
        isAdmin,
        isStudent,
        hasAdminClaim,
        loading: isLoading,
        isLoading,
        error,
        refreshProfile,
        forceRefreshToken,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
