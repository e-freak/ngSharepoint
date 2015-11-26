describe('The $spProvider', function() {
    var spProvider;
    beforeEach(module('ngSharepoint', function($spProvider) {
        spProvider = $spProvider;
    }));
    it('should set the site URL when passing a valid string', inject(function() {
        spProvider.setSiteUrl('http://test.com');
        expect(spProvider.$get().getSiteUrl()).toEqual('http://test.com');
    }));
    it('should throw an exception when passing undefined to setSiteUrl', inject(function() {
        expect(function() {
            spProvider.setSiteUrl(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing an Integer to setSiteUrl', inject(function() {
        expect(function() {
            spProvider.setSiteUrl(4);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing an Object to setSiteUrl', inject(function() {
        expect(function() {
            spProvider.setSiteUrl({siteUrl: 'dasds'});
        }).toThrow('Invalid Argument Exception');
    }));
    it('should set the host URL when passing a valid string', inject(function() {
        spProvider.setHostUrl('http://test.com');
        expect(spProvider.$get().getHostUrl()).toEqual('http://test.com');
    }));
    it('should throw an exception when passing undefined to setHostUrl', inject(function() {
        expect(function() {
            spProvider.setHostUrl(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should set the connection mode when passing a valid mode', inject(function() {
        spProvider.setConnectionMode('REST');
        expect(spProvider.$get().getConnectionMode()).toEqual('REST');
        spProvider.setConnectionMode('JSOM');
        expect(spProvider.$get().getConnectionMode()).toEqual('JSOM');
    }));
    it('should throw an exception when passing undefined to setConnectionMode', inject(function() {
        expect(function() {
            spProvider.setConnectionMode(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing an invalid mode to setConnectionMode', inject(function() {
        expect(function() {
            spProvider.setConnectionMode('invalid');
        }).toThrow('Invalid Argument Exception');
    }));
    it('should set the access token when passing a valid string', inject(function() {
        spProvider.setAccessToken('dasd7as8dzsahd8as8d7h38h');
        expect(spProvider.$get().getAccessToken()).toEqual('dasd7as8dzsahd8as8d7h38h');
    }));
    it('should throw an exception when passing undefined to setAccessToken', inject(function() {
        expect(function() {
            spProvider.setAccessToken(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should enable autoload when passing true', inject(function() {
        spProvider.setAutoload(true);
        expect(spProvider.$get().getAutoload()).toEqual(true);
    }));
    it('should disable autoload when passing false', inject(function() {
        spProvider.setAutoload(false);
        expect(spProvider.$get().getAutoload()).toEqual(false);
    }));
    it('should throw an exception when passing undefined to setAutoload', inject(function() {
        expect(function() {
            spProvider.setAutoload(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing a string to setAutoload', inject(function() {
        expect(function() {
            spProvider.setAutoload('true');
        }).toThrow('Invalid Argument Exception');
    }));
});