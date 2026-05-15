export const getFingerprint = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language || "unknown",
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
  };
};
