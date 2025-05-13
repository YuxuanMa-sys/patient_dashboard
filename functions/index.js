const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.createPatient = functions.https.onCall(async (data, context) => {
  try {
    // Optionally check if `context.auth` user is an admin
    // if (!context.auth || !context.auth.token.isAdmin) {
    //   throw new functions.https.HttpsError('permission-denied', 'Only admins can do this.');
    // }

    // 1) Create a new user in Firebase Auth with a phone number (no OTP)
    const userRecord = await admin.auth().createUser({
      phoneNumber: data.phoneNumber,
      displayName: data.fname + ' ' + data.lname,
    });

    // 2) Create a Firestore doc referencing that user
    const db = admin.firestore();
    const patientData = {
      uid: userRecord.uid,
      phoneNumber: data.phoneNumber,
      fname: data.fname,
      lname: data.lname,
      createdAt: new Date(),
      // any other fields...
    };
    const docRef = await db.collection('patients').add(patientData);

    return { success: true, uid: userRecord.uid, docId: docRef.id };
  } catch (error) {
    console.error('Error creating phone user:', error);
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});
