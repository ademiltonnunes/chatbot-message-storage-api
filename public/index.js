import firebaseConfig from './firebaseConfig.js';
  
  firebase.initializeApp(firebaseConfig);
  
  // Generate login with user's email and password
  document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
          const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
          const idToken = await userCredential.user.getIdToken();
          document.getElementById('token').value = idToken;
      } catch (error) {
          console.error('Error logging in:', error);
          document.getElementById('token').value = 'Login failed';
      }
  });

  // Google Sign-In
const googleSignInBtn = document.getElementById('google-sign-in');
googleSignInBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const userCredential = await firebase.auth().signInWithPopup(provider);
        const idToken = await userCredential.user.getIdToken();
        document.getElementById('token').value = idToken;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        document.getElementById('token').value = 'Google Sign-In failed';
    }
});
  