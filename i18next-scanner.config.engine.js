module.exports = {
    options: {
        debug: true,
        func: {
            list: ['IllegalMoveError', 't'],
            extensions: ['.js'],
        },
        trans: false,
        lngs: ['en', 'fr', 'sv'],
        ns: [
            'translation',
        ],
        defaultLng: 'en',
        defaultNs: 'translation',
        defaultValue: (lng, ns, key) => '',
        resource: {
            loadPath: 'src/engine/locales/{{lng}}.json',
            savePath: 'src/engine/locales/{{lng}}.json',
            jsonIndent: 4,
        },
        nsSeparator: ':',
        keySeparator: '.',
    },
};
