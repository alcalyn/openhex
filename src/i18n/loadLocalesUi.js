import { en, fr } from '../locales';

export default (i18next) => {
    i18next.addResourceBundle('en', 'translation', en);
    i18next.addResourceBundle('fr', 'translation', fr);
};
