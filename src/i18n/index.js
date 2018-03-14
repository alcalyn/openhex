import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';
import loadLocalesEngine from './loadLocalesEngine';
import loadLocalesUi from './loadLocalesUi';

i18next
    .use(LngDetector)
    .init({
        debug: true,
        fallbackLng: 'en',
        returnEmptyString: false,
        defaultNS: 'translation',
        detection: {
            order: ['querystring', 'navigator'],
            lookupQuerystring: 'lng'
        }
    })
;

loadLocalesEngine(i18next);
loadLocalesUi(i18next);
