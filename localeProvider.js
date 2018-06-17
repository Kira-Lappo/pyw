
const Locale = {
    ENGLISH : "en_US",
    RUSSIAN : "ru_RU"
};

const LocaleProvider = {
    getLocalizedString : function(weatherProviderName, localeId, key){
        // var locale = import.locale.localeId.weatherProviderName;
        // return locale[key];
        return key;
    }
};