'use client';

import { submitContactForm } from '@/services/updateContact';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = useCallback(
    async (data) => {
      try {
        const contactData: ContactData = {
          ...data,
          reply: false,
          date: Date.now(),
        };

        const collections = process.env.NEXT_PUBLIC_FIRESTORE_CONTACT || '';

        const response = await submitContactForm(contactData, collections);

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
    [reset]
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
    isValid,
    notification,
  };
};