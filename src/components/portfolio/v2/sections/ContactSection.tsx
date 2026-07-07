'use client';

import { motion } from 'framer-motion';
import GoldHeading, { KICKER } from '../shared/GoldHeading';
import { MORPH_LAYOUT_TRANSITION } from '../shared/useMorphTransition';
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
import { Check, Copy, MapPin } from 'lucide-react';
import Recaptcha from '@/components/global/Recapcha';
import Notification from '@/components/global/Notification';
import { useCreateContact } from '@/services/contact';
import { cn } from '@/lib/utils';

const EMAILS = ['itti.task@gmail.com', 'fiez.dev@gmail.com'];

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

const inputCls = (invalid?: boolean) =>
  cn(
    'w-full rounded-xl border bg-white/70 px-4 py-3 text-sm text-gray-800 transition-all outline-none placeholder:text-gray-500',
    invalid
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
  );

const ContactSection = () => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaKey, setRecaptchaKey] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 1600);
    } catch {
      // Clipboard unavailable (permissions/http) — mailto link still works.
    }
  };

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
      className="flex flex-col justify-center min-h-full p-6 md:p-10 lg:p-14 pb-24 lg:pb-24 bg-transparent"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 w-full">
        {/* Left rail — invitation + direct channels */}
        <motion.div
          variants={itemVariants}
          className="lg:w-[38.2%] flex flex-col gap-5 justify-center"
        >
          <motion.p layoutId="page-kicker" transition={MORPH_LAYOUT_TRANSITION} className={KICKER}>
            04 · Contact
          </motion.p>
          <GoldHeading
            as="h2"
            layoutId="page-heading"
            transition={MORPH_LAYOUT_TRANSITION}
            className="text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
          >
            Let&apos;s
            <br />
            Talk
          </GoldHeading>
          <motion.div
            layoutId="page-rule"
            transition={MORPH_LAYOUT_TRANSITION}
            className="h-px w-16 bg-gradient-to-r from-amber-400 to-transparent"
          />
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-sm">
            Have a project, a role, or an idea worth building? My inbox is
            open.
          </p>

          {/* Availability */}
          <div className="flex items-center gap-2 self-start rounded-full border border-green-200 bg-green-50/80 px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-green-700">
              Open for opportunities
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 -mt-3">
            <MapPin className="h-3.5 w-3.5" />
            Bangkok, Thailand · GMT+7
          </p>

          {/* Emails — primary channel + one-click copy. 2-col on mobile. */}
          <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-1.5">
            {EMAILS.map((email) => (
              <div key={email} className="flex min-w-0 items-center gap-1.5">
                <a
                  href={`mailto:${email}`}
                  className="group flex min-w-0 items-center gap-2 lg:gap-3 text-sm md:text-base lg:text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors"
                >
                  <span className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                  </span>
                  <span className="truncate underline-offset-4 group-hover:underline">
                    {email}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => copyEmail(email)}
                  aria-label={`Copy ${email}`}
                  title="Copy email"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                >
                  {copiedEmail === email ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                {copiedEmail === email && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-medium text-green-600"
                  >
                    Copied
                  </motion.span>
                )}
              </div>
            ))}
          </div>

          {/* Connect — GitHub + socials as text links, 2-col on mobile */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1">
              {[...codeUse.filter((link) => link.text !== 'CodePen'), ...infoUse].map((info) => (
                <a
                  key={info.text}
                  href={info.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-2 lg:gap-3 text-sm text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <FontAwesomeIcon icon={info.icon} className="w-4 shrink-0" />
                  <span className="truncate">{info.text}</span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — message form card */}
        <motion.form
          variants={formVariants}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="lg:w-[61.8%] self-center w-full rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-xl ring-1 ring-black/[0.03] p-5 md:p-8 space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Your name"
                className={inputCls(!!errors.name)}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="your@email.com"
                className={inputCls(!!errors.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('message')}
              id="message"
              placeholder="Tell me about it…"
              rows={5}
              className={cn(inputCls(!!errors.message), 'resize-none')}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.message.message}
              </p>
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
              'w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-yellow-600 hover:to-amber-600 hover:shadow-amber-500/35',
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
