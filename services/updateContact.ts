import axios from 'axios';
import { ContactData } from '../types/contactForm';

interface FirestoreSetResponse {
  status: 'success' | 'error';
  message: string;
}

export const submitContactForm = async (
  contactData: ContactData,
  collections: string
): Promise<FirestoreSetResponse> => {
  const backUrl = process.env.NEXT_PUBLIC_BACKURL || '';

  const response = await axios.post<FirestoreSetResponse>(
    `${backUrl}api/fireStoreSet`,
    {
      data: contactData,
      collections,
    },
    {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};
