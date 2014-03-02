/* jshint smarttabs:true */
/* global expect: false, describe: false, it: false */
(function (root, factory) {

	"use strict";

	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('expect.js'),
			require('../index.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		return define(['../index.js'], factory.bind(this, expect));
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(expect, root.returnFuncToAsyncFunc);
	}
}(this, function (expect, mod) {

"use strict";

describe('find in line',function() {
	
    var text1 = [
        'define(function (require, exports, module) {',
        '"use strict";',
        '',
        'var CommandManager = brackets.getModule("command/CommandManager"),',
        '    DocumentManager = brackets.getModule("document/DocumentManager"),',
        '    Menus = brackets.getModule("command/Menus"),',
        '    EditorManager = brackets.getModule("editor/EditorManager");',
        '',
        '',
        '// ============================================================================',
        'function handleHelloWorld() {',
        '    var pairs = [',
        '        ["(", ")"],',
        '        ["<", ">"],',
        '        ["\'", "\'"],',
        '    ];',
        '',
        '    var docText = DocumentManager.getCurrentDocument().getText();',
        '    var docPos = EditorManager.getCurrentFullEditor().getCursorPos();',
        '',
        '}',
        '// ============================================================================'
    ];
    
    
	it('can inc dec', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(iD.dec()).to.equal(true);
        var iD2 = mod.getIncFuncDecFunc();
        iD2.inc();
        expect(iD2.dec()).to.equal(false);
        iD2.inc();
        iD2.inc();
        expect(iD2.dec()).to.equal(false);
        iD2.inc();
        expect(iD2.dec()).to.equal(false);
        expect(iD2.dec()).to.equal(false);
        expect(iD2.dec()).to.equal(true);
	});
    
	it('can find backwards', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine(text1[3], 'om', 'om', -1, 15, iD.dec, iD.inc)).to.eql(7);
	});
    
	it('can handle inc dec', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine('if (  (cars) && (bus)  ) {', '(', ')', -1, 14, iD.dec, iD.inc)).to.eql(4);
	});
	
	it('can find backwards (start)', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine(text1[0], 'd', 'd', -1, 7, iD.dec, iD.inc)).to.eql(1);
	});
	
	it('can find forwards (end)', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine(text1[0], '{',  '}',  1, 1, iD.dec, iD.inc)).to.eql(43);
	});
	
	it('can fail to find backwards', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine(text1[3], 'ox', 'ox', -1, 15, iD.dec, iD.inc)).to.eql(false);
	});
	
	it('can find forwards', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine(text1[0], 'mo', 'mo', 1, 1, iD.dec, iD.inc)).to.eql(35);
	});
	
	it('can fail to find forwards', function() {
        var iD = mod.getIncFuncDecFunc();
        expect(mod.searchLine(text1[3], 'ox', 'ox', 1, 1, iD.dec, iD.inc)).to.eql(false);
	});
    
    it('can search a file backwards', function() {
        expect(
            mod.searchFile(text1, 'r Com', 'r Com', -1, {line: 10, ch: 1})
        ).to.eql({line: 3, ch: 7});
    });
    
    it('can search a file forwards', function() {
        expect(
            mod.searchFile(text1, 'DocumentManager =', 'DocumentManager =', 1, {line: 0, ch: 0})
        ).to.eql(
            {line: 4, ch: 4}
        );
    });
    
    it('can search a file backwards and find things at EOL', function() {
        expect(
            mod.searchFile(text1, ';', ';', -1, {line: 3, ch: 1})
        ).to.eql({line: 1, ch: 13});
    });
    
    it('can search a file forwards and find things at BOL', function() {
        expect(
            mod.searchFile(text1, '"', '"', 1, {line: 0, ch: 0})
        ).to.eql(
            {line: 1, ch: 0}
        );
    });
    
    it('can get left right enclosers', function() {
        expect(mod.getLeftRight('{')).to.eql({enc: ['{', '}'], ins: true});
        expect(mod.getLeftRight('}')).to.eql({enc: ['{', '}'], ins: false});
        expect(mod.getLeftRight('i[')).to.eql({enc: ['[', ']'], ins: true});
        expect(mod.getLeftRight('a[')).to.eql({enc: ['[', ']'], ins: false});
        expect(mod.getLeftRight('i]')).to.eql({enc: ['[', ']'], ins: true});
        expect(mod.getLeftRight('a]')).to.eql({enc: ['[', ']'], ins: false});
        expect(mod.getLeftRight('a')).to.eql({enc: ['a', 'a'], ins: true});
    });
	
    it('find cursors', function() {
        expect(
            mod.getTextObjectCursors(
                text1,
                '{',
                {line: 13, ch: 0}
            )
        ).to.eql([{line: 10, ch: 29}, {line: 20, ch: 0}]);
    });
});

}));