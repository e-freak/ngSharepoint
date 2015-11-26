describe('The camlBuilder', function() {
    var CamlBuilder;
    beforeEach(module('ngSharepoint'));
    beforeEach(inject(function(_CamlBuilder_) {
        CamlBuilder = _CamlBuilder_;
    }));
    beforeEach(inject(function(_CamlTag_) {
        CamlTag = _CamlTag_;
    }));
    //findByName
    it('finds the right Tag', function() {
        var builder = new CamlBuilder();
        var testTag = builder.push('Test');
        builder.push('Value');
        expect(builder.findByName('Test')).toEqual([testTag]);
    });
    //build
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
    //isEmpty
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
    //buildFromJson
    it('builds a full camlquery from a json object', function() {
        var json = {
            columns: [
                'Column1',
                'Column2'
            ],
            query: {
                comparator: '==',
                column: 'Column1',
                value: 'Value'
            },
            limit: 42,
            order: [
                {
                    column: 'Column1'
                },
                {
                    column: 'Column2',
                    asc: false
                }
            ]
        };
        var caml = '<View>' +
                '<ViewFields><FieldRef Name="Column1"/><FieldRef Name="Column2"/></ViewFields>' +
                '<Query>' +
                    '<Where><Eq><FieldRef Name="Column1"/><Value>Value</Value></Eq></Where>' +
                    '<OrderBy><FieldRef Name="Column1" Ascending="TRUE"/><FieldRef Name="Column2" Ascending="FALSE"/></OrderBy>' +
                '</Query>' +
                '<RowLimit>42</RowLimit>' +
            '</View>';
        var builder = new CamlBuilder();
        builder.buildFromJson(json);
        expect(builder.build()).toEqual(caml);
    });
    it('adds camltags to an existing camlquery', function() {
        var json = {
            columns: ['Column1', 'Column2']
        };
        var builder = new CamlBuilder();
        builder.push('View').push('RowLimit', {}, 42);
        builder.buildFromJson(json);
        expect(builder.build()).toEqual('<View><RowLimit>42</RowLimit><ViewFields><FieldRef Name="Column1"/><FieldRef Name="Column2"/></ViewFields></View>');
    });
    it('does nothing when passing a string', function() {
        var json = 'string';
        var builder = new CamlBuilder();
        builder.push('Tag');
        builder.buildFromJson(json);
        expect(builder.build()).toEqual('<Tag/>');
    });
});
