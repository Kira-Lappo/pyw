const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

// Import icon names
const ActionIcons       = imports.iconNames.ActionIcons;
const CategoriesIcons   = imports.iconNames.CategoriesIcons;
const EmblemIcons       = imports.iconNames.EmblemIcons;
const WeatherIcons      = imports.iconNames.StatusIcons.Weather;
const RadioIcons        = imports.iconNames.StatusIcons.Radio;

// Import scales
const TemperatureScale = imports.temperatureScale.TemperatureScale;

const YandexWeatherProvider = imports.providers.yandexWeatherProvider.YandexWeatherProvider;

const Locale = imports.localeProvider.Locale;
const LocaleProvider = imports.localeProvider.LocaleProvider;

const PoweredByText         = "Powered by ";
const LastUpdatedDateTimeText         = "Updated: ";
const NoDataText            = "no-data";

const WeatherSettings = {
    temperatureScale            : TemperatureScale.CELSIUS,
    locale                      : Locale.RUSSIAN,
};

// Minsk only for now
const WeatherStateUpdateRequest = {
    latitude    : 53.9,
    longitute   : 27.56667,
    locale      : Locale.RUSSIAN
};

const WeatherState = {
    lastUpdatedDateTime         : new Date(),
    temperature                 : 0,
    weatherStateIcon            : RadioIcons.Unchecked,
    weatherStateHeader          : NoDataText,
    location                    : NoDataText
};

const WeatherStateUpdater = {

    _innerProvider : new YandexWeatherProvider(), // default provider

    update : (weatherState, callBack) => {

        // Just in case if callback is undefined
        callBack = callBack || (()=>{});

        try {
            WeatherStateUpdater.provider.getWeatherState(WeatherStateUpdateRequest, (newState) => {
                weatherState.temperature            = newState.temperature;
                weatherState.weatherStateIcon       = newState.weatherStateIcon;
                weatherState.weatherStateHeader     = newState.weatherStateHeader;
                weatherState.location               = newState.location;
                weatherState.lastUpdatedDateTime    = new Date();

                callBack(weatherState);

                log("kira", weatherState.temperature);
                log("kira", weatherState.weatherStateIcon);
                log("kira", weatherState.weatherStateHeader);
            });
        }
        catch(e){
            log("kira", e.toString());
            callBack(weatherState);
        }
    },

    get provider() {
        return this._innerProvider;
    },

    set provider(value) {
        this._innerProvider = value;
    }
};

const UiUtils = {
    findChildActor : (actor) => {
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

    formatWeatherStateHeader : (weatherState, weatherSettings) => {
        if (weatherState == undefined){
            return "formatWeatherStateHeader : weatherState is undefined";
        }

        var header = ""
            + weatherState.weatherStateHeader
            + ", "
            + UiUtils.formatTemperature(weatherState.temperature, weatherSettings.temperatureScale);

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
        }

        return value.toFixed(0);
    },

    formatTemperature : (tempreatureValue, scale) => {
        return UiUtils.convertTemperature(tempreatureValue, scale)
            + " "
            + scale;
    }
};

const UiFactory = {
    createIconButton : (accessibleName, iconName) => {
        var button = Main.panel.statusArea.aggregateMenu._system._createActionButton(iconName, accessibleName);
        button.name = accessibleName;
        return button;
    },

    createIcon : (iconName, name) => {
        name = name || Math.random().toString();
        var icon =  new St.Icon({
            icon_name: iconName,
            style_class: "system-status-icon weather-icon",
            accessible_name : name,
            name : name
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

    createButtonsMenuItem : (uiContext) => {
        let controlButtonsMenuItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        let menuItemLayout = new St.BoxLayout({
            accessible_name : "buttonsLayout",
            name : "buttonsLayout"
        });

        let refreshButton = UiFactory.createIconButton("refreshButton", EmblemIcons.Synchronizing);
        refreshButton.connect("clicked", () => {
            uiContext.refresh();
        });

        menuItemLayout.add_child(refreshButton);
        controlButtonsMenuItem.actor.add_child(menuItemLayout);
        return controlButtonsMenuItem;
    },

    createPoweredByMenuItem : (uiContext) => {
        let poweredByInfo = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        let poweredByLabel = new St.Button({
            x_align:  St.Align.START,
            reactive: true,
            can_focus: true,
            track_hover: true,
            accessible_name: "poweredByLabel",
            name : "poweredByLabel"
        });

        poweredByLabel.set_label(NoDataText);

        poweredByLabel.connect("clicked", () => {
            uiContext.menu.actor.hide();
            let url = WeatherStateUpdater.provider.homePageUri;
            Gtk.show_uri(null, url, global.get_current_time());
        });

        let lastUpdatedDateTime = new St.Label({
            x_align:  St.Align.START,
            style_class: "provider-info-last-updated",
            text : NoDataText,
            name : "lastUpdatedDateTime"
        });

        let menuItemLayout = new St.BoxLayout({
            x_align:  St.Align.START,
            vertical: true,
            accessible_name : "layout",
            name : "layout"
        });

        menuItemLayout.add_actor(poweredByLabel);
        menuItemLayout.add_actor(lastUpdatedDateTime);

        poweredByInfo.actor.add_actor(menuItemLayout);
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

        this.addToTray();

        this.refresh();

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1 * 60 * 60 * 1000, function() {
            this.refresh();
            return true; // Don't repeat
        }, null);
    },

    initTrayButton : function(){

        let buttonLabel = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: NoDataText,
            name: "label"
        });

        let buttonWeatherIcon = new St.Icon({
            icon_name: RadioIcons.Unchecked,
            style_class: "system-status-icon",
            name : "icon",
        });

        let buttonBox = new St.BoxLayout({
            name: "trayButtonlayout"
        });

        buttonBox.add_actor(buttonWeatherIcon);
        buttonBox.add_actor(buttonLabel);
        this.actor.add_actor(buttonBox);
    },

    initPopup : function(){
        this._itemCurrentWeatherInfo = UiFactory.createCurrentWeatherPopupMenuItem();
        this.menu.addMenuItem(this._itemCurrentWeatherInfo);

        this._controlButtonsInfo = UiFactory.createButtonsMenuItem(this);
        this.menu.addMenuItem(this._controlButtonsInfo);

        this._poweredByInfo = UiFactory.createPoweredByMenuItem(this);
        this.menu.addMenuItem(this._poweredByInfo);
    },

    refresh : function() {
        WeatherStateUpdater.update(WeatherState, (newWeatherState) => {
            this.refreshTrayButton(newWeatherState, WeatherSettings);
            this.refreshPopup(newWeatherState, WeatherSettings);
        });
    },

    refreshTrayButton : function(weatherState, weatherSettings) {
        let trayIcon = UiUtils.findChildActor(this.actor, "trayButtonlayout", "icon");
        trayIcon.icon_name = weatherState.weatherStateIcon || RadioIcons.Unchecked;

        let trayLabel = UiUtils.findChildActor(this.actor, "trayButtonlayout", "label");
        trayLabel.text = UiUtils.formatTemperature(weatherState.temperature, weatherSettings.temperatureScale) || "no data";
    },

    refreshPopup : function(weatherState, weatherSettings) {
        // Update Current Weather Icon
        let currentWeatherIcon = UiUtils.findChildActor(this._itemCurrentWeatherInfo.actor, "currentWeatherLayout", "currentWeatherIcon");
        currentWeatherIcon.icon_name = weatherState.weatherStateIcon || RadioIcons.Unchecked;

        // Update Weather Header
        let currentWeatherHeader = UiUtils.findChildActor(this._itemCurrentWeatherInfo.actor, "currentWeatherLayout", "informationLayout", "weatherHeaderLabel");
        currentWeatherHeader.text = UiUtils.formatWeatherStateHeader(weatherState, weatherSettings);

        // Update Location
        let locationLabel = UiUtils.findChildActor(this._itemCurrentWeatherInfo.actor, "currentWeatherLayout", "informationLayout", "locationLabel");
        locationLabel.text = weatherState.location;

        // Powered by
        let poweredByLabel =  UiUtils.findChildActor(this._poweredByInfo.actor, "layout", "poweredByLabel");
        poweredByLabel.set_label(PoweredByText + WeatherStateUpdater.provider.name);

        let lastUpdatedLabel =  UiUtils.findChildActor(this._poweredByInfo.actor, "layout", "lastUpdatedDateTime");
        lastUpdatedLabel.text = LastUpdatedDateTimeText + WeatherState.lastUpdatedDateTime.toLocaleString();
    },

    addToTray: function() {
        let targetBox = Main.panel._leftBox;
        let targetBoxChildren = targetBox.get_children();
        targetBox.insert_child_at_index(this.actor, targetBoxChildren.length);

        (Main.panel._menus || Main.panel.menuManager).addMenu(this.menu);
    }
});

function createTrayButton(){
    return new PywMenuButton();
}