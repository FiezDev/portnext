'use client';

import { motion } from 'framer-motion';
import GoldHeading from '../shared/GoldHeading';
import { codeUse, infoUse } from '@/constants/mapdata';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ContactFormData,
  contactFormSchema,
} from '@/lib/validations/contact';
import { Button } from '@/components/ui/button';
import Recaptcha from '@/components/global/Recapcha';
import Notification from '@/components/global/Notification';
import { useCreateContact } from '@/services/contact';
import { cn } from '@/lib/utils';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const formVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const ContactSection = () => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaKey, setRecaptchaKey] = useState(0);

  const mutateCreateContact = useCreateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (notification) {
      const timeoutId = setTimeout(() => {
        setNotification(null);
        if (notification.type === 'error') {
          setRecaptchaKey((prev) => prev + 1);
          setRecaptchaToken(null);
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [notification]);

  const resetForm = () => {
    reset();
    setRecaptchaToken(null);
    setRecaptchaKey((prev) => prev + 1);
  };

  const sendToFormSubmit = async (formData: ContactFormData) => {
    const time = new Date();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('message', formData.message);
    data.append('time', time.toString());

    try {
      const response = await fetch(
        `https://formsubmit.co/${process.env.NEXT_PUBLIC_FORMSUBMIT_MAILHASH}`,
        {
          method: 'POST',
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send data to FormSubmit');
      }
    } catch (error) {
      console.error('FormSubmit Error:', error);
      throw error;
    }
  };

  const onSubmit = async (value: ContactFormData) => {
    if (!recaptchaToken) {
      setNotification({
        message: 'Please complete the reCAPTCHA.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    const formData = {
      ...value,
      recaptchaToken,
    };

    try {
      await mutateCreateContact.mutateAsync(formData);
      await sendToFormSubmit(value);
      setNotification({
        message: 'Your message has been sent successfully.',
        type: 'success',
      });
      resetForm();
    } catch {
      setNotification({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
          Let&apos;s Talk
        </GoldHeading>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        {/* Contact Info */}
        <motion.div
          variants={itemVariants}
          className="lg:w-1/3 space-y-6"
        >
          {/* Emails */}
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-yellow-600" />
              </div>
              <a
                href="mailto:itti.task@gmail.com"
                className="text-sm text-gray-700 hover:text-yellow-600 transition-colors"
              >
                itti.task@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-yellow-600" />
              </div>
              <a
                href="mailto:fiez.dev@gmail.com"
                className="text-sm text-gray-700 hover:text-yellow-600 transition-colors"
              >
                fiez.dev@gmail.com
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Social</p>
            <div className="flex flex-wrap gap-3">
              {codeUse.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-yellow-100 flex items-center justify-center transition-colors group"
                >
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="text-gray-600 group-hover:text-yellow-600 transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Other Info */}
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Connect</p>
            {infoUse.map((info) => (
              <a
                key={info.id}
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <FontAwesomeIcon icon={info.icon} className="w-4" />
                <span>{info.text}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          variants={formVariants}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="lg:w-2/3 space-y-4"
        >
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm text-gray-500 font-medium mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              placeholder="Your name"
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-white/50 border transition-all outline-none',
                errors.name
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-gray-500 font-medium mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="your@email.com"
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-white/50 border transition-all outline-none',
                errors.email
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm text-gray-500 font-medium mb-1"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('message')}
              id="message"
              placeholder="Your message..."
              rows={4}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-white/50 border transition-all outline-none resize-none',
                errors.message
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
              )}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <Recaptcha
              key={recaptchaKey}
              siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
              onVerify={setRecaptchaToken}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn(
              'w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg transition-all',
              (!isValid || isSubmitting) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </Button>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Notification
                message={notification.message}
                type={notification.type}
              />
            </motion.div>
          )}
        </motion.form>
      </div>
    </motion.div>
  );
};

export default ContactSection;
