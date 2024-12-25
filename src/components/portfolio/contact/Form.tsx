'use client';

import Notification from '@/components/global/Notification';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ContactFormData,
  contactFormSchema,
} from '@/src/lib/validations/contact';
import { useCreateContact } from '@/src/services/contact';
import { ContactFormInputs } from '@/src/types/contactForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Recaptcha from '../../global/Recapcha';

const ContactForm = () => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutateCreateContact = useCreateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (value: ContactFormData) => {
    if (!recaptchaToken) {
      setNotification({
        message: 'Please complete the reCAPTCHA.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = {
        ...value,
        recaptchaToken: recaptchaToken,
      };

      const result = await mutateCreateContact.mutateAsync(formData);
      if (result?.status === 200) {
        setNotification({
          message: 'Your message has been sent successfully.',
          type: 'success',
        });
        reset();
      } else {
        setNotification({
          message: result?.message || 'Something went wrong.',
          type: 'error',
        });
      }
    } catch (err) {
      setNotification({
        message: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl basis-full w-full xl:basis-1/3 bg-bg shadow-md p-8 flex flex-col md:ml-auto mt-10 md:mt-0 relative z-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="relative mb-4">
          <label
            htmlFor="name"
            className="block text-base text-gray-400 font-bold mb-1"
          >
            Name<span className="text-error">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            className={`w-full bg-light rounded border ${
              errors.name ? 'border-red-500' : 'border-bg'
            } focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-black py-2 px-3 transition-colors duration-200 ease-in-out`}
          />
          {errors.name && (
            <p className="text-error text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="relative mb-4">
          <label
            htmlFor="email"
            className="block text-base text-gray-400 font-bold mb-1"
          >
            Email<span className="text-error">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            className={`w-full bg-light rounded border ${
              errors.email ? 'border-red-500' : 'border-bg'
            } focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-black py-2 px-3 transition-colors duration-200 ease-in-out`}
          />
          {errors.email && (
            <p className="text-error text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="relative">
          <label
            htmlFor="message"
            className="block text-base text-gray-400 font-bold mb-1"
          >
            Message<span className="text-error">*</span>
          </label>
          <textarea
            {...register('message')}
            id="message"
            name="message"
            placeholder="Please Enter Message"
            rows={4}
            className={`w-full bg-light rounded border ${
              errors.message ? 'border-red-500' : 'border-bg'
            } focus:border-blue-500 focus:ring-2 focus:ring-blue-900 text-base outline-none text-black py-2 px-3 resize-none transition-colors duration-200 ease-in-out`}
          />
          {errors.message && (
            <p className="text-error text-sm mt-1">{errors.message.message}</p>
          )}
        </div>
        <div className="pt-2 pb-4 flex justify-center items-center">
          <Recaptcha
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
            onVerify={setRecaptchaToken}
          />
        </div>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(
            'w-full text-white bg-head border-0 pt-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg transition-colors duration-200',
            (!isValid || isSubmitting) && 'bg-grey'
          )}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}{' '}
        </Button>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </form>
    </div>
  );
};

export default ContactForm;
