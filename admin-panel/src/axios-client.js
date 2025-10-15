import axios from "axios";

// Get the API base URL with fallback
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: `${apiBaseUrl}/api`
})

// Debug: Log the base URL to help identify issues
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Resolved API Base URL:', apiBaseUrl);
console.log('Full Base URL:', `${apiBaseUrl}/api`);

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
})

axiosClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const {response} = error;
  if (response.status === 401) {
    localStorage.removeItem('ACCESS_TOKEN');
  } 

  throw error;
})

export default axiosClient;