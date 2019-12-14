import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';
import loadLocalesEngine from './loadLocalesEngine';
import loadLocalesUi from './loadLocalesUi';
import i18nextOptions from './i18nextOptions';

const i18n = i18next.createInstance();

i18n
    .use(LngDetector)
    .init(i18nextOptions())
;

loadLocalesEngine(i18n);
loadLocalesUi(i18n);

//console.log(i18n);

export default i18n;
