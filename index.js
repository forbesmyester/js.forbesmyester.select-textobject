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
            prepend = direc > 0 ? "^" : "",
            append = direc < 1 ? "$" : "",
            reDecStr = new RegExp(prepend + (decStr) + append),
            reIncStr = new RegExp(prepend + (incStr) + append),
            limit = 9999,
            m,
            justDecremented;
        
        while ((range[0] != range[1]) && (--limit > 0)) {
            
            justDecremented = false;
            
            if (m = text.substring(range[0], range[1]).match(reDecStr)) {
                justDecremented = true;
                if (decFunc()) {
                    return {
                        ch: direc > 0 ? range[0] : m.index,
                        len: m[0].length
                    };
                }
            }
            
            if (
                (!justDecremented) &&
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
        
        if (
            (m = text.substring(range[0], range[1]).match(reDecStr)) &&
            decFunc()
        ) {
            return {
                ch: direc > 0 ? range[0] : m.index,
                len: m[0].length
            };
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
            }
            line = line + direc;
        }
        return false;
    };

    var getLeftRight = function(input) {
        
        var res = {
                "{": ["\\{", "\\}"],
                "(": ["\\(", "\\)"],
                "[": ["\\[", "\\]"],
                "<": ["<", ">"],
                ">": [">", "<"],
                '"': ['"', '"'],
                "`": ['`', '`'],
                "'": ["'", "'"],
                "w": ["\\W+", "\\W+"],
                "W": ["(^$|\\s+)", "(^$|\\s+)"],
                "s": ["\\.\\s+", "\\.+"],
                "B": ["\\{", "\\}"],
                "l": ["^\\s*", "$"]
            },
            matches,
            skip,
            needle,
            k,
            a;
        
        // TODO: 
        //  * t<>=tag
        //  * argument
        //  * indent
        //  * p=paragraph
        //  * f=file
        
        matches = input.match(/^([ia]?)([0-9]?)(.*)/);
        if (
            (matches[1] === '') &&
            (matches[2] === '') &&
            (matches[3] === '')
        ) {
            return false;
        }
        while (matches[3] === '') {
            matches.unshift(''); matches.pop();
        }
        if (matches[1] === '') {
            matches[1] = 'i';
        }
        if (!matches[2].match(/^[0-9]+$/)) {
            matches[2] = '1';
        }
        
        skip = parseInt(matches[2], 10);
        a = matches[1] == 'a' ? true : false;
        needle = matches[3];
        
        for (k in res) { if (res.hasOwnProperty(k)) {
            if (needle == k) {
                return {
                    skip: skip,
                    enc: [res[k][0], res[k][1]],
                    a: a,
                };
            }
        } }
        
        if (matches[3] == 't') {
            matches[3] = '<[a-zA-Z]+';
        }
        
        if (matches[3].substr(0, 1) === '<') {
            return {
                skip: skip,
                enc: ['<TAG[^>]*>', "</TAG>"].map(function(s) {
                        return s.replace('TAG', matches[3].substr(1));
                    }),
                a: a
            };
        }

        return {
            skip: skip,
            enc: [needle, needle],
            a: a
        };
    };

    var getBeginningEndCursors = function(texts, lr, cursor) {

        var beginning = searchFile(
                texts,
                lr.enc[0],
                lr.enc[1],
                -1,
                cursor,
                lr.skip
            ),
            end = searchFile(
                texts,
                lr.enc[1],
                lr.enc[0],
                1,
                cursor,
                lr.skip
            );

        if ((beginning === false) || (end === false)) {
            return false;
        }

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