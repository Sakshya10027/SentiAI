/**
 * SentinelAI Security Profiler
 * Implements Device Fingerprinting and Keystroke Biometrics
 */

export const initSecurityProfiler = () => {
  // 1. Device Profiling (On Load)
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

  // 2. Keystroke Dynamics Tracking
  const keyTimestamps = new Map();

  const handleKeyDown = (e) => {
    // Prevent recording duplicate keydown events when holding a key
    if (e.repeat) return;
    
    // Capture high-resolution timestamp (ms)
    keyTimestamps.set(e.key, performance.now());
  };

  const handleKeyUp = (e) => {
    const downTimestamp = keyTimestamps.get(e.key);
    
    if (downTimestamp) {
      // Calculate Dwell Time (Up - Down)
      const dwellTime = Math.round(performance.now() - downTimestamp);
      
      // 3. Clean Console Output Formatting
      console.log(
        `%c[Keystroke]%c Key: %c"${e.key}"%c | Dwell Time: %c${dwellTime}ms`,
        "color: #ef4444; font-weight: bold;", // [Keystroke]
        "color: #9ca3af;",                    // Key:
        "color: #ffffff; font-weight: bold;", // "A"
        "color: #9ca3af;",                    // |
        "color: #10b981; font-weight: bold;"  // 85ms
      );
      
      // Clear timestamp to avoid memory leaks
      keyTimestamps.delete(e.key);
    }
  };

  // Attach global listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Return cleanup function for React
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
