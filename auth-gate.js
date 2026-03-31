// auth-gate.js — Clean version using body visibility

async function initAuthGate() {

  auth.onAuthStateChanged(async function(user) {

    // No user — go to login
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      // Check Firestore for user record
      const userDoc = await db
        .collection('users')
        .doc(user.uid)
        .get();

      // No record — needs access code
      if (!userDoc.exists) {
        window.location.href = 'enter-code.html';
        return;
      }

      const userData = userDoc.data();

      // Account not active
      if (!userData || userData.status !== 'active') {
        window.location.href = 'access-denied.html';
        return;
      }

      // ✅ Valid user — reveal the page
      document.body.classList.add('auth-ready');

      // Update login stats silently
      db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        loginCount: firebase.firestore.FieldValue.increment(1)
      }).catch(function(e) {
        console.log('Stats update:', e.message);
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
}

initAuthGate();
```

---