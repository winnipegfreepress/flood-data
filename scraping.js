//Dependencies
var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var S3Config = require('s3-append').S3Config;

// setup S3 config

var config = new S3Config({
  "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
  "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
  "region": process.env.S3_REGION,
  "bucket": process.env.S3_BUCKET_NAME
});

// Using config from above 
var S3Append = require('s3-append').S3Append;
var service = new S3Append(config, 'data/water_levels.csv', Format.Text);
 

//local server stuff
var app = express();
var port = 8000;


//empty array for results
var data = [];

//csv to place data
var outputFile = 'water_levels.csv';

//
// var destination = fs.createWriteStream("./downloads/riverlevels6.csv");

//url to scrape
var url = "http://www.winnipeg.ca/publicworks/pwddata/riverlevels/"

// cron.schedule('*/1 * * * *', function(){
  //select table data
request(url, function(err, resp, body) {
  var $ = cheerio.load(body);
  var level = $('table[name=RED] tr:nth-child(6) td:nth-child(3)');
  var time = $('table[name=RED] tr:nth-child(6) td:nth-child(4)');

  //turn it into text
  var leveltext = level.text();
  var timetext = time.text();



  //concantenate level, time
  data = [leveltext, timetext, '\r\n'];

  service.append(data);
 
  service.flush()
  .then(function() {
    console.log("Done!");
  })
  .catch(function(err) {
    console.error(err.message);
  });
});

  //push to empty array
  // entries.push(data);


  // console.log(entries)
})
// });


