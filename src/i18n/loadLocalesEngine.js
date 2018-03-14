import { en, fr, es } from '../engine/locales';

export default (i18next) => {
    i18next.addResourceBundle('en', 'translation', en);
    i18next.addResourceBundle('fr', 'translation', fr);
    i18next.addResourceBundle('es', 'translation', es);
};
