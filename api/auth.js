// ~/api/auth.js

let axios;
let apiClient;

// Fonction pour initialiser apiClient
const initializeApiClient = async () => {
  if (!apiClient) {
    axios = (await import('axios')).default;
    apiClient = axios.create({
      baseURL: 'http://localhost:8000/api', // Assurez-vous que cette URL correspond à votre backend Express
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
};

// Fonction pour se connecter
const login = async (email, password) => {
  await initializeApiClient();
  return apiClient.post('/login', { email, password });
};

// Fonction pour s'inscrire
const register = async (email, password) => {
  await initializeApiClient();
  return apiClient.post('/register', { email, password });
};

// Fonction pour vérifier le code de vérification de l'email
const verifyEmail = async (verificationCode) => {
  await initializeApiClient();
  return apiClient.post('/verify_email', { code: verificationCode });
};

// Fonction pour envoyer un code de vérification de l'email
const sendVerificationEmailCode = async (email) => {
  await initializeApiClient();
  return apiClient.post('/send_verification_email_code', { email });
};

// Fonction pour réinitialiser le mot de passe
const resetPassword = async (userId, newPassword) => {
  await initializeApiClient();
  return apiClient.post(`/users/${userId}/settings/change_password`, { newPassword });
};

// Fonction pour envoyer un code de réinitialisation de mot de passe
const sendResetPasswordCode = async (email) => {
  await initializeApiClient();
  return apiClient.post('/send_code_reset', { email });
};

// Fonction pour vérifier le code de réinitialisation de mot de passe
const checkResetPasswordCode = async (resetCode) => {
  await initializeApiClient();
  return apiClient.post('/check_code_reset', { code: resetCode });
};

export default {
  login,
  register,
  verifyEmail,
  sendVerificationEmailCode,
  resetPassword,
  sendResetPasswordCode,
  checkResetPasswordCode
};
