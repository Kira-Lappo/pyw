imports.searchPath.unshift("/home/kira/.local/share/gnome-shell/extensions/pretty-yandex-weather@dnaplayer.hmail.com");
// imports.searchPath.unshift("./"); // not working
// imports.searchPath.unshift("~/.local/share/gnome-shell/extensions/pretty-yandex-weather@dnaplayer.hmail.com"); // not working

log("kira",imports.searchPath);

const Main = imports.ui.main;
try{
const Pyw = imports.pyw;
}
catch(e){
    log("kira", e);
}

let button;

function init() {
    button = Pyw.createTrayButton();
}

function enable() {
    Main.panel.addToStatusArea('pywMenu', button);
}

function disable() {
    button.destroy();
}
