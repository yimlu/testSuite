var https = require('https');
var querystring = require('querystring');
var fs = require('fs');
var colors = require('colors/safe');
var testSuite = require('./testSuite.js');

var caseBuilder = testSuite.caseBuilder;
var testRunner = testSuite.testRunner;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var globConfig = {
	"host":"115.28.68.85",
	"port":443
}

var loginTest = caseBuilder.build(globConfig,{
	"name":"Login Test",
	"url":"/api/v1/user/login",
	"method":"POST",
	"data":{
		"userName":"13732621725",
		"passWord":"mypwd123"
	}
});

testRunner.run(loginTest);
