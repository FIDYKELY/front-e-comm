// ~/api/client.js
let axios;

export const initializeApiClient = async (baseURL, token = null) => {
  axios = (await import('axios')).default;
  const apiClient = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  return apiClient;
};
