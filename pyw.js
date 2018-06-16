
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

// Import scales
const TemperatureScaleLib = imports.temperatureScale;
const TemperatureScale = TemperatureScaleLib.TemperatureScale;

const YandexWeatherProviderLib = imports.yandexWeatherProvider;
const YandexWeatherProvider = YandexWeatherProviderLib.YandexWeatherProvider;

const PoweredByText         = _("Powered by ");
const NoDataText            = _("no-data");


const WeatherState = {
    temperatureScale            : TemperatureScale.CELSIUS,
    temperature                 : 0,
    weatherStateIcon            : RadioIcons.Unchecked,
    weatherStateHeader          : NoDataText,
    location                    : NoDataText,
    providerName                : NoDataText
}

const WeatherStateUpdater = {

    _innerProvider : YandexWeatherProvider, // default provider

    update : (weatherState) => {

        var newState = WeatherStateUpdater.provider.getWeatherState();

        weatherState.temperatureScale   = newState.temperatureScale;
        weatherState.temperature        = newState.temperature;
        weatherState.weatherStateIcon   = newState.weatherStateIcon;
        weatherState.weatherStateHeader = newState.weatherStateHeader;
        weatherState.location           = newState.location;
        weatherState.providerName       = newState.providerName;
    },

    get provider() {
        return this._innerProvider;
    },

    set provider(value) {
        this._innerProvider = value;
    }
}

const UiUtils = {
    findChildActorByNamePath : (actor) => {
        if (arguments.length <= 1){
            return actor;
        }

        for (let i = 1; i < arguments.length; i++) {
            actor = actor.find_child_by_name(arguments[i]);
            if (actor === undefined){
                return actor;
            }
        }

        return actor;
    },

    formatWeatherStateHeader : (weatherState) => {
        if (weatherState == undefined){
            return "formatWeatherStateHeader : weatherState is undefined";
        }

        var header = ""
            + weatherState.weatherStateHeader
            + ", "
            + UiUtils.convertTemperature(weatherState.temperature, weatherState.temperatureScale)
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
}
const UiFactory = {
    createIconButton : (accessibleName, iconName) => {
        button = Main.panel.statusArea.aggregateMenu._system._createActionButton(iconName, accessibleName);
        return button
    },

    createIcon : (iconName, name) => {
        var icon =  new St.Icon({
            icon_name: iconName,
            style_class: "system-status-icon weather-icon",
            accessible_name : name || Math.random().toString(),
            name : name || Math.random().toString()
        });

        return icon;
    },

    createCurrentWeatherPopupMenuItem : () => {
        let weatherHeaderLabel = new St.Label({
            style_class: "current-weather-header",
            text: NoDataText,
            accessible_name : "weatherHeaderLabel",
            name : "weatherHeaderLabel"
        });

        let locationLabel = new St.Label({
            style_class: "current-weather-location",
            text: NoDataText,
            accessible_name : "locationLabel",
            name : "locationLabel"
        });

        let informationLayout = new St.BoxLayout({
            vertical:true,
            style_class : "current-weather-information",
            accessible_name : "informationLayout",
            name : "informationLayout",
        });

        informationLayout.add_child(locationLabel);
        informationLayout.add_child(weatherHeaderLabel);

        let weatherIcon = UiFactory.createIcon(RadioIcons.Unchecked, "currentWeatherIcon");

        let menuItemLayout = new St.BoxLayout({
            accessible_name : "currentWeatherLayout",
            name : "currentWeatherLayout"
        });

        menuItemLayout.add_child(weatherIcon);
        menuItemLayout.add_child(informationLayout);

        let menuItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        menuItem.actor.add_child(menuItemLayout);
        return menuItem;
    },

    createPoweredByMenuItem : () => {
        let poweredByInfo = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        let poweredByLabel = new St.Label({
            text : NoDataText,
            name : "poweredByLabel"
        });

        poweredByInfo.actor.add_actor(poweredByLabel);
        return poweredByInfo;
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

        WeatherStateUpdater.update(WeatherState)

        this.refreshTrayButton(WeatherState);
        this.refreshPopup(WeatherState);
    },

    initTrayButton : function(){
        // Label
        let _buttonLabel = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: NoDataText
        });

        let _buttonWeatherIcon = new St.Icon({
            icon_name: RadioIcons.Unchecked,
            style_class: "system-status-icon"
        });

        this.trayButton = {
            weatherIcon  : _buttonWeatherIcon,
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
        // Update Current Weather
        // Update Current Weather Icon
        UiUtils.findChildActorByNamePath(this._itemCurrentWeatherInfo.actor,
                "currentWeatherLayout",
                "currentWeatherIcon")
            .icon_name = weatherState.weatherStateIcon || RadioIcons.Unchecked;

        // Update Weather Header
        UiUtils.findChildActorByNamePath(this._itemCurrentWeatherInfo.actor,
                "currentWeatherLayout",
                "informationLayout",
                "weatherHeaderLabel")
            .text = UiUtils.formatWeatherStateHeader(weatherState);

        // Update Location
        UiUtils.findChildActorByNamePath(this._itemCurrentWeatherInfo.actor,
            "currentWeatherLayout",
            "informationLayout",
            "locationLabel")
        .text = weatherState.location;

        UiUtils.findChildActorByNamePath(this._poweredByInfo.actor,
            "poweredByLabel")
        .text = PoweredByText + weatherState.providerName;
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