/*jshint smarttabs:true */
(function (root, factory) {
	"use strict";
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([],factory);
	} else {
		// Browser globals (root is window)
		root.getTLIdEncoderDecoder = factory();
	}
}(this, function () {

"use strict";
    
var LINE_START = true;
var LINE_END = false;

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

return {
    searchLine: searchLine,
    searchFile: searchFile,
    getLeftRight: getLeftRight,
    getTextObjectCursors: getTextObjectCursors
};
    
}));