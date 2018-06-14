imports.searchPath.unshift("/home/kira/.local/share/gnome-shell/extensions/pretty-yandex-weather@dnaplayer.hmail.com");

const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Pyw = imports.pyw;

let button;

function init() {
    // button = Pyw.createButton()
    button = Pyw.createTrayButton();
}

function enable() {
    // Main.panel._rightBox.insert_child_at_index(button, 0);
    Main.panel.addToStatusArea('pywMenu', button);
}

function disable() {
    // Main.panel._rightBox.remove_child(button);
    button.destroy();
}
