# ngSharepoint
[![Build Status](https://img.shields.io/travis/maxjoehnk/ngSharepoint.svg?style=flat-square)](https://travis-ci.org/maxjoehnk/ngSharepoint)
[![Code Climate](https://img.shields.io/codeclimate/github/maxjoehnk/ngSharepoint.svg?style=flat-square)](https://codeclimate.com/github/maxjoehnk/ngSharepoint)
[![Coverage](https://img.shields.io/codeclimate/coverage/github/maxjoehnk/ngSharepoint.svg?style=flat-square)](https://codeclimate.com/github/maxjoehnk/ngSharepoint)
[![Codacy](https://img.shields.io/codacy/a46ee49ad795445789bd69df6073e180.svg?style=flat-square)](https://www.codacy.com/app/maxjoehnk/ngSharepoint/dashboard)
[![bitHound Score](https://www.bithound.io/github/maxjoehnk/ngSharepoint/badges/score.svg)](https://www.bithound.io/github/maxjoehnk/ngSharepoint)
[![License](https://img.shields.io/badge/license-Apache%202.0-brightgreen.svg?style=flat-square)](https://github.com/maxjoehnk/ngSharepoint/blob/master/LICENSE)

Sharepoint Bindings for AngularJS.

##Features
- Connect to a Sharepoint Instance either with either the JSOM or RESTful API
- Access Sharepoint Lists with a JSON API, SQL or standard CamlQueries
- Automatic (de)serialization of Classes to List Objects (implement __deserialize and __serialize for it to work)
- Pre-built directives for Lists and Userprofiles

##Installation
You can install ngSharepoint from bower with
```
bower install ngSharepoint
```
or download it directly from [here](https://github.com/maxjoehnk/ngSharepoint/tree/master/dist).

##Usage
First you'll need to add ngSharepoint as a dependency in your Angular Module Definition
```js
angular.module('myApp', ['ngSharepoint']);
```
Then configure ngSharepoint to connect to your Sharepoint instance and use either the JSOM or REST Connection Mode.
```js
angular.module('myApp')
  .config(['$spProvider', function($spProvider) {
    $spProvider.setSiteUrl("http://path-to-your-sharepoi.nt");
    $spProvider.setConnectionMode("JSOM"); //Optional
  }]);
```
