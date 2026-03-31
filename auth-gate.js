// auth-gate.js
// Waits for Firebase to fully load before checking auth

function waitForFirebase() {
  return new Promise(function(resolve) {
    const unsubscribe = auth.onAuthStateChanged(function(user) {
      unsubscribe();
      resolve(user);
    });
  });
}

async function initAuthGate() {
  try {
    const user = await waitForFirebase();

    // No user logged in — go to login
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // User logged in — check their Firestore record
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      // No record yet — send to enter access code
      window.location.href = 'enter-code.html';
      return;
    }

    const userData = userDoc.data();

    if (userData.status !== 'active') {
      // Account not active
      window.location.href = 'access-denied.html';
      return;
    }

    // ✅ All good — show the tool
    document.getElementById('app').style.display = 'block';

    // Log the session
    await db.collection('users').doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      loginCount: firebase.firestore.FieldValue.increment(1)
    });

  } catch (error) {
    console.error('Auth gate error:', error.code, error.message);

    // If it's a Firestore permission error, show a helpful message
    // instead of looping back to login forever
    if (error.code === 'permission-denied') {
      alert('Access error: Firestore rules are blocking access. Please contact support.');
      return;
    }

    window.location.href = 'login.html';
  }
}

// Run the gate
initAuthGate();
```

---

Save `auth-gate.js` then push to GitHub:
```
git add .
git commit -m "Fix auth gate and open Firestore rules temporarily"
git push