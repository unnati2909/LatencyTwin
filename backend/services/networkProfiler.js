function classifyNetwork(profile) {
  if (!profile) {
    return {
      label: "Unknown connection",
      quality: "Unknown",
      description: "No network data available",
    };
  }

  const { effectiveType, rtt, downlink } = profile;

  // Step 1: Determine connection label (WHAT)
  let label = "Network";

  if (effectiveType === "4g") label = "Wi-Fi / 4G";
  if (effectiveType === "3g") label = "3G";
  if (effectiveType === "2g") label = "2G";

  // Step 2: Determine quality (HOW GOOD)
  let quality = "Average";
  let description = "Normal network conditions";

  if (downlink >= 8 && rtt < 80) {
    quality = "Excellent";
    description = "Low latency and high bandwidth";
  } else if (downlink >= 3 && rtt < 200) {
    quality = "Moderate";
    description = "Possible congestion or shared network";
  } else if (rtt > 300 || downlink < 1) {
    quality = "Poor";
    description = "High latency or limited bandwidth";
  }

  return {
    label,
    quality,
    description,
  };
}

module.exports = { classifyNetwork };
