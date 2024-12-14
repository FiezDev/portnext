'use client';

import React from 'react';

interface FallbackProps {
  text?: string;
}

const Fallback: React.FC<FallbackProps> = ({ text }) => {
  return <div>{text || 'Loading...'}</div>;
};

export default Fallback;
