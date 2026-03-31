// auth-gate.js — Final secure version

async function initAuthGate() {
  return new Promise(function(resolve) {

    auth.onAuthStateChanged(async function(user) {

      // No user logged in — go to login page
      if (!user) {
        window.location.href = 'login.html';
        resolve();
        return;
      }

      try {
        // Check if this user has a record in Firestore
        const userDoc = await db
          .collection('users')
          .doc(user.uid)
          .get();

        // No Firestore record = new user, needs a code
        if (!userDoc.exists) {
          window.location.href = 'enter-code.html';
          resolve();
          return;
        }

        const userData = userDoc.data();

        // Account exists but is not active
        if (!userData || userData.status !== 'active') {
          window.location.href = 'access-denied.html';
          resolve();
          return;
        }

        // ✅ User is valid and active — show the tool
        const appDiv = document.getElementById('app');
        if (appDiv) {
          appDiv.style.display = 'block';
        }

        // Update last login silently
        db.collection('users').doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          loginCount: firebase.firestore.FieldValue.increment(1)
        }).catch(function(e) {
          console.log('Login update error:', e);
        });

      } catch (error) {
        console.error('Auth gate error:', error.code, error.message);

        if (error.code === 'permission-denied') {
          // Firestore blocked — user has no record, send to code page
          window.location.href = 'enter-code.html';
          resolve();
          return;
        }

        // Any other error — back to login
        window.location.href = 'login.html';
        resolve();
      }

      resolve();
    });
  });
}

initAuthGate();