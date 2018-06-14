
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

var text, button;

var Message = "Hi there!";

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: Message });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}

function createButton() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _showHello);
    return button;
}

const PywMenuButton = new Lang.Class({
    Name: 'PywMenuButton',

    Extends: PanelMenu.Button,

    _init: function() {

        // Label
        this._buttonLabel = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: _('PYW')
        });

        this._buttonWeatherIcon = new St.Icon({
            icon_name: 'system-run-symbolic',
            style_class: 'system-status-icon'
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

        let text = new St.Label({ style_class: 'helloworld-label', text: Message });
        this._itemCurrentWeatherInfo.actor.add_actor(text);

        this.menu.addMenuItem(this._itemCurrentWeatherInfo);
        this.menu.addMenuItem(this._separatorItem);
        this.menu.addMenuItem(this._itemFutureWeatherInfo);
    },

    _onStatusChanged: function(status) {
        this._idle = (status == GnomeSession.PresenceStatus.IDLE);
    },

    _onButtonHoverChanged: function(actor, event) {
        if (actor.hover) {
            actor.add_style_pseudo_class('hover');
            actor.set_style(this._button_background_style);
        } else {
            actor.remove_style_pseudo_class('hover');
            actor.set_style('background-color:;');
            // if (actor != this._urlButton){
            //     actor.set_style(this._button_border_style);
            // }
        }
    },

    _onScroll: function(actor, event) {
    }
});

function createTrayButton(){
    var button = new PywMenuButton();
    button.connect('button-press-event', _showHello);
    return button;
}