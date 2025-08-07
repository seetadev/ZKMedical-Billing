import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to false
    const savedTheme = localStorage.getItem("stark-invoice-dark-mode");
    const prefersDark = savedTheme ? JSON.parse(savedTheme) : false;

    setIsDarkMode(prefersDark);
    applyTheme(prefersDark);
  }, []);

  const applyTheme = (isDark: boolean) => {
    const body = document.body;
    const html = document.documentElement;

    if (isDark) {
      body.classList.add("dark");
      html.classList.add("ion-palette-dark");
    } else {
      body.classList.remove("dark");
      html.classList.remove("ion-palette-dark");
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setDarkMode(newDarkMode);
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    applyTheme(isDark);
    localStorage.setItem("stark-invoice-dark-mode", JSON.stringify(isDark));
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
