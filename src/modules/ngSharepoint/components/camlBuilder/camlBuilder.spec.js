describe('The camlBuilder should build a tree of camlTags to a valid XML', function() {
	var CamlBuilder;
	beforeEach(module('ngSharepoint'));
	beforeEach(inject(function(_CamlBuilder_) {
		CamlBuilder = _CamlBuilder_;
	}));
	it('finds the right Tag', function() {
		var builder = new CamlBuilder();
		var testTag = builder.push('Test');
		builder.push('Value');
		expect(builder.findByName('Test')).toEqual([testTag]);
	});
});