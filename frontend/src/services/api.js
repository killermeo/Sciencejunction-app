import axios from 'axios';

const API = axios.create({
  baseURL: 'https://sciencejunction-api.onrender.com/api'
});

export default API;