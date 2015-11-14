describe('The CamlParser should parse a CAML Query and allow access to all its components', function() {
    var $spCamlParser;
    beforeEach(module('ngSharepoint'));
    beforeEach(inject(function(_$spCamlParser_) {
        $spCamlParser = _$spCamlParser_;
    }));
    it('returns all view Fields of a CAML Query', function() {
        var caml = '<View><ViewFields><FieldRef Name="Test"/><FieldRef Name="ID"/></ViewFields></View>';
        expect($spCamlParser.parse(caml).getViewFields()).toEqual(['Test', 'ID']);
    });
    it('returns a single where object of a CAML Query', function() {
        var caml = '<View><Query><Where><Eq><FieldRef Name="Test"/><Value>Value</Value></Eq></Where></Query></View>';
        expect($spCamlParser.parse(caml).getWhere()).toEqual({operator: 'Eq', column: 'Test', value: 'Value'});
    });
    it('returns a concatenated where object from a CAML Query', function() {
        var caml = '<View><Query><And><Where><Eq><FieldRef Name="Test"/><Value>Value</Value></Eq></Where><Where><Includes><FieldRef Name="Name"/><Value>Sharepoint</Value></Includes></Where></And></Query></View>';
        expect($spCamlParser.parse(caml).getWhere()).toEqual({concat: 'And', queries: [{operator: 'Eq', column: 'Test', value: 'Value'}, {operator: 'Includes', column: 'Name', value: 'Sharepoint'}]});
    });
    it('has a limit', function() {
        var caml = '<View><RowLimit>5</RowLimit></View>';
        expect($spCamlParser.parse(caml).getLimit()).toEqual(5);
    });
});
