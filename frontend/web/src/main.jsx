import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./index.css";
import App from "./App.jsx";

import { FormProvider } from "./context/FormContext";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <ThemeProvider>

      <FormProvider>

        <App />

      </FormProvider>

    </ThemeProvider>

  </StrictMode>
);