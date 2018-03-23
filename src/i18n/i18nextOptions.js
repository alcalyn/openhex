const baseI18nextOptions = {
    //debug: true,
    fallbackLng: 'en',
    returnEmptyString: false,
    defaultNS: 'translation',
    detection: {
        order: ['querystring', 'navigator'],
        lookupQuerystring: 'lng'
    },
};

export default (options = {}) => {
    return {
        ...baseI18nextOptions,
        ...options,
    };
};
