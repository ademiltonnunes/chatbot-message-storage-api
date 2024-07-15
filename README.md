# Quantum Bot Core

Quantum Bot Core is a robust Firebase-powered solution designed to efficiently manage user interactions and securely store conversations for chatbot applications. This project leverages Firebase's real-time database capabilities and authentication features to ensure seamless operation and data security.

## API Documentation

For detailed documentation on how to use the endpoints, refer to [Quantum Bot Core API Documentation](https://us-central1-quantum-bot-core-72974.cloudfunctions.net/swagger)

## Getting Started

To get the project up and running locally or on Firebase, follow these steps:

### Prerequisites

- Node.js (Version 18.20.3 or higher)
- npm (Version 10.7.0 or higher)
- Firebase CLI (install with `npm install -g firebase-tools`)

### Installation Steps

1. **Clone the Project:**

```bash
  git clone https://github.com/ademiltonnunes/chatbot-message-storage-api.git
  cd chatbot-message-storage-api
```


2. **Create a Firebase Project:**
- Navigate to [Firebase Console](https://console.firebase.google.com)
- Create a new project named `quantum-bot-core`
- Disable Google Analytics for this project

3. **Set Firebase Project ID:**
- Find your Project ID (`quantum-bot-core-72974`for example) in Firebase Console
- Update `.firebaserc` with your Project ID

4. **Set up Firebase Web App:**
- Go to Project Settings -> Your Project -> Web App
- Register a new web app and copy the Firebase config (`firebaseConfig`) to `Public/index.js`

5. **Create Firestore Database:**
- Go to Firestore Database -> Create Database -> Start in test mode

6. **Set up Authentication:**
- Go to Authentication -> Get Started -> Enable Email/Password Sign-in method

7. **Upgrade Billing Plan:**
- Go to Project Settings -> Billing -> Upgrade to Blaze plan (set budget to $0)

8. **Save Service Account Key:**
- Go to Project Settings -> Service Accounts -> Firebase Admin SDK -> Generate new private key
- Save the key as `serviceAccount.json` in the `functions` directory

9. **Install Dependencies:**
- Install Firebase CLI and Node dependencies:
  ```
  npm install -g firebase-tools
  npm install firebase
  npm install
  cd functions
  npm install
  ```

10. **Login to Firebase CLI:**
 ```
 firebase login
 ```

11. **Enable Cloud Build API:**
 - Enable Cloud Build API in [Google Cloud Console](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)

12. **Deploy Project:**
 - Select your project:
   ```
   firebase use project-id
   ```
 - Deploy the application:
   ```
   firebase deploy
   ```
 - Deploy only functions:
   ```
   firebase deploy --only functions
   ```

## Usage

- After deployment, your Firebase project will be ready to manage user interactions and store chatbot conversations securely.

## Contributing

- Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

