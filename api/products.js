import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api/products';

// Fonction pour obtenir le client API avec le token si nécessaire
const getApiClient = async (token = null) => {
  return await initializeApiClient(baseURL, token);
};

const getRecommendations = async (userId) => {
  const apiClient = await getApiClient();
  return apiClient.get(`/recommendations/${userId}`); // Utiliser des backticks ici
};

const getAllProducts = async () => {
  const apiClient = await getApiClient();
  return apiClient.get('/');
};


const getProductById = async (id) => {
  const apiClient = await getApiClient();
  return apiClient.get(`/${id}`);
};

const createProduct = async (product) => {
  const apiClient = await getApiClient();
  return apiClient.post('/', product);
};

const updateProduct = async (id, product) => {
  const apiClient = await getApiClient();
  return apiClient.put(`/${id}`, product);
};

const deleteProduct = async (id) => {
  const apiClient = await getApiClient();
  return apiClient.delete(`/${id}`);
};

const searchProducts = async (query) => {
  const apiClient = await getApiClient();
  return apiClient.get(`/search`, { params: { q: query } });
};

const updateProductRating = async (id, rating) => {
  const apiClient = await getApiClient();
  return apiClient.put(`/${id}/rating`, { rating });
};

const getProductComments = async (id) => {
  const apiClient = await getApiClient();
  return apiClient.get(`/${id}/comments`);
};

const createProductComment = async (id, comment) => {
  const token = localStorage.getItem('authToken');
  const apiClient = await getApiClient(token);
  return apiClient.post(`/${id}/comments`, comment);
};
const registerProductClick = async (id) => {
  const apiClient = await getApiClient();
  return apiClient.post(`/${id}/click`);
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  updateProductRating,
  getProductComments,
  createProductComment,
  registerProductClick,
  getRecommendations,
};
