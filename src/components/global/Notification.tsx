import { cn } from '@/lib/utils';
import { NotificationProps } from '@/src/types/contactForm';
import React from 'react';

interface Props extends NotificationProps {
  className?: string;
}

const Notification: React.FC<Props> = ({ message, type, className }) => {
  return (
    <div
      className={cn(
        'w-full text-white p-2 rounded-b-lg text-center',
        type === 'success' ? 'bg-success' : 'bg-error',
        className
      )}
    >
      {message}
    </div>
  );
};

export default Notification;
