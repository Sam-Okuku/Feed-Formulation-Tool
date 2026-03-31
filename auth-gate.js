auth.onAuthStateChanged(async function(user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      window.location.href = 'enter-code.html';
      return;
    }
    const userData = userDoc.data();
    if (!userData || userData.status !== 'active') {
      window.location.href = 'access-denied.html';
      return;
    }
    document.body.classList.add('auth-ready');
    db.collection('users').doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      loginCount: firebase.firestore.FieldValue.increment(1)
    });
  } catch (error) {
    console.error('Auth error:', error.code, error.message);
    if (error.code === 'permission-denied') {
      window.location.href = 'enter-code.html';
      return;
    }
    window.location.href = 'login.html';
  }
});