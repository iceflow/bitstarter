#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var sys = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://intense-atoll-1929.herokuapp.com";
var TMP_FILE = "tmp.html"

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(url_content) {
    return cheerio.load(url_content);
    //return cheerio.load(fs.readFileSync(TMP_FILE));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(url_content, checksfile) {
    $ = cheerioHtmlFile(url_content);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var response2console = function(result, response) {
    //console.log("response2console");
    if (result instanceof Error) {
      console.error('Error: ' + util.format(response.message));
    } else {
      var checkJson = checkHtmlFile(result, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    }
    return;
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_file>', 'Path to URL file', URL_DEFAULT)
        .parse(process.argv);


//    console.log("check[%s] url[%s]", program.checks, program.url);
    rest.get(program.url).on('complete', response2console);
//    console.log("after get");
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
