import axios from "axios";

const BASE_URL ='https://unicheck.dsti.co.kr/api';
const token = localStorage.getItem('access_token');

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    }
  });

  export default axiosInstance;
