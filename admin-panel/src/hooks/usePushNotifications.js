import { useEffect, useRef } from "react";
import api from "../api/client.js";

// Polls notices (and homework, for student/parent/teacher roles) every 60
// seconds and fires a native browser notification for anything newer than
// the last time this hook ran. Uses the standard Web Notification API —
// no backend push service or service worker required.
export default function usePushNotifications(role) {
  const lastNoticeIdRef = useRef(null);
  const lastHomeworkIdRef = useRef(null);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) return;

    const checkForUpdates = async () => {
      try {
        const { data } = await api.get("/notices");
        const notices = data.notices || [];
        if (notices.length > 0) {
          const latest = notices[0];
          if (!firstRunRef.current && lastNoticeIdRef.current && latest._id !== lastNoticeIdRef.current) {
            if (Notification.permission === "granted") {
              new Notification("New School Notice", { body: latest.title, icon: "/favicon.svg" });
            }
          }
          lastNoticeIdRef.current = latest._id;
        }
      } catch {
        /* silent — notifications are a nice-to-have, not critical path */
      }

      if (role === "student" || role === "parent") {
        try {
          const { data } = await api.get("/homework");
          const homework = data.homework || [];
          if (homework.length > 0) {
            const latest = homework[0];
            if (!firstRunRef.current && lastHomeworkIdRef.current && latest._id !== lastHomeworkIdRef.current) {
              if (Notification.permission === "granted") {
                new Notification("New Homework Assigned", { body: `${latest.title} (${latest.subject})`, icon: "/favicon.svg" });
              }
            }
            lastHomeworkIdRef.current = latest._id;
          }
        } catch {
          /* silent */
        }
      }

      firstRunRef.current = false;
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 60000);
    return () => clearInterval(interval);
  }, [role]);
}
