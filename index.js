/*jshint smarttabs:true */
(function (root, factory) {
	"use strict";
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals (root is window)
		root.getTLIdEncoderDecoder = factory();
	}
}(this, function () {

    "use strict";
    
    var LINE_START = true;
    var LINE_END = false;

    var getIncFuncDecFunc = function(skipInit) {
        var r = skipInit ? skipInit : 1;
        var dec = function() {
            if (--r === 0) { return true; }
            return false;
        };
        var inc = function() {
            r++;
            return false;
        };
        return  { inc: inc, dec: dec };
    };

    var searchLine = function(text, decStr, incStr, direc, startPos, decFunc, incFunc) {

        var pos = direc < 1 ? startPos - incStr.length : startPos,
            other = pos + (direc * incStr.length);

        if (startPos === LINE_START) {
            pos = 0;
        }

        if (startPos === LINE_END) { 
            pos = text.length - incStr.length;
        }

        while (
            (pos >= 0)  &&
            (pos <= text.length - incStr.length)
        ) {
            other = pos + incStr.length;
            var ss = text.substring(pos, other);
            if ((ss === decStr) && decFunc()) {
                return direc < 1 ? other : pos;
            }
            if ((incStr !== decStr) && (ss === incStr)) { incFunc(); }
            pos = pos + direc;
        }

        return false;

    };

    var searchFile = function(texts, decStr, incStr, direc, cursor, skipInit) {

        var line = cursor.line,
            pos,
            incDecFunc = getIncFuncDecFunc(skipInit);

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
                decStr,
                incStr,
                direc,
                getSearchStartPos(line),
                incDecFunc.dec,
                incDecFunc.inc
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
            [">", "<"],
            ['"', '"'],
            ["'", "'"]
        ];
        
        var skip = (function() {
            var m = input.match(/([0-9]+).+/);
            return m ? m[1] : 1;
        }());

        for (var j=0; j<=1; j++) {
            for (var i=0; i<pairs.length; i++) {
                if (pairs[i][j] == input.substr(input.length -1)) {
                    return {
                        skip: skip,
                        enc: [pairs[i][0], pairs[i][1]],
                        a: (input.substr(0, 1) === 'a')
                    };
                }
            }
        }

        return {
            skip: skip,
            enc: [input.substr(input.length-1), input.substr(input.length-1)],
            a: ((input.length > 1) && (input.substr(0, 1) === 'a'))
        };
    };

    var getBeginningEndCursors = function(texts, lr, cursor) {

        var beginning = searchFile(texts, lr.enc[0], lr.enc[1], -1, cursor, lr.skip),
            end = searchFile(texts, lr.enc[1], lr.enc[0], 1, cursor, lr.skip);

        if ((beginning === false) || (end === false)) {
            return false;
        }

        beginning.len = lr.enc[0].length;
        end.len = lr.enc[1].length;
        
        return [beginning, end];
    };
    
    var getTextObjectCursors = function(texts, lr, cursor) {
        
        var r = getBeginningEndCursors(texts, lr, cursor);
        
        if (r === false) { return; }
        
        var m = function(o, left) {
            if (lr.a) {
                return {line: o.line, ch: o.ch + (o.len * (left ? -1 : 1))};
            }
            return {line: o.line, ch: o.ch};
        };
        
        return [m(r[0], true), m(r[1], false)];
        
    };
    
    return {
        searchLine: searchLine,
        searchFile: searchFile,
        getLeftRight: getLeftRight,
        getBeginningEndCursors: getBeginningEndCursors,
        getTextObjectCursors: getTextObjectCursors,
        getIncFuncDecFunc: getIncFuncDecFunc
    };
    
}));