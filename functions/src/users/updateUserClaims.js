import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';

// Make sure Firebase Admin is initialized
if (getApps().length === 0) {
  initializeApp();
}

/**
 * Cloud function to update user custom claims
 * This function must be called with appropriate permissions
 * @param {Object} data - Data containing userId and role
 * @returns {Promise<Object>} - Response confirming the update
 */
export const updateUserClaims = onCall({
  cors: [
    "http://localhost:3030",
    "https://madinia-dashboard.web.app",
    "https://madinia-dashboard.firebaseapp.com"
  ]
}, async (request) => {
  const { data, auth } = request;

  // Check if caller is authenticated
  if (!auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in to perform this action.'
    );
  }

  // Get current claims of the calling user
  const callerUid = auth.uid;
  const callerUser = await getAuth().getUser(callerUid);
  const callerClaims = callerUser.customClaims || {};

  // Check if caller has admin or super_admin rights
  if (callerClaims.role !== 'admin' && callerClaims.role !== 'super_admin' && callerClaims.role !== 'dev') {
    throw new HttpsError(
      'permission-denied',
      'You do not have the necessary permissions to modify roles.'
    );
  }

  // Check required parameters
  const { userId, role, displayName } = data;
  if (!userId || !role) {
    throw new HttpsError(
      'invalid-argument',
      'Parameters userId and role are required.'
    );
  }

  try {
    // Update custom claims
    await getAuth().setCustomUserClaims(userId, {
      role,
      displayName: displayName || '',
      // Add other claims if needed
    });

    // Update displayName if provided
    if (displayName) {
      try {
        await getAuth().updateUser(userId, { displayName });
      } catch (displayNameError) {
        console.error('Error updating displayName:', displayNameError);
        // Don't block if this part fails
      }
    }

    // Log the operation
    console.log(`Claims updated for user ${userId}: role=${role}`);

    return { success: true, message: 'Custom claims updated successfully' };
  } catch (error) {
    console.error('Error updating custom claims:', error);
    throw new HttpsError(
      'internal',
      `Error updating custom claims: ${error.message}`
    );
  }
});
