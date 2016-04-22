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
	
	function runAsserts(asserts,res){

		//convert string to json object
		var json = eval("(" + res + ")");
		
		var ret = {};
		ret.success = true;
		ret.brokenRules = [];
		
		if(asserts == null || asserts.length == 0)
			return ret;
		for(var i = 0;i<asserts.length;i++){
			if(asserts[i] == null){
				throw "Illegle assert object";
			}
			var result = asserts[i].fn(json);
			ret.success = ret.success && result;
			if(!result){
				ret.brokenRules.push({
					"message":asserts[i].message
				});
			}
		}
		return ret;
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
					//run asserts
					
					var assertResult = runAsserts(testCase.asserts,d);
										
					if(response.statusCode >= 200 && response.statusCode<= 299 && assertResult.success){
						success("[PASS] "+testCase.name+"\n");
					}
					else{
						error("[FAIL] "+testCase.name+"\n");
						warning("The response data is:\n");
						
						process.stdout.write(colors.yellow(d));
						
						
						if(assertResult.brokenRules != null && assertResult.brokenRules.length>0){
							warning("\n\nBroken rules:\n");
							for(var i=0;i<assertResult.brokenRules.length;i++){
								warning(assertResult.brokenRules[i].message + "\n");
							}
						}
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
