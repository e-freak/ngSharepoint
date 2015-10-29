describe('The CamlTag should build a valid XML String', function() {
	it('builds a valid XML Tag', function() {
		var tag = new CamlTag('Test');
		expect(tag.build()).toEqual('<Test></Test>');
	});
});