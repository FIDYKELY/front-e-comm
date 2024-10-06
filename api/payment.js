import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api';

const getApiClient = async (token = null) => {
  return initializeApiClient(baseURL, token);
};

const createPaymentIntent = async (amount) => {
  const apiClient = await getApiClient();
  return apiClient.post('/create-payment-intent', { amount });
};
const storePaymentDetails = async (paymentData) => {
  const apiClient = await getApiClient();
  return apiClient.post('/savePaymentDetails', paymentData); // Assurez-vous que l'URL est correcte
};

export default {
  createPaymentIntent,
  storePaymentDetails, // Ajout de la fonction storePaymentDetails
};
