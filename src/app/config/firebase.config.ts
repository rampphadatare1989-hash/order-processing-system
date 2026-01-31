/**
 * Firebase Web SDK Configuration
 * Project: order-processing-system-619b4
 * NOTE: These are PUBLIC keys - safe for client-side use
 */
export const firebaseConfig = {
  apiKey: "AIzaSyAx2_a_your_web_api_key_here",
  authDomain: "order-processing-system-619b4.firebaseapp.com",
  projectId: "order-processing-system-619b4",
  storageBucket: "order-processing-system-619b4.appspot.com",
  messagingSenderId: "113736093111849839797",
  appId: "1:113736093111849839797:web:your_app_id_here",
  databaseURL: "https://order-processing-system-619b4.firebaseio.com"
};

/**
 * Service Account Configuration
 * SECURITY WARNING: This should NEVER be in client-side code!
 * Move this to your backend .env file or secure vault
 * Only included here for reference
 */
export const serviceAccountConfig = {
  type: "service_account",
  project_id: "order-processing-system-619b4",
  private_key_id: "ef96ec24dd642daa5d5d50ec8f6c6ac49c87efda",
  client_email: "firebase-adminsdk-fbsvc@order-processing-system-619b4.iam.gserviceaccount.com",
  client_id: "113736093111849839797",
  private_key: "" // Note: Private key is never used on client-side
};

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Get Web API Key:
 *    - Go to Firebase Console > Project Settings
 *    - Select your web app
 *    - Copy the API Key
 *    - Replace 'AIzaSyAx2_a_your_web_api_key_here' above
 * 
 * 2. Get App ID:
 *    - From same Firebase Console > Project Settings page
 *    - Copy the App ID (format: 1:xxx:web:xxx)
 *    - Replace 'your_app_id_here' above
 * 
 * 3. Verify Database URLs:
 *    - Firestore: Automatically configured
 *    - Realtime DB: projectId.firebaseio.com
 * 
 * 4. Security Rules:
 *    - Set appropriate rules in Firebase Console
 *    - Start with development rules if testing
 * 
 * 5. Service Account:
 *    - Store ONLY on your backend server
 *    - Use environment variables
 *    - Never commit to client-side code
 */
