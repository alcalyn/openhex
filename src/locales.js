import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';
import { en, fr, es } from './engine/locales';

i18next
    .use(LngDetector)
    .init({
        debug: true,
        fallbackLng: 'en',
        defaultNs: 'translation',
        detection: {
            order: ['querystring', 'navigator'],
            lookupQuerystring: 'lng'
        }
    })
;

i18next.addResourceBundle('en', 'translation', en);
i18next.addResourceBundle('fr', 'translation', fr);
i18next.addResourceBundle('es', 'translation', es);
