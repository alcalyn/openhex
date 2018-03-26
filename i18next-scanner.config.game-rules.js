module.exports = {
    options: {
        debug: true,
        func: {
            list: ['t'],
            extensions: ['.js'],
        },
        trans: {
            component: 'Trans',
            fallbackKey: (ns, value) => value,
        },
        lngs: ['en'],
        ns: [
            'translation',
        ],
        defaultLng: 'en',
        defaultNs: 'translation',
        defaultValue: (lng, ns, key) => '',
        resource: {
            loadPath: 'src/components/GameRules/locales/{{lng}}.json',
            savePath: 'src/components/GameRules/locales/{{lng}}.json',
            jsonIndent: 4,
        },
        nsSeparator: false,
        keySeparator: false,
    },
};
