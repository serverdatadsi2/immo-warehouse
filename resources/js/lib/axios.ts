import axios from 'axios';

const axiosIns = axios.create({
    baseURL: '/', // or '/api' if you prefix your routes
    withCredentials: true,
    withXSRFToken: true,
});

export default axiosIns;
