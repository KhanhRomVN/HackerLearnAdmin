import axios from 'axios';

const getAccessToken = () => localStorage.getItem('access_token');

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động gắn token vào header
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const _GET = async (api: string) => {
  const response = await axiosInstance.get(api);
  return response.data;
};

const _POST = async (api: string, body: any) => {
  const response = await axiosInstance.post(api, body);
  return response.data;
};

const _PUT = async (api: string, body: any) => {
  const response = await axiosInstance.put(api, body);
  return response.data;
};

const _DELETE = async (api: string) => {
  const response = await axiosInstance.delete(api);
  return response.data;
};

const publicAxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const _GET_PUBLIC = async (api: string) => {
  const response = await publicAxiosInstance.get(api);
  return response.data;
};

const _POST_PUBLIC = async (api: string, body: any) => {
  const response = await publicAxiosInstance.post(api, body);
  return response.data;
};

const _PUT_PUBLIC = async (api: string, body: any) => {
  const response = await publicAxiosInstance.put(api, body);
  return response.data;
};

const _DELETE_PUBLIC = async (api: string) => {
  const response = await publicAxiosInstance.delete(api);
  return response.data;
};

export { _GET, _POST, _PUT, _DELETE, _GET_PUBLIC, _POST_PUBLIC, _PUT_PUBLIC, _DELETE_PUBLIC };