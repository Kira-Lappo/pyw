imports.searchPath.unshift("/home/kira/.local/share/gnome-shell/extensions/pretty-yandex-weather@dnaplayer.hmail.com");

const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const Pyw = imports.pyw;


function init() {
    button = Pyw.createButton()
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
