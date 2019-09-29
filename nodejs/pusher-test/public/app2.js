// Using IIFE for Implementing Module Pattern to keep the Local Space for the JS Variables
(function() {
    // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;

    // var serverUrl = "/",
        // members = [],
        // pusher = new Pusher('d2ea72072657ef46c460', {
		  // cluster: 'ap1',
		  // forceTLS: true
        // }),
        // channel,weatherChartRef;

    function showEle(elementId){
      document.getElementById(elementId).style.display = 'flex';
    }

    function hideEle(elementId){
      document.getElementById(elementId).style.display = 'none';
    }

    function ajax(url, method, payload, successCallback){
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        successCallback(xhr.responseText);
      };
      xhr.send(JSON.stringify(payload));
    }


		function randomNumber(min, max) {
			return Math.random() * (max - min) + min;
		}
		
		function randomBar(date, lastClose) {
			var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
			var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
			return {
				t: date.valueOf(),
				y: close
			};
		}

		
		var dateFormat = 'MMMM DD YYYY';
		var date = moment('April 01 2017', dateFormat);

var data = [];
		// var data = [randomBar(date, 30)];
		// while (data.length < 60) {
			// date = date.clone().add(1, 'd');
			// if (date.isoWeekday() <= 5) {
				// data.push(randomBar(date, data[data.length - 1].y));
			// }
		// }
var ctx = document.getElementById("weatherChart").getContext("2d");
	
	
		var color = Chart.helpers.color;
		var cfg = {
			type: 'bar',
			data: {
				datasets: [{
					label: 'CHRT - Chart.js Corporation',
					backgroundColor: "rgba(75,192,192,0.4)",
					borderColor: "rgba(75,192,192,1)",
					data: data,
					type: 'line',
					pointRadius: 0,
					fill: false,
					lineTension: 0,
					borderWidth: 2,
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(75,192,192,1)",
					pointHoverBorderColor: "rgba(220,220,220,1)",
					pointHoverBorderWidth: 2,
					pointRadius: 5,
					pointHitRadius: 10,
				}]
			},
			options: {
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'series',
						// ticks: {
							// source: 'data',
							// autoSkip: true
						// }
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Closing price ($)'
						}
					}]
				},
				tooltips: {
					intersect: false,
					mode: 'index',
					callbacks: {
						label: function(tooltipItem, myData) {
							var label = myData.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += parseFloat(tooltipItem.value).toFixed(2);
							return label;
						}
					}
				}
			}
		};

		// var chart = new Chart(ctx, cfg);
		var chart;
		

  ajax("/getTemperature", "GET",{}, onFetchTempSuccess);

  function onFetchTempSuccess(response){
    hideEle("loader");
    var respData = JSON.parse(response);
	// console.log(response);
	// console.log(respData);
    // chartConfig.labels = respData.dataPoints.map(dataPoint => dataPoint.time);
    // chartConfig.datasets[0].data = respData.dataPoints.map(dataPoint => dataPoint.temperature);
    // renderWeatherChart(chartConfig);
	
	// chartConfig.labels = respData.map(respData => respData.unixtimestamp);
	// chartConfig.labels = respData.map(respData => (respData.unixtimestamp)*1000);
	// chartConfig.datasets[0].data = respData.map(respData => respData.vbatt);
	// renderWeatherChart(chartConfig);
	// console.log(respData[0].unixtimestamp);
	
	// data = respData.map(respData => respData.vbatt);
	// data = respData;
	
	// console.log(data);
	// data.y = respData.map(respData => respData.vbatt);
	// data.x = respData.map(respData => (respData.unixtimestamp)*1000);




// json = JSON.stringify([obj]);
console.log(respData.length, 'data received');
var i;
var newData = [];
for (i = 0; i < respData.length; i++) {
	var x = (respData[i].unixtimestamp)*1000;
	var y = respData[i].vbatt;
	var date = new Date(x);
	console.log(date);
	// rename Json key, see:
	// https://stackoverflow.com/a/13391613
	// respData[i].x = x;
	// respData[i].y = y;
	// delete respData[i].unixtimestamp;
	// delete respData[i].vbatt;
	var obj = new Object();
	obj.x = x;
	obj.y = y;
	newData.push(obj);
	// console.log(JSON.stringify(obj));
}

	// delete respData.unixtimestamp;
	// delete respData.vbatt;

// console.log(respData);
	
	// console.log(respData[0].unixtimestamp);
	// console.log(cfg.data.datasets[0].data[0]);
	
	// cfg.labels = respData.map(respData => (respData.unixtimestamp)*1000);
	// cfg.data.datasets[0].data = respData.map(respData => respData.vbatt);
	// cfg.data.datasets[0].data.x = respData.map(respData => (respData.unixtimestamp)*1000);
	// cfg.data.datasets[0].data.y = respData.map(respData => respData.vbatt);
	// cfg.options.scales.xAxes[2] = respData;
	
	// console.log(cfg.options.scales.xAxes[0].ticks.source);
	data = newData;
			// data = [randomBar(date, 30)];
		// while (data.length < 60) {
			// date = date.clone().add(1, 'd');
			// if (date.isoWeekday() <= 5) {
				// data.push(randomBar(date, data[data.length - 1].y));
			// }
		// }
	console.log(data);
	cfg.data.datasets[0].data = data;
	// chart = new Chart(ctx, cfg);
	// chart.update();
	if (chart) {
		chart.update();
	} else {
		chart = new Chart(ctx, cfg);
	}
  }

  // channel = pusher.subscribe('london-temp-chart');
  // channel.bind('new-temperature', function(data) {
    // var newTempData = data.dataPoint;
    // if(weatherChartRef.data.labels.length > 15){
      // weatherChartRef.data.labels.shift();  
      // weatherChartRef.data.datasets[0].data.shift();
    // }
    // weatherChartRef.data.labels.push(newTempData.time);
    // weatherChartRef.data.datasets[0].data.push(newTempData.temperature);
    // weatherChartRef.update();
  // });


/* TEMP CODE FOR TESTING */
  // var dummyTime = 1500;
  // setInterval(function(){
    // dummyTime = dummyTime + 10;
    // ajax("/addTemperature?temperature="+ getRandomInt(10,20) +"&time="+dummyTime,"GET",{},() => {});
	// console.log('tes');
  // }, 1000);

  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
/* TEMP CODE ENDS */

})();