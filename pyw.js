
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

var Message = "Hi there!";

const ActionIcons = {
    SystemRun : "system-run-symbolic"
};

const CategoriesIcons = {
    PreferencesSystem : "preferences-system-symbolic"
};

const EmblemIcons = {
    System : "emblem-system-symbolic",
    Synchronizing : "emblem-synchronizing-symbolic"
};

const uiFactory = {
    createIconButton : (accessibleName, iconName) => {
        var button = new St.Button({
            reactive: true,
            can_focus: true,
            track_hover: true,
            accessible_name: accessibleName,
            style_class: "round-button"
        });

        button.child = new St.Icon({
            icon_name: iconName,
            style_class: "system-status-icon"
        });

        return button
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

        this._itemCurrentWeatherInfo = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        this._itemFutureWeatherInfo = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });

        this._separatorItem = new PopupMenu.PopupSeparatorMenuItem();

        let text = new St.Label({ style_class: "helloworld-label", text: Message });
        this._itemCurrentWeatherInfo.actor.add_actor(text);


        let button = uiFactory.createIconButton("SystemRun", ActionIcons.SystemRun);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = uiFactory.createIconButton("PreferencesSystem", CategoriesIcons.PreferencesSystem);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = uiFactory.createIconButton("System", EmblemIcons.System);
        this._itemFutureWeatherInfo.actor.add_actor(button);

        button = uiFactory.createIconButton("Synchronizing", EmblemIcons.Synchronizing);
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