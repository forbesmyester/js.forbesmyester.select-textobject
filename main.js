/*global window, define, brackets */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require /*, exports, module */) {
    
    "use strict";
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Menus = brackets.getModule("command/Menus"),
        EditorManager = brackets.getModule("editor/EditorManager");
    

    var ind = require('index');
    
    
    function handleHelloWorld() {

        var docTexts = DocumentManager.getCurrentDocument().getText().split("\n");

        var r = ind.getTextObjectCursors(
            docTexts,
            ind.getLeftRight(window.prompt("TextObject:", "")),
            EditorManager.getCurrentFullEditor().getCursorPos()
        );
        
        if (r === false) { return false; }

        EditorManager.getCurrentFullEditor().setSelection(
            r[0],
            r[1],
            true,
            0
        );

    }
    
    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "forbesmyester.select-textobject";   // package-style naming to avoid collisions
    CommandManager.register("Select TextObject", MY_COMMAND_ID, handleHelloWorld);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(MY_COMMAND_ID);

    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)
});