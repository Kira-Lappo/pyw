imports.searchPath.unshift("/home/kira/.local/share/gnome-shell/extensions/pretty-yandex-weather@dnaplayer.hmail.com");
// imports.searchPath.unshift("./"); // not working
// imports.searchPath.unshift("~/.local/share/gnome-shell/extensions/pretty-yandex-weather@dnaplayer.hmail.com"); // not working

log("kira",imports.searchPath);

const Main = imports.ui.main;
const Pyw = imports.pyw;

let button;

function init() {
    button = Pyw.createTrayButton();
}

function enable() {
    Main.panel.addToStatusArea("pywMenu", button);
}

function disable() {
    button.destroy();
}
