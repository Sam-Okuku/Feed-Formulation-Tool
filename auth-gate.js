// auth-gate.js
// This runs on every page load and checks if the user is allowed in

auth.onAuthStateChanged(async function(user) {

  // No user logged in — send to login page
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // User is logged in — now check their status in Firestore
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      // Logged in but no record yet — send to enter access code
      window.location.href = 'enter-code.html';
      return;
    }

    const userData = userDoc.data();

    if (userData.status !== 'active') {
      // Account suspended or expired
      window.location.href = 'access-denied.html';
      return;
    }

    // ✅ All checks passed — show the tool
    document.getElementById('app').style.display = 'block';

    // Record this login for analytics
    await db.collection('users').doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      loginCount: firebase.firestore.FieldValue.increment(1)
    });

  } catch (error) {
    console.error('Auth gate error:', error);
    // If something goes wrong, play it safe and redirect to login
    window.location.href = 'login.html';
  }

});