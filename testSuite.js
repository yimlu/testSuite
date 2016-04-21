var https = require('https');
var querystring = require('querystring');
var fs = require('fs');
var colors = require('colors/safe');

var caseBuilder = (function(){
	
	var CaseBuilder = {
		"build":function(globConfig,options){
			
			return {
				"name":options.name,
				"host":globConfig.host,
				"port":globConfig.port,
				"url":options.url,
				"method":options.method,
				"loginRequired":options.loginRequired || false,
				"data":JSON.stringify(options.data),
				"asserts":options.asserts,
				"callBack":options.callBack
			}
		}
	};
	
	return CaseBuilder;
})();

var testRunner = (function(){
	function error(message){
		console.log(colors.red(message));
	}
	
	function success(message){
		console.log(colors.green(message));
	}
	
	function warning(message){
		console.log(colors.yellow(message));
	}
	
	var run = function(testCase){
		
		var requestOptions = {
			"host":testCase.host,
			"port":testCase.port,
			"path":testCase.url,
			"method":testCase.method,
			"headers":{
				"Content-Type":"application/json",
				"Content-Length":Buffer.byteLength(testCase.data)
			}
		};
		
		var req = https.request(requestOptions,function(response){
			response.setEncoding('utf8');
			response.on("data",function(d){
					if(response.statusCode >= 200 && response.statusCode<= 299){
						success("[PASS] "+testCase.name+"\n");
					}
					else{
						error("[FAIL] "+testCase.name+"\n");
						warning("The response data is:\n");
						process.stdout.write(colors.yellow(d));
					}
				});
		});
		
		req.write(testCase.data);
		
		req.end();
	};
	
	var TestRunner = {
		"run":run
	}
	
	return TestRunner;
})();

exports.caseBuilder = caseBuilder;
exports.testRunner = testRunner;
