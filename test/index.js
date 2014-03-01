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
    
    
	it('can find backwards', function() {
        expect(mod.searchLine(text1[3], 'om', -1, 15)).to.eql(7);
	});
	
	it('can find backwards (start)', function() {
        expect(mod.searchLine(text1[0], 'd', -1, 7)).to.eql(1);
	});
	
	it('can find forwards (end)', function() {
        expect(mod.searchLine(text1[0], '{', 1, 1)).to.eql(43);
	});
	
	it('can fail to find backwards', function() {
        expect(mod.searchLine(text1[3], 'ox', -1, 15)).to.eql(false);
	});
	
	it('can find forwards', function() {
        expect(mod.searchLine(text1[0], 'mo', 1, 1)).to.eql(35);
	});
	
	it('can fail to find forwards', function() {
        expect(mod.searchLine(text1[3], 'ox', 1, 1)).to.eql(false);
	});
    
    it('can search a file backwards', function() {
        expect(
            mod.searchFile(text1, 'r Com', -1, {line: 10, ch: 1})
        ).to.eql({line: 3, ch: 7});
    });
    
    it('can search a file forwards', function() {
        expect(
            mod.searchFile(text1, 'DocumentManager =', 1, {line: 0, ch: 0})
        ).to.eql(
            {line: 4, ch: 4}
        );
    });
    
    it('can search a file backwards and find things at EOL', function() {
        expect(
            mod.searchFile(text1, ';', -1, {line: 3, ch: 1})
        ).to.eql({line: 1, ch: 13});
    });
    
    it('can search a file forwards and find things at BOL', function() {
        expect(
            mod.searchFile(text1, '"', 1, {line: 0, ch: 0})
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