/*global window, define, DocumentManager, EditorManager, CommandManager, Menus, brackets */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (/* require, exports, module */) {
    
    "use strict";
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Menus = brackets.getModule("command/Menus"),
        EditorManager = brackets.getModule("editor/EditorManager");
    
    // ============================================================================

    var LINE_START = true,
        LINE_END = false;

    var searchLine = function(text, forStr, direc, startPos) {

        var pos = direc < 1 ? startPos - forStr.length : startPos,
            other = pos + (direc * forStr.length);

        if (startPos === LINE_START) {
            pos = 0;
        }

        if (startPos === LINE_END) {
            pos = text.length - forStr.length;
        }

        while (
            (pos >= 0)  &&
            (pos <= text.length - forStr.length)
        ) {
            other = pos + forStr.length;
            var ss = text.substring(pos, other);
            if (ss === forStr) {
                return direc < 1 ? other : pos;
            }
            pos = pos + direc;
        }

        return false;

    };

    var searchFile = function(texts, forStr, direc, cursor) {

        var line = cursor.line;
        var pos;

        var getSearchStartPos = function() {
            if (line === cursor.line) {
                return cursor.ch;
            }
            if (direc > -1) {
                return LINE_START;
            }
            return LINE_END;
        };

        while ((line > -1) && (line < texts.length)) {
            pos = searchLine(
                texts[line],
                forStr,
                direc,
                getSearchStartPos(line)
            );
            if (pos !== false) {
                return { line: line, ch: pos };
            }
            line = line + direc;
        }
        return false;
    };

    var getLeftRight = function(input) {    
        var pairs = [
            ["{", "}"],
            ["(", ")"],
            ["[", "]"],
            ["<", ">"],
            ["'", "'"]
        ];

        var getInside = function(isSecondMatch) {
            if (input.length === 1) { return !isSecondMatch; }
            return input.substr(0, 1) === 'i';
        };

        for (var i=0; i<pairs.length; i++) {
            for (var j=0; j<=1; j++) {
                if (pairs[i][j] == input.substr(input.length -1)) {
                    return {
                        enc: [pairs[i][0], pairs[i][1]],
                        ins: getInside((j === 1), input)
                    };
                }
            }
        }

        return {enc: [input, input], ins: getInside(false)};
    };

    var getTextObjectCursors = function(texts, input, cursor) {

        var lr = getLeftRight(input),
            beginning = searchFile(texts, lr.enc[0], -1, cursor),
            end = searchFile(texts, lr.enc[1], 1, cursor);

        if ((beginning === false) || (end === false)) {
            return false;
        }

        if (!lr.ins) {
            beginning.ch = beginning.ch - lr.enc[0].length;
            end.ch = end.ch + lr.enc[1].length;
        }

        return [beginning, end];
    };


    function handleHelloWorld() {

        var docTexts = DocumentManager.getCurrentDocument().getText().split("\n");
        var docPos = EditorManager.getCurrentFullEditor().getCursorPos();

        var input = window.prompt("TextObject:", "");
        var r = getTextObjectCursors(docTexts, input, docPos);

        if (r === false) { return false; }

        EditorManager.getCurrentFullEditor().setSelection(
            r[0],
            r[1],
            true,
            0
        );

    }
    // ============================================================================

    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "forbesmyester.select-textobject";   // package-style naming to avoid collisions
    CommandManager.register("Hello World", MY_COMMAND_ID, handleHelloWorld);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(MY_COMMAND_ID);

    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)
});