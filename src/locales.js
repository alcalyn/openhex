import i18next from 'i18next';
import { en, fr, es } from './engine/locales';

i18next.init({
  debug: true,
  lng: 'en',
  fallbackLng: 'en',
  defaultNs: 'translation',
});

i18next.addResourceBundle('en', 'translation', en);
i18next.addResourceBundle('fr', 'translation', fr);
i18next.addResourceBundle('es', 'translation', es);
