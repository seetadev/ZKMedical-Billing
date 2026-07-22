import SocialCalcFromCore from "./core/index.js";

// Get SocialCalc namespace dynamically
export function getSocialCalc() {
  if (typeof window !== "undefined" && window.SocialCalc) {
    return window.SocialCalc;
  } else if (typeof global !== "undefined" && global.SocialCalc) {
    return global.SocialCalc;
  }
  return SocialCalcFromCore || {};
}

// Create a Proxy to dynamically resolve SocialCalc properties at runtime
const SocialCalc = new Proxy({}, {
  get: (target, prop) => {
    const sc = getSocialCalc();
    const val = sc[prop];
    if (typeof val === "function") {
      return val.bind(sc);
    }
    return val;
  },
  set: (target, prop, value) => {
    const sc = getSocialCalc();
    sc[prop] = value;
    return true;
  }
});

// Export SocialCalc reference if needed elsewhere
export { SocialCalc };

// Re-export all functions from modules to maintain backward compatibility
export * from "./modules/device.js";
export * from "./modules/init.js";
export * from "./modules/sheets.js";
export * from "./modules/logos.js";
export * from "./modules/history.js";
export * from "./modules/formatting.js";
export * from "./modules/listeners.js";
export * from "./modules/exporters.js";
export * from "./modules/prompts.js";
export * from "./modules/utils.js";
export * from "./modules/weight.js";
export * from "./modules/touch-scroll.js";
