import { useEffect } from "react";
import { analytics } from "../lib/firebase/initFirebase"
import { logEvent } from "firebase/analytics";

const useAnalytics = () => {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "notification_received");
    }
  }, []);
};

export default useAnalytics;
