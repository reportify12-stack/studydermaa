/**
 * study.dermaa - Admin Initialization Script
 * 
 * Usage:
 *   npx tsx scripts/setAdminClaim.ts <UID_OR_EMAIL_OR_USERNAME>
 * 
 * Prerequisites:
 *   Set GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to your Firebase Service Account JSON,
 *   or provide FIREBASE_SERVICE_ACCOUNT / FIREBASE_CONFIG in environment.
 * 
 * Example:
 *   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
 *   npx tsx scripts/setAdminClaim.ts admin_dermaa
 */

import { initializeApp, getApps, getApp, cert, applicationDefault, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

async function initializeAdminSdk(): Promise<App> {
  if (getApps().length > 0) {
    return getApp();
  }

  // 1. Check if GOOGLE_APPLICATION_CREDENTIALS is set
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && fs.existsSync(credPath)) {
    console.log(`[Firebase Admin] Loading credentials from file: ${credPath}`);
    const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  // 2. Check if FIREBASE_SERVICE_ACCOUNT raw JSON string or base64 is set
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawServiceAccount) {
    try {
      const decoded = rawServiceAccount.startsWith('{')
        ? JSON.parse(rawServiceAccount)
        : JSON.parse(Buffer.from(rawServiceAccount, 'base64').toString('utf8'));
      console.log('[Firebase Admin] Initializing from FIREBASE_SERVICE_ACCOUNT environment variable.');
      return initializeApp({
        credential: cert(decoded),
      });
    } catch (e) {
      console.error('[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  // 3. Fallback to default application credentials (GCP / Cloud Run environment)
  console.log('[Firebase Admin] Initializing with default application credentials...');
  return initializeApp({
    credential: applicationDefault(),
  });
}

async function main() {
  const targetIdentifier = process.argv[2];

  if (!targetIdentifier) {
    console.error(`
=============================================================================
  study.dermaa - Administrator Provisioning Tool
=============================================================================

Error: Missing target identifier (UID, Email, or Username).

Usage:
  npx tsx scripts/setAdminClaim.ts <TARGET_UID_OR_EMAIL_OR_USERNAME>

Examples:
  npx tsx scripts/setAdminClaim.ts admin@dermaa.edu.my
  npx tsx scripts/setAdminClaim.ts cikgu_dermaa
  npx tsx scripts/setAdminClaim.ts 4wX7pLk90zYbN2QvR8sM

Prerequisites:
  1. Download Service Account Key from Firebase Console:
     Project Settings -> Service accounts -> Generate new private key
  2. Set environment variable:
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
=============================================================================
    `);
    process.exit(1);
  }

  try {
    const app = await initializeAdminSdk();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    console.log(`\n🔍 Searching for user identifier: "${targetIdentifier}"...`);

    let targetUid = '';
    let targetEmail = '';
    let targetDisplayName = '';

    // Step A: Check if identifier looks like email
    if (targetIdentifier.includes('@')) {
      try {
        const userRecord = await auth.getUserByEmail(targetIdentifier.trim().toLowerCase());
        targetUid = userRecord.uid;
        targetEmail = userRecord.email || targetIdentifier;
        targetDisplayName = userRecord.displayName || '';
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          console.error(`❌ User with email "${targetIdentifier}" was not found in Firebase Auth.`);
          process.exit(1);
        }
        throw err;
      }
    } else {
      // Step B: Check if targetIdentifier is a direct UID in Auth
      try {
        const userRecord = await auth.getUser(targetIdentifier.trim());
        targetUid = userRecord.uid;
        targetEmail = userRecord.email || '';
        targetDisplayName = userRecord.displayName || '';
      } catch (err: any) {
        // Step C: Check if targetIdentifier is a username in Firestore usernameRegistry
        const usernameLower = targetIdentifier.trim().toLowerCase();
        const regSnap = await firestore.collection('usernameRegistry').doc(usernameLower).get();

        if (regSnap.exists) {
          const regData = regSnap.data();
          targetUid = regData?.uid || '';
          targetEmail = regData?.authEmail || '';
          console.log(`✅ Found username "${usernameLower}" mapped to UID: ${targetUid}`);
        } else {
          console.error(`❌ Identifier "${targetIdentifier}" is neither a valid UID nor an existing username in usernameRegistry.`);
          process.exit(1);
        }
      }
    }

    if (!targetUid) {
      console.error('❌ Could not resolve target UID.');
      process.exit(1);
    }

    console.log(`\n📌 Target User Resolved:`);
    console.log(`   - UID: ${targetUid}`);
    console.log(`   - Email: ${targetEmail || '(none)'}`);
    console.log(`   - Display Name: ${targetDisplayName || '(none)'}`);

    // Step D: Set Custom User Claim { admin: true } in Firebase Auth
    console.log(`\n⚡ Setting Custom User Claim: { admin: true } ...`);
    await auth.setCustomUserClaims(targetUid, { admin: true });
    console.log(`✅ Firebase Auth custom claims updated successfully.`);

    // Step E: Update Firestore users/{uid} document with role: 'admin'
    console.log(`\n⚡ Updating Firestore document "users/${targetUid}" to role: 'admin' ...`);
    const userDocRef = firestore.collection('users').doc(targetUid);
    const userDocSnap = await userDocRef.get();

    const timestamp = new Date().toISOString();
    if (userDocSnap.exists) {
      await userDocRef.update({
        role: 'admin',
        updatedAt: timestamp,
      });
      console.log(`✅ Firestore user profile updated to role: 'admin'.`);
    } else {
      await userDocRef.set({
        uid: targetUid,
        username: targetDisplayName || targetEmail.split('@')[0] || 'admin',
        usernameLowercase: (targetDisplayName || targetEmail.split('@')[0] || 'admin').toLowerCase(),
        fullName: targetDisplayName || 'Pentadbir Sistem',
        email: targetEmail,
        authEmail: targetEmail,
        tingkatan: 'Tingkatan 1',
        role: 'admin',
        xp: 0,
        level: 1,
        streak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        completedNotesCount: 0,
        completedQuizzesCount: 0,
        bookmarks: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      }, { merge: true });
      console.log(`✅ Created Firestore user profile with role: 'admin'.`);
    }

    // Step F: Verification and Instructions
    const updatedUser = await auth.getUser(targetUid);
    console.log(`\n=============================================================================`);
    console.log(`🎉 SUCCESS: User has been granted full ADMINISTRATOR privileges!`);
    console.log(`=============================================================================`);
    console.log(`Verified Claims:`, updatedUser.customClaims);
    console.log(`\nℹ️  NEXT STEPS FOR THE USER:`);
    console.log(`1. If the administrator is currently logged into the browser, they must`);
    console.log(`   log out and log back in, or refresh their token for the changes to take effect.`);
    console.log(`2. Access the Admin Panel at: /admin`);
    console.log(`=============================================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal Error during admin provisioning:', error);
    process.exit(1);
  }
}

main();
