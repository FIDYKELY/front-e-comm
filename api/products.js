// ~/api/products.js
let axios;
let apiClient;

// Fonction pour initialiser apiClient
const initializeApiClient = async () => {
  if (!apiClient) {
    axios = (await import('axios')).default;
    apiClient = axios.create({
      baseURL: 'http://localhost:8000/api/products', // Assurez-vous que cette URL correspond à votre backend Express
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
};

// Utilisation de apiClient après son initialisation
const getAllProducts = async () => {
  await initializeApiClient();
  return apiClient.get('/');
};

const getProductById = async (id) => {
  await initializeApiClient();
  return apiClient.get(`/${id}`);
};

const createProduct = async (product) => {
  await initializeApiClient();
  return apiClient.post('/', product);
};

const updateProduct = async (id, product) => {
  await initializeApiClient();
  return apiClient.put(`/${id}`, product);
};

const deleteProduct = async (id) => {
  await initializeApiClient();
  return apiClient.delete(`/${id}`);
};

const searchProducts = async (query) => {
  await initializeApiClient();
  return apiClient.get(`/search`, { params: { q: query } });
};
const updateProductRating = async (id, rating) => {
  await initializeApiClient();
  return apiClient.put(`/${id}/rating`, { rating });
};



export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  updateProductRating,
};
