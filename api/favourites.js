import { initializeApiClient } from '~/api/client.js';

const baseURL = 'http://localhost:8000/api/products'; // Assurez-vous que la route est correcte

const getApiClient = async (token = null) => {
  return await initializeApiClient(baseURL, token);
};

const addFavourite = async (productId) => {
  try {
    const token = localStorage.getItem('authToken');
    const apiClient = await getApiClient(token);
    const response = await apiClient.post(`/${productId}/favourite`, {
      userId: localStorage.getItem('userId')
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    throw error;
  }
};

const removeFavourite = async (productId) => {
  try {
      const token = localStorage.getItem('authToken');
      const apiClient = await getApiClient(token);
      const response = await apiClient.delete(`/${productId}/favourite`, {
          data: { userId: localStorage.getItem('userId') } // Envoi de l'ID utilisateur dans le corps de la requête
      });
      return response.data;
  } catch (error) {
      console.error('Erreur lors du retrait des favoris:', error);
      throw error;
  }
};


const getUserFavourites = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!userId) {
      console.error('User ID non défini, vérifiez la connexion');
      throw new Error('User ID non défini');
    }

    const apiClient = await getApiClient(token);
    const response = await apiClient.get(`/users/${userId}/favourites`); // Utiliser l'ID de l'utilisateur dans la route
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    throw error;
  }
};




export default {
  addFavourite,
  removeFavourite,
  getUserFavourites,
};
