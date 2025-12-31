import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(1, 'Message is required.'),
});

export type ContactFormInputs = z.infer<typeof contactFormSchema>;

export interface ContactData extends ContactFormInputs {
  reply: boolean;
  date: number;
  recaptchaToken: string;
}

export interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}
