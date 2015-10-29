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
		expect(new CamlTag('Test', {Type: "Test"}).build()).toEqual('<Test Type="Test"/>');
	});
});