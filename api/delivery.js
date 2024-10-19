import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api';

const getApiClient = async (token = null) => {
  return initializeApiClient(baseURL, token);
};

const assignDelivery = async (orderId) => {
  const apiClient = await getApiClient();
  return apiClient.post('/deliveries/assign-driver', { orderId });
};


export default {
  assignDelivery,
};
