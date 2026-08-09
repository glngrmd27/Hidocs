import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  const [darkMode, setDarkMode] = useState(() => {

    const savedTheme =
      localStorage.getItem("hidocs_dark_mode");

    return savedTheme === "true";

  });

  useEffect(() => {

    localStorage.setItem(
      "hidocs_dark_mode",
      darkMode
    );

  }, [darkMode]);

  const toggleTheme = () => {

    setDarkMode((prev) => !prev);

  };

  return (

    <ThemeContext.Provider
      value={{

        darkMode,

        setDarkMode,

        toggleTheme,

      }}
    >

      {children}

    </ThemeContext.Provider>

  );

}