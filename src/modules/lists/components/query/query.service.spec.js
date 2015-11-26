describe('The $query Service', function() {
    var $query;
    var mock;
    var spList;
    beforeEach(module('ngSharepoint.Lists'));
    beforeEach(function() {
        spList = {
            query: jasmine.createSpy()
        };
        mock = {
            getList: function() {
                return spList;
            }
        };
        spyOn(mock, 'getList').and.callThrough();
        module(function($provide) {
            $provide.value('$spList', mock);
        });
        inject(function($injector) {
            $query = $injector.get('$query');
        });
    });
    it('reads from a list', function() {
        $query.read().from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read'});
    });
    it('reads only specific columns from a list', function() {
        $query.read(['Column1']).from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', columns: ['Column1']});
    });
    it('reads only specific rows from a list', function() {
        $query.read().from('List').where('Column1').equals(4).exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'equals', column: 'Column1', value: 4}});
    });
    it('reads only a certain amount of rows', function() {
        $query.read().from('List').limit(42).exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', limit: 42});
    });
    it('reads from a list in a specific order', function() {
        $query.read().from('List').orderBy('Column1').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', order: [{column: 'Column1', asc: true}]});
    });
    it('throws an exception when not specifying a list', function() {
        expect(function() {
            $query.read().exec();
        }).toThrow('No List specified');
    });
    it('can not run read after another query', function() {
        expect(function() {
            $query.create({Data: 'Value'}).in('List').read().exec();
        }).toThrow('Cannot use read after another query type was selected');
    });
    it('selects all columns when specifying an empty list', function() {
        $query.read([]).from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read'});
    });
    it('creates a row in a list', function() {
        $query.create({Data: 'Value'}).in('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}});
    });
    it('updates all rows in a list', function() {
        $query.update({Data: 'Value'}).in('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'update', data: {Data: 'Value'}});
    });
    it('deletes all rows in a list', function() {
        $query.delete().from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'delete'});
    })
});