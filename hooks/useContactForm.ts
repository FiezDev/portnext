'use client';

import { submitContactForm } from '@/services/updateContact';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  ContactData,
  ContactFormInputs,
  contactFormSchema,
  NotificationProps,
} from '../types/contactForm';

export const useContactForm = () => {
  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  );
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = useCallback(
    async (data) => {
      if (!executeRecaptcha) {
        console.error('Execute recaptcha not yet available');
        setNotification({
          message: 'Recaptcha not ready. Please try again later.',
          type: 'error',
        });
        return;
      }
      try {
        const token = await executeRecaptcha('enquiryFormSubmit');
        const contactData: ContactData = {
          ...data,
          reply: false,
          date: Date.now(),
        };

        const collections = process.env.NEXT_PUBLIC_FIRESTORE_CONTACT || '';

        const response = await submitContactForm(
          contactData,
          token,
          collections
        );

        if (response.status === 'success') {
          setNotification({ message: response.message, type: 'success' });
          reset();
        } else {
          setNotification({ message: response.message, type: 'error' });
        }
      } catch (error) {
        console.error(error);
        setNotification({
          message: 'An error occurred. Please try again later.',
          type: 'error',
        });
      }
    },
    [executeRecaptcha, reset]
  );

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return {
    register,
    handleSubmit,
    onSubmit,
    reset,
    errors,
    notification,
  };
};
