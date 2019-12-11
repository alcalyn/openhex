import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';
import i18nextOptions from '../../i18n/i18nextOptions';
import { en, fr } from './locales';

const i18nGameRules = i18next.createInstance();

i18nGameRules
    .use(LngDetector)
    .init(i18nextOptions({
        keySeparator: false,
        nsSeparator: false,
        pluralSeparator: false,
        contextSeparator: false,
    }))
;

i18nGameRules.addResourceBundle('en', 'translation', en);
i18nGameRules.addResourceBundle('fr', 'translation', fr);

export default i18nGameRules;
