import axios from 'axios';

const createApiClient = () => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_AWSBACK,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

const apiClient = createApiClient();

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const res = error.response;
    console.error('ApiCallError - Status:', res?.status);
    return Promise.reject(res);
  }
);

export { apiClient };
