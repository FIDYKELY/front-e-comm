// ~/api/auth.js
import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api';

// Fonction pour se connecter
const login = async (email, password) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post('/login', { email, password });
};

// Fonction pour s'inscrire
const register = async (email, password) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post('/register', { email, password });
};

// Fonction pour vérifier le code de vérification de l'email
const verifyEmail = async (verificationCode) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post('/verify_email', { code: verificationCode });
};

// Fonction pour envoyer un code de vérification de l'email
const sendVerificationEmailCode = async (email) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post('/send_verification_email_code', { email });
};

// Fonction pour réinitialiser le mot de passe
const resetPassword = async (userId, newPassword) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post(`/users/${userId}/settings/change_password`, { newPassword });
};

// Fonction pour envoyer un code de réinitialisation de mot de passe
const sendResetPasswordCode = async (email) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post('/send_code_reset', { email });
};

// Fonction pour vérifier le code de réinitialisation de mot de passe
const checkResetPasswordCode = async (resetCode) => {
  const apiClient = await initializeApiClient(baseURL);
  return apiClient.post('/check_code_reset', { code: resetCode });
};

export default {
  login,
  register,
  verifyEmail,
  sendVerificationEmailCode,
  resetPassword,
  sendResetPasswordCode,
  checkResetPasswordCode,
};
