import { logEvent } from 'firebase/analytics';
import { useEffect } from 'react';
import { analytics } from '../lib/firebase/initFirebase';

const useAnalytics = () => {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'notification_received');
    }
  }, []);
};

export default useAnalytics;
