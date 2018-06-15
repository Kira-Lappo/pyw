
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
const WeatherIcons       = IconNames.StatusIcons.Weather;

const TemperatureScale = {
    CELSIUS     : "°C",
    KELVIN      : "K",
    FARENHEIT   : "°F",
}

const WeatherState = {
    temperatureScale            : TemperatureScale.CELSIUS,
    temperature                 : 21,
    weatherStateIcon            : null,
    weatherStateHeader          : "Clear",
    location                    : "Minsk, Belarus"
}

const UiFactory = {
    createIconButton : (accessibleName, iconName) => {
        var button = new St.Button({
            reactive: true,
            can_focus: true,
            track_hover: true,
            accessible_name: accessibleName,
            style_class: "round-button"
        });

        button.child = UiFactory.createIcon(iconName);
        return button
    },

    createIcon : (iconName) => {
        var icon =  new St.Icon({
            icon_name: iconName,
            style_class: "system-status-icon"
        });

        return icon;
    },

    createCurrentWeatherPopupMenuItem : (weatherState) => {
        let menuItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        let weatherStateHeader = UiFactory.formatWeatherStateHeader(weatherState);
        let text = new St.Label({
            style_class: "current-weather-header",
            text: weatherStateHeader
        });

        let icon = UiFactory.createIcon(WeatherIcons.Clear);

        menuItem.actor.add_actor(icon);
        menuItem.actor.add_actor(text);
        return menuItem;
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

        // Label
        this._buttonLabel = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: _("PYW")
        });

        this._buttonWeatherIcon = new St.Icon({
            icon_name: "system-run-symbolic",
            style_class: "system-status-icon"
        });

        // Panel menu item - the current class
        let menuAlignment = 1.0 - (80 / 100);
        if (Clutter.get_default_text_direction() == Clutter.TextDirection.RTL){
            menuAlignment = 1.0 - menuAlignment;
        }

        this.parent(menuAlignment);

        // Putting the panel item together
        let buttonBox = new St.BoxLayout();
        buttonBox.add_actor(this._buttonWeatherIcon);
        buttonBox.add_actor(this._buttonLabel);
        this.actor.add_actor(buttonBox);

        let targetBox = Main.panel._leftBox
        let targetBoxChildren = targetBox.get_children();
        targetBox.insert_child_at_index(this.actor, targetBoxChildren.length);

        if (Main.panel._menus === undefined){
            Main.panel.menuManager.addMenu(this.menu);
        }
        else {
            Main.panel._menus.addMenu(this.menu);
        }

        this._itemCurrentWeatherInfo = UiFactory.createCurrentWeatherPopupMenuItem(WeatherState);

        this._itemFutureWeatherInfo = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        this._separatorItem = new PopupMenu.PopupSeparatorMenuItem();




        let button = UiFactory.createIconButton("SystemRun", ActionIcons.SystemRun);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = UiFactory.createIconButton("PreferencesSystem", CategoriesIcons.PreferencesSystem);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = UiFactory.createIconButton("System", EmblemIcons.System);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = UiFactory.createIconButton("Synchronizing", EmblemIcons.Synchronizing);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = UiFactory.createIconButton("fog", WeatherIcons.Fog);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        this.menu.addMenuItem(this._itemCurrentWeatherInfo);
        this.menu.addMenuItem(this._separatorItem);
        this.menu.addMenuItem(this._itemFutureWeatherInfo);
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