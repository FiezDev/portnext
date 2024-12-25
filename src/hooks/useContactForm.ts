'use client';

import { submitContactForm } from '@/services/updateContact';
import {
  ContactData,
  ContactFormInputs,
  contactFormSchema,
  NotificationProps,
} from '@/src/types/contactForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

export const useContactForm = () => {
  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  );
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

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
      if (!recaptchaToken) {
        setNotification({
          message: 'Please complete the reCAPTCHA',
          type: 'error',
        });
        return;
      }

      try {
        const contactData: ContactData = {
          ...data,
          recaptchaToken,
          reply: false,
          date: Date.now(),
        };

        const collections = process.env.NEXT_PUBLIC_FIRESTORE_CONTACT || '';

        const response = await submitContactForm(contactData, collections);

        if (response.status === 'success') {
          setNotification({ message: response.message, type: 'success' });
          reset();
          setRecaptchaToken(null);
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
    [recaptchaToken, reset]
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
    setRecaptchaToken,
  };
};
