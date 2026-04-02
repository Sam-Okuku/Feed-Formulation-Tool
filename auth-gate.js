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

    // ✅ Remove overlay — app is now accessible
    var overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.remove();

    // ✅ Now trigger the install prompt if it was captured
    if (window.__installPromptEvent) {
      var banner = document.getElementById('install-banner');
      var pwaBtn = document.getElementById('pwa-btn');
      if (banner) banner.classList.add('show');
      if (pwaBtn) pwaBtn.classList.add('show');
    }

    // Update login stats
    const sessionInfo = {
      time: new Date().toISOString(),
      device: navigator.userAgent.substring(0, 120),
      language: navigator.language,
      screen: screen.width + 'x' + screen.height
    };
    const history = userData.loginHistory || [];
    history.push(sessionInfo);
    if (history.length > 20) history.splice(0, history.length - 20);
    const recentDevices = history.slice(-10).map(function(h) { return h.device; });
    const uniqueDevices = new Set(recentDevices);
    const isSuspicious = uniqueDevices.size > 4;
    const updateData = {
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      loginCount: firebase.firestore.FieldValue.increment(1),
      loginHistory: history,
      lastDevice: sessionInfo.device,
      lastScreen: sessionInfo.screen
    };
    if (isSuspicious) {
      updateData.flagged = true;
      updateData.flagReason = 'More than 4 unique devices detected';
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