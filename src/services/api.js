// fileName: src/services/api.js

import axios from 'axios';

const apiClient = axios.create({
    // CRITICAL FIX: Base URL must be 8000 to match your backend server
    baseURL: 'http://localhost:8000/api/v1', 
    
    withCredentials: true,
    
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;