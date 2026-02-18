// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // <-- crucial
});
export default api;

//Ce que je dois surveiller moi-même au quotidien