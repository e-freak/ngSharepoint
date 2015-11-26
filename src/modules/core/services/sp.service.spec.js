describe('The $spProvider', function() {
    var spProvider;
    beforeEach(module('ngSharepoint', function($spProvider) {
        spProvider = $spProvider;
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
    it('should throw an exception when passing undefined to setHostUrl', inject(function() {
        expect(function() {
            spProvider.setHostUrl(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing undefined to setConnectionMode', inject(function() {
        expect(function() {
            spProvider.setConnectionMode(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing undefined to setAccessToken', inject(function() {
        expect(function() {
            spProvider.setAccessToken(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
    it('should throw an exception when passing undefined to setAutoload', inject(function() {
        expect(function() {
            spProvider.setAutoload(undefined);
        }).toThrow('Invalid Argument Exception');
    }));
});