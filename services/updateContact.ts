import axios from 'axios';
import { ContactData } from '../types/contactForm';

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
