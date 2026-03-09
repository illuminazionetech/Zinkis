import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './it.json';
import en from './en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it.translation },
      en: { translation: en.translation }
    },
    lng: 'it',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
