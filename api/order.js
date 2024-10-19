import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api';

const getApiClient = async () => {
    const token = localStorage.getItem('authToken'); // Récupère le token d'authentification
    return initializeApiClient(baseURL, token);
};

const createOrder = async (orderDetails) => {
    const apiClient = await getApiClient();
    return apiClient.post('/orders', orderDetails);
};

const getUserData = async (userId) => {
    const apiClient = await getApiClient();
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
};

export default {
    createOrder,
    getUserData,
};
