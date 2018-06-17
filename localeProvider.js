
const Locale = {
    ENGLISH : "en_US",
    RUSSIAN : "ru_RU"
};

const localizations = {
    "en_US" : {
        "yandexWeatherLocale" : imports.locale.en_US.yandexWeatherLocale.Locale
    },
    "ru_RU" : {
        "yandexWeatherLocale" : imports.locale.ru_RU.yandexWeatherLocale.Locale
    }
};

const LocaleProvider = {
    getLocalizedString : function(weatherProviderName, localeId, key){
        return localizations[localeId][weatherProviderName][key];
    }
};