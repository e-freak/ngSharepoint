describe('The CamlTag should build a valid XML String', function() {
	var CamlTag;
	beforeEach(module('ngSharepoint'));
	beforeEach(inject(function(_CamlTag_) {
		CamlTag = _CamlTag_;
	}));
	it('builds a valid XML Tag', function() {
		expect(new CamlTag('Test').build()).toEqual('<Test/>');
	});
	it('builds a valid XML Tag with Attributes', function() {
		expect(new CamlTag('Test', {Type: 'Test'}).build()).toEqual('<Test Type="Test"/>');
	});
	it('builds a valid XML Hierarchy', function() {
		var tag = new CamlTag('Test');
		tag.push('Child');
		expect(tag.build()).toEqual('<Test><Child/></Test>');
	});
	it('builds a valid XML Tag with a value', function() {
		expect(new CamlTag('Test', {}, 'Value').build()).toEqual('<Test>Value</Test>');
	});
	it('builds a valid XML Tag with a value and attributes', function() {
		expect(new CamlTag('Test', {Attr: 'attr'}, 'Value').build()).toEqual('<Test Attr="attr">Value</Test>');
	});
});