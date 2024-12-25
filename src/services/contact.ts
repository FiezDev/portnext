import { useMutation } from '@tanstack/react-query';
import { ApiResponse } from '../types/common';
import { apiClient } from './baseApi';

interface useCreateContactRequest {
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
}

export const useCreateContact = () => {
  return useMutation({
    mutationKey: ['create-contact'],
    mutationFn: (data: useCreateContactRequest) =>
      apiClient
        .post<ApiResponse<null>>(`v1/contact/`, {
          ...data,
        })
        .then((response) => response.data),
  });
};
