// auth-gate.js — include this on EVERY page of your PWA

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    // Not logged in — redirect to login page
    window.location.href = '/login.html';
    return;
  }

  // Check access in Firestore
  const userDoc = await db.collection('users').doc(user.uid).get();
  
  if (!userDoc.exists) {
    // New user — send them to access code entry
    window.location.href = '/enter-code.html';
    return;
  }

  const userData = userDoc.data();
  
  if (userData.status !== 'active') {
    // Suspended or expired — redirect
    window.location.href = '/access-denied.html';
    return;
  }

  // ✅ All good — show the app
  document.getElementById('app').style.display = 'block';
  
  // Log this session for analytics
  await db.collection('users').doc(user.uid).update({
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    loginCount: firebase.firestore.FieldValue.increment(1)
  });
});
