'use client';

import { Button } from '@/components/ui/button';
import { useContactForm } from '@/hooks/useContactForm';
import { cn } from '@/lib/utils';
import React from 'react';
import Notification from '../../global/Notification';

const ContactForm: React.FC = () => {
  const { register, handleSubmit, onSubmit, errors, isValid, notification } =
    useContactForm();

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
        <div className="relative mb-4">
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
        <Button
          type="submit"
          disabled={!isValid}
          className={cn(
            'w-full text-white bg-head border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg transition-colors duration-200',
            !isValid && 'bg-grey'
          )}
        >
          Submit
        </Button>
        {notification ? (
          <Notification
            message={notification.message}
            type={notification.type}
            className="mt-4"
          />
        ) : (
          <div className="flex items-center h-[30px] pt-4 my-2">
            <p className="text-error text-sm">
              *** Please fill in all the required fields.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
