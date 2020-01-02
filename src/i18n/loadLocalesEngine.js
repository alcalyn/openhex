import en from '../engine/locales/en.json';
import fr from '../engine/locales/fr.json';
import sv from '../engine/locales/sv.json';

export default (i18next) => {
    i18next.addResourceBundle('en', 'translation', en);
    i18next.addResourceBundle('fr', 'translation', fr);
    i18next.addResourceBundle('sv', 'translation', sv);
};
