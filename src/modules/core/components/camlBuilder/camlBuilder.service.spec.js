describe('The camlBuilder', function() {
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
    it('builds a valid XML Tree', function() {
        var builder = new CamlBuilder();
        builder.push('Test').push('WithAttr', {Attr: 'attr'});
        builder.push('Value', {}, 'Foo');
        builder.push('Empty');
        expect(builder.build()).toEqual('<Test><WithAttr Attr="attr"/></Test><Value>Foo</Value><Empty/>');
    });
});
