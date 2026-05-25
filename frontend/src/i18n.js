import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./locales/translations";

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("agri_lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("agri_lang", lng);
  document.documentElement.lang = lng;
});

export default i18n;
