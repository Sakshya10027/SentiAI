export const initSecurityProfiler = () => {
  const getOS = () => {
    const { userAgent, platform } = window.navigator;
    if (/Mac/.test(platform)) return "Mac OS";
    if (/Win/.test(platform)) return "Windows";
    if (/Linux/.test(platform)) return "Linux";
    if (/Android/.test(userAgent)) return "Android";
    if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
    return "Unknown";
  };

  const deviceProfile = {
    userAgent: navigator.userAgent,
    os: getOS(),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    browserLanguage: navigator.language,
    logicalCores: navigator.hardwareConcurrency || "N/A",
    deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "N/A",
  };

  console.log("%c[Security Profiler] Device Profile Captured:", "color: #3b82f6; font-weight: bold;");
  console.table(deviceProfile);

  const keyTimestamps = new Map();

  const handleKeyDown = (e) => {
    if (e.repeat) return;
    keyTimestamps.set(e.key, performance.now());
  };

  const handleKeyUp = (e) => {
    const downTimestamp = keyTimestamps.get(e.key);
    
    if (downTimestamp) {
      const dwellTime = Math.round(performance.now() - downTimestamp);
      
      console.log(
        `%c[Keystroke]%c Key: %c"${e.key}"%c | Dwell Time: %c${dwellTime}ms`,
        "color: #ef4444; font-weight: bold;",
        "color: #9ca3af;",
        "color: #ffffff; font-weight: bold;",
        "color: #9ca3af;",
        "color: #10b981; font-weight: bold;"
      );
      
      keyTimestamps.delete(e.key);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
