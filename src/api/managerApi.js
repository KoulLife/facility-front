import axiosInstance from './axios';

//관리자
export const getUser = (userId) => {
    return axios.get(`/users/${userId}`);
  };
