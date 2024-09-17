import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api';

const getApiClient = async (token = null) => {
  return initializeApiClient(baseURL, token);
};

const createPaymentIntent = async (amount) => {
  const apiClient = await getApiClient();
  return apiClient.post('/create-payment-intent', { amount });
};

export default {
  createPaymentIntent,
};
