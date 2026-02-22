import { useEffect, useState } from "react";

export function useNetworkProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectNetwork() {
      try {
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;

        if (connection) {
          setProfile({
            effectiveType: connection.effectiveType || "4g",
            rtt: connection.rtt || 100,
            downlink: connection.downlink || 10,
          });
        } else {
          // 🔥 Fallback if API not supported
          setProfile({
            effectiveType: "4g",
            rtt: 150,
            downlink: 5,
          });
        }
      } catch (err) {
        console.error("Network detection failed:", err);
        // 🔥 NEVER block
        setProfile({
          effectiveType: "4g",
          rtt: 200,
          downlink: 3,
        });
      } finally {
        setLoading(false);
      }
    }

    detectNetwork();
  }, []);

  return { profile, loading };
}
