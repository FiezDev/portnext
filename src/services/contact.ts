import { ApiResponse } from '../types/common';
import { apiClient } from './baseApi';

interface CreateContactRequest {
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
}

/**
 * Plain async call (T10, perf pack): the contact form is the app's ONLY
 * mutation — it no longer drags @tanstack/react-query + a root provider
 * through every route for one POST. Behaviour matches the old
 * useMutation.mutateAsync: resolves with the API response, rejects on
 * network/HTTP errors (the caller owns the try/catch UX).
 */
export const createContact = (data: CreateContactRequest) =>
  apiClient
    .post<ApiResponse<null>>(`v1/contact/`, {
      ...data,
    })
    .then((response) => response.data);
