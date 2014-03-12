/*jshint smarttabs:true */
(function (root, factory) {
	"use strict";
	if (typeof exports === 'object') {
        /* global exports: true */
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		exports = factory();
	} else if (typeof define === 'function' && define.amd) {
        /* global define: false */
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
        var range = (function() {
                var r = [0, text.length];
                if (direc == -1) {
                    r[1] = (startPos === LINE_END) ? text.length : startPos;
                } else {
                    r[0] = (startPos === LINE_START) ? 0 : startPos;
                }
                return r;
            }()),
            escapeRegExp = function(string) {
                return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            },
            prepend = direc > 0 ? "^" : "",
            append = direc < 1 ? "$" : "",
            reDecStr = (decStr instanceof RegExp) ? decStr : new RegExp(prepend + escapeRegExp(decStr) + append),
            reIncStr = (incStr instanceof RegExp) ? incStr : new RegExp(prepend + escapeRegExp(incStr) + append),
            limit = 9999,
            m;
        
        while ((range[0] != range[1]) && (--limit > 0)) {
            
            if ((m = text.substring(range[0], range[1]).match(reDecStr)) && decFunc()) {
                return {
                    ch: direc > 0 ? range[0] : m.index,
                    len: m[0].length
                };
            }
            
            if (
                (incStr !== decStr) &&
                (text.substring(range[0], range[1]).match(reIncStr))
            ) {
                incFunc();
            }
            
            if (direc > 0) {
                range[0] = range[0] + 1;
            } else {
                range[1] = range[1] - 1;
            }
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
                pos.line = line;
                return pos;
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

        //beginning.len = lr.enc[0].length;
        //end.len = lr.enc[1].length;
        
        return [beginning, end];
    };
    
    var getTextObjectCursors = function(texts, lr, cursor) {
        
        var r = getBeginningEndCursors(texts, lr, cursor);
        
        if (r === false) { return; }
        
        var m = function(o, left) {
            if (lr.a) {
                return {
                    line: o.line,
                    ch: o.ch + (!left ? o.len : 0)
                };
            }
            return {line: o.line, ch: o.ch + (left ? o.len : 0)};
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