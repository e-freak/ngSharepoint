describe('The camlBuilder', function() {
    var CamlBuilder;
    beforeEach(module('ngSharepoint'));
    beforeEach(inject(function(_CamlBuilder_) {
        CamlBuilder = _CamlBuilder_;
    }));
    beforeEach(inject(function(_CamlTag_) {
        CamlTag = _CamlTag_;
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
    it('adds a CamlTag to a XML Tree', function() {
        var builder = new CamlBuilder();
        builder.push(new CamlTag('Test'));
        expect(builder.build()).toEqual('<Test/>');
    });
    it('checks for an empty XML Tree', function() {
        var builder = new CamlBuilder();
        expect(builder.isEmpty()).toEqual(true);
    });
    it('isEmpty when there is only a selfclosing tag', function() {
        var builder = new CamlBuilder();
        builder.push('Empty');
        expect(builder.isEmpty()).toEqual(true);
    });
    it('checks for an empty XML Tree', function() {
        var builder = new CamlBuilder();
        builder.push('Test', {}, 'Value');
        expect(builder.isEmpty()).toEqual(false);
    });
    it('checks for an empty XML Tree', function() {
        var builder = new CamlBuilder();
        builder.push('Test', {Attr: 'Value'});
        expect(builder.isEmpty()).toEqual(false);
    });
    it('checks for an empty XML Tree', function() {
        var builder = new CamlBuilder();
        builder.push('Test');
        builder.push('Tag');
        expect(builder.isEmpty()).toEqual(false);
    });
    it('checks for an empty XML Tree', function() {
        var builder = new CamlBuilder();
        builder.push('Tag').push('Child');
        expect(builder.isEmpty()).toEqual(false);
    });
});
