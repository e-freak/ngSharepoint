# ngSharepoint
[![Build Status](https://img.shields.io/travis/maxjoehnk/ngSharepoint.svg?style=flat-square)](https://travis-ci.org/maxjoehnk/ngSharepoint)
[![Code Climate](https://img.shields.io/codeclimate/github/kabisaict/flow.svg?style=flat-square)](https://codeclimate.com/github/maxjoehnk/ngSharepoint)
[![Coverage](https://img.shields.io/codeclimate/coverage/github/maxjoehnk/ngSharepoint.svg?style=flat-square)](https://codeclimate.com/github/maxjoehnk/ngSharepoint)
[![bitHound Score](https://www.bithound.io/github/maxjoehnk/ngSharepoint/badges/score.svg)](https://www.bithound.io/github/maxjoehnk/ngSharepoint)
[![License](https://img.shields.io/badge/license-Apache%202.0-brightgreen.svg?style=flat-square)](https://github.com/maxjoehnk/ngSharepoint/blob/master/LICENSE)

Sharepoint Bindings for AngularJS.

##Features
- Access Sharepoint Lists with a SQL Like Syntax
- Build and Run custom CAML Queries on Sharepoint Lists

##Installation
You can install ngSharepoint from bower with
```
bower install ngSharepoint
```
or download it directly from the Repo.

##Usage
First you'll need to add ngSharepoint as a dependency in your Angular Module Definition
```js
angular.module('myApp', ['ngSharepoint']);
```
Then configure ngSharepoint to connect to your Sharepoint instance
```js
angular.module('myApp')
  .config(['$spProvider', function($spProvider) {
    $spProvider.setSiteUrl("http://path-to-your-sharepoi.nt");
  }]);
```
