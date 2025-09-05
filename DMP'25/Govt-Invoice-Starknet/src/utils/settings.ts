// Settings utility functions for managing app preferences

interface AppSettings {
  autoSaveEnabled: boolean;
}

const SETTINGS_KEY = "app_settings";

const defaultSettings: AppSettings = {
  autoSaveEnabled: false, // Default to disabled
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to load settings from localStorage:", error);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.warn("Failed to save settings to localStorage:", error);
  }
};

export const getAutoSaveEnabled = (): boolean => {
  return getSettings().autoSaveEnabled;
};

export const setAutoSaveEnabled = (enabled: boolean): void => {
  saveSettings({ autoSaveEnabled: enabled });
};
