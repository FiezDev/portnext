import { cn } from '@/src/utils/common';
import React from 'react';
import { NotificationProps } from '../../types/contactForm';

interface Props extends NotificationProps {
  className?: string;
}

const Notification: React.FC<Props> = ({ message, type, className }) => {
  return (
    <div
      className={cn(
        'w-full text-white p-2 rounded',
        type === 'success' ? 'bg-green-500' : 'bg-red-500',
        className
      )}
    >
      {message}
    </div>
  );
};

export default Notification;
