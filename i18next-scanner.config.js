module.exports = {
    options: {
        debug: true,
        func: {
            list: ['IllegalMoveError'],
            extensions: ['.js'],
        },
        trans: {
            component: 'Trans',
            i18nKey: 'i18nKey',
            extensions: ['.js', '.jsx'],
            fallbackKey: (ns, value) => ns,
        },
        lngs: ['en', 'fr', 'es'],
        ns: [
            'translation',
        ],
        defaultLng: 'en',
        defaultNs: 'translation',
        defaultValue: (lng, ns, key) => key,
        resource: {
            loadPath: 'src/engine/locales/{{lng}}.json',
            savePath: 'src/engine/locales/{{lng}}.json',
            jsonIndent: 4,
            lineEnding: '\n',
        },
        nsSeparator: ':',
        keySeparator: '.',
        interpolation: {
            prefix: '{{',
            suffix: '}}',
        },
    },
};
