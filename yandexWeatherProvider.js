const TemperatureScaleLib = imports.temperatureScale;
const TemperatureScale = TemperatureScaleLib.TemperatureScale;

// Import icon names
const IconNames = imports.iconNames;
const ActionIcons       = IconNames.ActionIcons;
const CategoriesIcons   = IconNames.CategoriesIcons;
const EmblemIcons       = IconNames.EmblemIcons;
const WeatherIcons      = IconNames.StatusIcons.Weather;
const RadioIcons        = IconNames.StatusIcons.Radio;

const YandexWeatherProvider = {
    getWeatherState : () => {
        return {
            temperatureScale            : TemperatureScale.CELSIUS,
            temperature                 : 15,
            weatherStateIcon            : WeatherIcons.Snow,
            weatherStateHeader          : "Literally Snow",
            location                    : "Minsk, Belarus",
            providerName                : "Yandex.Weather"
        }
    }
};

/*
    load_json_async: function(url, params, fun) {
        if (_httpSession === undefined) {
            _httpSession = new Soup.Session();
            _httpSession.user_agent = this.user_agent;
        } else {
            // abort previous requests.
            _httpSession.abort();
        }

        let message = Soup.form_request_new_from_hash('GET', url, params);

        _httpSession.queue_message(message, Lang.bind(this, function(_httpSession, message) {
            try {
                if (!message.response_body.data) {
                    fun.call(this, 0);
                    return;
                }
                let jp = JSON.parse(message.response_body.data);
                fun.call(this, jp);
            } catch (e) {
                fun.call(this, 0);
                return;
            }
        }));
        return;
    },
*/