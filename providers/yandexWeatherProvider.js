const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

// Import icon names
const IconNames = imports.iconNames;
const ActionIcons       = IconNames.ActionIcons;
const CategoriesIcons   = IconNames.CategoriesIcons;
const EmblemIcons       = IconNames.EmblemIcons;
const WeatherIcons      = IconNames.StatusIcons.Weather;
const RadioIcons        = IconNames.StatusIcons.Radio;

const YandexWeatherApiPATValue = "feaaa0e3-cb0a-4d17-9228-20bd91cf19b0"; // Testing mode key
const YandexWeatherApiPATHeader = "X-Yandex-API-Key";

function YandexWeatherProvider() {
    return {
        getWeatherState : (request, callbackFunc) => {
            callbackFunc = callbackFunc || (() => {});

            let weatherState = {
                temperature                 : 0,
                weatherStateIcon            : RadioIcons.Unchecked,
                weatherStateHeader          : "NoDataText",
                location                    : "NoDataText",
                providerName                : "Yandex.Weather"
            };

        let requestUri = "https://api.weather.yandex.ru/v1/forecast"
            + "?lat=" + request.latitude
            + "&lon=" + request.longtitude
            + "&lang=en_US"
            + "&limit=1"
            + "&hours=false"
            + "&extra=false";

            const HttpSession = new Soup.SessionAsync();
            Soup.Session.prototype.add_feature.call(HttpSession, new Soup.ProxyResolverDefault());

            // create an http message
            var request = Soup.Message.new('GET', requestUri);

            request.request_headers.append(YandexWeatherApiPATHeader, YandexWeatherApiPATValue);

            HttpSession.queue_message(request, function(httpSession, message) {
                if (message.status_code !== 200) {
                    log("kira","Status code : " + message.status_code + " Request : GET " + requestUri);
                    callbackFunc(weatherState);
                    return;
                }

                var responseBody = request.response_body.data;
                var responseJson = JSON.parse(responseBody);

                var fact = responseJson.fact;

                weatherState.temperature                = fact.temp;
                weatherState.weatherStateIcon           = YandexProviderConverter.getWeatherIcon(fact.condition);
                weatherState.weatherStateHeader         = fact.condition;
                weatherState.location                   = responseJson.info.tzinfo.name;

                callbackFunc(weatherState);
            });
        }
    }
};

const YandexProviderConverter = {
    getWeatherIcon : function(condition) {
        switch(condition.toLowerCase()) {
            case "clear"                             : return WeatherIcons.Clear;
            case "partly-cloudy"                     : return WeatherIcons.FewClouds;
            case "cloudy"                            : return WeatherIcons.FewClouds;
            case "overcast"                          : return WeatherIcons.Overcast;
            case "partly-cloudy-and-light-rain"      : return WeatherIcons.ShowersScattered;
            case "partly-cloudy-and-rain"            : return WeatherIcons.ShowersScattered;
            case "overcast-and-rain"                 : return WeatherIcons.Showers;
            case "overcast-thunderstorms-with-rain"  : return WeatherIcons.Storm;
            case "cloudy-and-light-rain"             : return WeatherIcons.ShowersScattered;
            case "overcast-and-light-rain"           : return WeatherIcons.ShowersScattered;
            case "cloudy-and-rain"                   : return WeatherIcons.Showers;
            case "overcast-and-wet-snow"             : return WeatherIcons.Snow;
            case "partly-cloudy-and-light-snow"      : return WeatherIcons.Snow;
            case "partly-cloudy-and-snow"            : return WeatherIcons.Snow;
            case "overcast-and-snow "                : return WeatherIcons.Snow;
            case "cloudy-and-light-snow"             : return WeatherIcons.Snow;
            case "overcast-and-light-snow"           : return WeatherIcons.Snow;
            case "cloudy-and-snow"                   : return WeatherIcons.Snow;
            default                                  : return RadioIcons.Unchecked;
        }
    }
}
