describe('The $query Service', function() {
    var $query;
    var mock;
    var spList;
    var log;
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
            log = $injector.get('$spLog');
            spyOn(log, 'error');
            spyOn(log, 'warn');
            spyOn(log, 'log');
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
    describe('reads only specific rows from a list', function() {
        it('where fields begin with', function() {
            $query.read().from('List').where('Column1').beginsWith('Te').exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'beginswith', column: 'Column1', value: 'Te'}});
        });
        it('where fields contain', function() {
            $query.read().from('List').where('Column1').contains('es').exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'contains', column: 'Column1', value: 'es'}});
        });
        it('where fields date ranges overlap', function() {
            var date = new Date();
            $query.read().from('List').where('Column1').dateRangesOverlap(date).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'daterangesoverlap', column: 'Column1', value: date}});
        });
        it('where fields are equal', function() {
            $query.read().from('List').where('Column1').equals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'equals', column: 'Column1', value: 4}});
        });
        it('where fields are greater equal', function() {
            $query.read().from('List').where('Column1').greaterEquals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'greaterequals', column: 'Column1', value: 4}});
        });
        it('where fields are greater', function() {
            $query.read().from('List').where('Column1').greater(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'greater', column: 'Column1', value: 4}});
        });
        it('where fields are in', function() {
            $query.read().from('List').where('Column1').in(['Value']).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'in', column: 'Column1', value: ['Value']}});
        });
        it('where fields include', function() {
            $query.read().from('List').where('Column1').includes(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'includes', column: 'Column1', value: 4}});
        });
        it('where fields are not null', function() {
            $query.read().from('List').where('Column1').isNotNull().exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'isnotnull', column: 'Column1'}});
        });
        it('where fields are null', function() {
            $query.read().from('List').where('Column1').isNull().exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'isnull', column: 'Column1'}});
        });
        it('where fields are less equal', function() {
            $query.read().from('List').where('Column1').lessEquals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'lessequals', column: 'Column1', value: 4}});
        });
        it('where fields are less', function() {
            $query.read().from('List').where('Column1').less(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'less', column: 'Column1', value: 4}});            
        });
        it('where fields do not equal', function() {
            $query.read().from('List').where('Column1').notEquals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'notequals', column: 'Column1', value: 4}});            
        });
        it('where fields do not include', function() {
            $query.read().from('List').where('Column1').notIncludes(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'notincludes', column: 'Column1', value: 4}});            
        });
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
    it('can not execute read after another query', function() {
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
    it('creates a row in a list', function() {
        $query.create().in('List').set('Data', 'Value').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}});
    });
    it('creates a row in a list', function() {
        $query.create().in('List').value('Data', 'Value').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}});
    });
    it('warns when calling where while creating a row', function() {
        $query.create({Data: 'Value'}).in('List').where('Data').equals('Value').exec();
        expect(log.warn).toHaveBeenCalledWith('where call is not necessary while creating entries');
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}, query: {comparator: 'equals', column: 'Data', value: 'Value'}});
    });
    it('can not execute read after another query', function() {
        expect(function() {
            $query.read().from('List').create({Data: 'Value'}).exec();
        }).toThrow('Cannot use create after another query type was selected');
    });
    it('updates all rows in a list', function() {
        $query.update({Data: 'Value'}).in('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'update', data: {Data: 'Value'}});
    });
    it('updates all rows in a list', function() {
        $query.update().in('List').set('Data', 'Value').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'update', data: {Data: 'Value'}});
    });
    it('can not execute update after another query', function() {
        expect(function() {
            $query.read().from('List').update({Data: 'Value'}).exec();
        }).toThrow('Cannot use update after another query type was selected');
    });
    it('deletes all rows from a list', function() {
        $query.delete().from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'delete'});
    });
    it('can not execute delete after another query', function() {
        expect(function() {
            $query.create({Data: 'Value'}).in('List').delete().exec();
        }).toThrow('Cannot use delete after another query type was selected');
    });
});