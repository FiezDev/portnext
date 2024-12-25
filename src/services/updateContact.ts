import { ContactData } from '@/src/types/contactForm';
import axios from 'axios';

interface CreateContactResponse {
  status: 'success' | 'error';
  message: string;
}

export const submitContactForm = async (
  contactData: ContactData,
  collections: string
): Promise<CreateContactResponse> => {
  const response = await axios.post<CreateContactResponse>(
    `${process.env.NEXT_PUBLIC_BACKURL}api/createContact`,
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
