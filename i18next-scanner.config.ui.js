module.exports = {
    options: {
        debug: true,
        func: {
            list: ['IllegalMoveError', 't'],
            extensions: ['.js'],
        },
        trans: false,
        lngs: ['en', 'fr', 'es'],
        ns: [
            'translation',
        ],
        defaultLng: 'en',
        defaultNs: 'translation',
        defaultValue: (lng, ns, key) => '',
        resource: {
            loadPath: 'src/locales/{{lng}}.json',
            savePath: 'src/locales/{{lng}}.json',
            jsonIndent: 4,
        },
        nsSeparator: ':',
        keySeparator: '.',
    },
};
