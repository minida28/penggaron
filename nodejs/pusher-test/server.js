var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

// var Pusher = require('pusher');

// var pusher = new Pusher({
  // appId: '799582',
  // key: 'd2ea72072657ef46c460',
  // secret: '316c7efe48325f439710',
  // cluster: 'ap1',
  // encrypted: true
// });

var mysql = require('mysql');

var mysqlData;

var con = mysql.createConnection({
  host: "localhost",
  user: "miq",
  password: "Admin123",
  database: "penggaron"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT unixtimestamp,vbatt FROM 11A197D4", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
	mysqlData = result;
	console.log(mysqlData.length, 'data loaded');
  });
});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



var londonTempData = {
    city: 'London',
    unit: 'celsius',
    dataPoints: [
      {
        time: 1130,
        temperature: 12 
      },
      {
        time: 1200,
        temperature: 13 
      },
      {
        time: 1230,
        temperature: 15 
      },
      {
        time: 1300,
        temperature: 14 
      },
      {
        time: 1330,
        temperature: 15 
      },
      {
        time: 1406,
        temperature: 12 
      },
    ]
}

app.get('/getTemperature', function(req,res){
	// res.send(londonTempData);
	res.send(mysqlData);
	console.log(mysqlData.length, 'data sent');
});

app.get('/addTemperature', function(req,res){
  var temp = parseInt(req.query.temperature);
  var time = parseInt(req.query.time);
  if(temp && time && !isNaN(temp) && !isNaN(time)){
    var newDataPoint = {
      temperature: temp,
      time: time
    };
    londonTempData.dataPoints.push(newDataPoint);
    // pusher.trigger('london-temp-chart', 'new-temperature', {
      // dataPoint: newDataPoint
    // });
    res.send({success:true});
  }else{
    res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - temperature & time.'});
  }
});

// Error Handler for 404 Pages
app.use(function(req, res, next) {
    var error404 = new Error('Route Not Found');
    error404.status = 404;
    next(error404);
});

module.exports = app;

app.listen(9000, function(){
  console.log('Example app listening on port 9000!')
});