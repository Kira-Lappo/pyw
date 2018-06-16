
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

// Import icon names
const IconNames = imports.iconNames;
const ActionIcons       = IconNames.ActionIcons;
const CategoriesIcons   = IconNames.CategoriesIcons;
const EmblemIcons       = IconNames.EmblemIcons;
const WeatherIcons      = IconNames.StatusIcons.Weather;
const RadioIcons        = IconNames.StatusIcons.Radio;

let PoweredByText = _("Powered by Yandex.Weather");

const TemperatureScale = {
    CELSIUS     : "°C",
    KELVIN      : "K",
    FARENHEIT   : "°F",
}

const WeatherState = {
    temperatureScale            : TemperatureScale.CELSIUS,
    temperature                 : 17,
    weatherStateIcon            : WeatherIcons.Shower,
    weatherStateHeader          : "Shower",
    location                    : "Minsk, Belarus"
}

const UiFactory = {
    createIconButton : (accessibleName, iconName) => {
        button = Main.panel.statusArea.aggregateMenu._system._createActionButton(iconName, accessibleName);
        return button
    },

    createIcon : (iconName) => {
        var icon =  new St.Icon({
            icon_name: iconName,
            style_class: "system-status-icon weather-icon"
        });

        return icon;
    },

    createCurrentWeatherPopupMenuItem : (weatherState) => {
        let weatherStateHeader = UiFactory.formatWeatherStateHeader(weatherState);
        let weatherHeaderLabel = new St.Label({
            style_class: "current-weather-header",
            text: weatherStateHeader
        });

        let locationLabel = new St.Label({
            style_class: "current-weather-location",
            text: weatherState.location
        });

        let informationLayout = new St.BoxLayout({
            vertical:true,
            style_class : "current-weather-information"
        });

        informationLayout.add_actor(locationLabel);
        informationLayout.add_actor(weatherHeaderLabel);

        let weatherIcon = UiFactory.createIcon(weatherState.weatherStateIcon);

        let menuItemLayout = new St.BoxLayout({
            // style_class: 'openweather-current-iconbox'
        });

        menuItemLayout.add_actor(weatherIcon);
        menuItemLayout.add_actor(informationLayout);

        let menuItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        menuItem.actor.add_actor(menuItemLayout);
        return menuItem;
    },

    createPoweredByMenuItem : () => {
        let poweredByInfo = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        let poweredByLabel = new St.Label({
            text: PoweredByText
        });

        let informationLayout = new St.BoxLayout({
            vertical:true
        });


        informationLayout.add_actor(poweredByLabel);

        poweredByInfo.actor.add_actor(informationLayout);
        return poweredByInfo;
    },

    formatWeatherStateHeader : (weatherState) => {
        var header = ""
            + weatherState.weatherStateHeader
            + ", "
            + UiFactory.convertTemperature(weatherState.temperature, weatherState.temperatureScale)
            + " "
            + weatherState.temperatureScale;

            return header;
    },

    convertTemperature : (originalValue, scale) => {
        var value = 0;
        switch (scale){
            case TemperatureScale.FARENHEIT :
                value = originalValue * 1.8 + 32;
                break;
            case TemperatureScale.KELVIN :
                value =  originalValue + 273.15;
                break;
            case TemperatureScale.CELSIUS :
            default:
                value = originalValue;
                break;
        };

        return value.toFixed(0);
    }
};

const PywMenuButton = new Lang.Class({
    Name: "PywMenuButton",

    Extends: PanelMenu.Button,

    _init: function() {

        // Panel menu item - the current class
        let menuAlignment = 1.0 - (80 / 100);
        if (Clutter.get_default_text_direction() == Clutter.TextDirection.RTL){
            menuAlignment = 1.0 - menuAlignment;
        }

        this.parent(menuAlignment);

        this.initTrayButton();
        this.initPopup();

        this.refreshTrayButton(WeatherState);
        this.refreshPopup(WeatherState);
    },

    initTrayButton : function(){
        // Label
        let _buttonLabel = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: "no data"
        });

        let _buttonWeatherIcon = new St.Icon({
            icon_name: RadioIcons.Unchecked,
            style_class: "system-status-icon"
        });

        this.trayButton = {
            weatherIcon  : _buttonLabel,
            weatherLabel : _buttonLabel
        }

        // Putting the panel item together
        let buttonBox = new St.BoxLayout();
        buttonBox.add_actor(_buttonWeatherIcon);
        buttonBox.add_actor(_buttonLabel);
        this.actor.add_actor(buttonBox);

        let targetBox = Main.panel._leftBox
        let targetBoxChildren = targetBox.get_children();
        targetBox.insert_child_at_index(this.actor, targetBoxChildren.length);

        (Main.panel._menus || Main.panel.menuManager).addMenu(this.menu);
    },

    initPopup : function(){
        this._itemCurrentWeatherInfo = UiFactory.createCurrentWeatherPopupMenuItem(WeatherState);
        this.menu.addMenuItem(this._itemCurrentWeatherInfo);

        this._poweredByInfo = UiFactory.createPoweredByMenuItem(this);
        this.menu.addMenuItem(this._poweredByInfo);
    },

    refreshTrayButton : function(weatherState) {
        this.trayButton.weatherIcon.icon_name = weatherState.weatherStateIcon || RadioIcons.Unchecked;
        this.trayButton.weatherLabel.text = weatherState.weatherStateHeader || "no data";
    },

    refreshPopup : function(weatherState) {

    },

    _onStatusChanged: function(status) {
        this._idle = (status == GnomeSession.PresenceStatus.IDLE);
    },

    _onButtonHoverChanged: function(actor, event) {
        if (actor.hover) {
            actor.add_style_pseudo_class("hover");
            actor.set_style(this._button_background_style);
        } else {
            actor.remove_style_pseudo_class("hover");
            actor.set_style("background-color:;");
            // if (actor != this._urlButton){
            //     actor.set_style(this._button_border_style);
            // }
        }
    },

    _onScroll: function(actor, event) {
    }
});

function createTrayButton(){
    return new PywMenuButton();
}