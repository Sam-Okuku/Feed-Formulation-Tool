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

    // ✅ Valid user — remove overlay and show app
    var overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.remove();

    // Build session fingerprint
    const sessionInfo = {
      time: new Date().toISOString(),
      device: navigator.userAgent.substring(0, 120),
      language: navigator.language,
      screen: screen.width + 'x' + screen.height
    };

    // Get existing login history
    const history = userData.loginHistory || [];

    // Keep only last 20 sessions
    history.push(sessionInfo);
    if (history.length > 20) history.splice(0, history.length - 20);

    // Check for abuse — more than 4 different devices in last 10 logins
    const recentDevices = history.slice(-10).map(function(h) {
      return h.device;
    });
    const uniqueDevices = new Set(recentDevices);
    const isSuspicious = uniqueDevices.size > 4;

    // Update user document with session data
    const updateData = {
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      loginCount: firebase.firestore.FieldValue.increment(1),
      loginHistory: history,
      lastDevice: sessionInfo.device,
      lastScreen: sessionInfo.screen
    };

    // Add flag if suspicious
    if (isSuspicious) {
      updateData.flagged = true;
      updateData.flagReason = 'More than 4 unique devices detected — possible account sharing';
    }

    await db.collection('users').doc(user.uid).update(updateData);

  } catch (error) {
    console.error('Auth error:', error.code, error.message);
    if (error.code === 'permission-denied') {
      window.location.href = 'enter-code.html';
      return;
    }
    window.location.href = 'login.html';
  }
});