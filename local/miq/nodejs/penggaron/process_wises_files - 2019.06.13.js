var mysql = require('mysql');
const fs = require('fs');
const path = require('path');


module.exports = {
	run: function () {
	  // whatever
	},
	// bar: function () {
	//   // whatever
	// }
  };
  

// file name to process
// var loggerFile = '/home/sammy/ftp/files/penggaron_all_backup.csv';
var loggerFile = '/home/sammy/ftp/files/penggaron_all.csv';
var savePath = '/home/miq/nodejs/penggaron/'


// MySql data
var msqlHost = 'localhost';
var mysqlUser = 'miq';
var mysqlPass = 'Admin123';
var dbName = 'test'

var dataStr;
var dataObj;

var start = new Date()
var hrstart = process.hrtime()
// var simulateTime = 5

// function to handle 'UnhandledRejection' error
process.on('unhandledRejection', function (err) {
	console.error(err);
});



// setTimeout(function(argument) {
//   // execution time simulated with setTimeout function
//   var end = new Date() - start,
//     hrend = process.hrtime(hrstart)

//   console.info('Execution time: %dms', end)
//   console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
// }, simulateTime)

async function run() {

	await processFile(loggerFile);
	await processData(dataStr);
	if (true) { } else return;
	await connectMysql();

	var i;
	for (i = 0; i < Object.keys(dataObj).length; i++) {
		var key = Object.keys(dataObj)[i];
		// console.log(key);
		var tableExist = await checkTable(key);
		if (tableExist) {
			console.log('table name:', key, 'exist', 'number of lines:', dataObj[key].length);
			await insertData(key, dataObj);
		}
		else
			console.log(key, 'table NOT exist');
	}
	connection.end();
	var end = new Date() - start,
		hrend = process.hrtime(hrstart);
	console.info('Execution time: %dms', end)
	console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
	console.log('Run completed!');
	process.exit();
}

run();

// Open a file on the server and return its content:
function processFile(fileName) {

	// check file & folder
	console.log('Checking csv file to process:', fileName);
	fs.access(fileName, error => {
		try {
			// The check succeeded
		} catch (error) {
			console.log('Cannot access file', fileName);
		}
	});

	console.log('Creating folder for saving data:', savePath);
	fs.promises.mkdir(savePath, { recursive: true }).catch(console.error);

	console.log('Reading csv file...');
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, 'utf8', function (error, data) {
			if (error) return reject(error);

			dataStr = data;

			console.log('Success');
			// console.log(dataStr);

			resolve();
		})
	});
}

async function processData(dataStr) {

	var lines;

	if (dataStr.includes('\r\n')) {
		console.log('lines separated with \\r\\n.');
		lines = dataStr.split('\r\n');
	} else if (dataStr.includes('\n')) {
		console.log('lines separated with \\n.');
		lines = dataStr.split('\n');
	} else {
		console.error('lines separator not found.');
		return;
	}

	console.log('Number of lines to process:', lines.length);

	// console.log(lines);

	var myObj = new Object;

	var i;
	for (i = 0; i < lines.length; i++) {
		if (lines[i].length) {

			var temp = lines[i].split(',');
			// console.log(temp);

			if (!myObj.hasOwnProperty(temp[1])) {
				myObj[temp[1]] = [];
			}

			myObj[temp[1]].push(lines[i]);

			console.log(lines[i]);
		}
	}

	console.log(Object.keys(myObj).length, 'keys found');
	// console.log(myObj);

	i = 0;
	for (i = 0; i < Object.keys(myObj).length; i++) {

		var key = Object.keys(myObj)[i];
		var tempArray = myObj[key];
		var joinedStr = tempArray.join('\r\n') + '\r\n';
		// var fileName = key + '.csv';
		var fullPath = savePath + key + '.csv';

		// const test = fs.promises.mkdir(savePath, { recursive: true }).then(x => fs.appendFileSync(fullPath, joinedStr)).catch(console.error);
		// await test;

		try {
			fs.appendFileSync(fullPath, joinedStr);
			console.log(tempArray.length, 'data appended to file', fullPath);
		} catch (error) {
			// Handle the error
			console.log('something wrong');
			// throw error;
		}
	}

	dataObj = myObj;
}


var connection;

async function connectMysql() {

	connection = mysql.createConnection({
		host: msqlHost,
		user: mysqlUser,
		password: mysqlPass,
		database: dbName
	});

	console.log('connecting to MySql...');

	const query = new Promise(function (resolve, reject) {
		connection.connect(function (err, results, fields) {
			if (err) { reject(err); }
			else {
				console.log('connected as id ' + connection.threadId);
				resolve();
			}
		});
	});

	await query;
}

async function checkTable(key) {

	var query_1 = "SELECT EXISTS(SELECT * FROM information_schema.tables WHERE table_schema = '" + dbName + "' AND table_name = '" + key + "')";

	var exist;

	const query = new Promise((resolve, reject) => {
		connection.query(query_1, (err, results, fields) => {
			if (err) {
				return reject(err);
			} else {
				// check the results

				var json = JSON.parse(JSON.stringify(results));

				// console.log('respond = ', json[0]);

				var obj = json[0];
				var keys = Object.keys(obj);
				var values = Object.values(obj);

				exist = values[0];

				resolve();
			}
		});
	});

	await query;

	return exist;
}

function checkAdult(age) {
	return age = ' ';
}


async function insertData(key, objectvar) {

	console.log('Inserting to table', key, '...');

	var inserts = [];

	var i;
	for (i = 0; i < objectvar[key].length; i++) {

		var tempArray = objectvar[key][i];

		inserts = tempArray.split(',');

		// console.log(inserts);

		// check for empty element in array element, see
		// https://stackoverflow.com/a/5747008
		// then replace with null
		inserts.findIndex(function(currentValue, index) {
			if (currentValue) {
			} else {
				inserts[index] = null;
			}
		});

		console.log(inserts.join(','));

		// console.log(inserts);

		// var str = ' ';

		// var yo = inserts.findIndex(function(element));
		// if (yo != -1) {
		// 	inserts[yo] = 0;
		// }

		// console.log(newArray);

		var j;
		var temp_1 = [];
		for (j = 0; j < inserts.length; j++) {
			temp_1.push('?');
		}

		var temp_2 = temp_1.join(',');



		//String Generator
		const ids = new StringIdGenerator();

		var k;
		var temp_3 = [];
		for (k = 0; k < inserts.length; k++) {
			temp_3.push('@' + ids.next());
		}
		temp_3 = '(' + temp_3.join(',') + ')';
		// console.log(temp_3);

		var l;
		var temp_4 = [];
		var idsx = new StringIdGenerator();
		for (l = 0; l < inserts.length; l++) {
			var c = idsx.next();
			// temp_4.push('@'+ c);
			// temp_4.push('@'+ c);
			temp_4.push(c + " = IF(@" + c + " = '', NULL, @" + c + ")");
		}
		temp_4 = 'SET ' + temp_4.join(',') + ';';
		// console.log(temp_4);


		// var test = '(' + mysql.format(temp_2, temp_3) + ')';
		// console.log(test);
		// process.exit();
		// break;

		/*
		(@a, @b, @c, @d) 
		SET a = IF(@a = '', NULL, @a), 
			b = IF(@b = '', NULL, @b), 
			c = IF(@c = '', NULL, @c), 
			d = IF(@d = '', NULL, @d);
			*/


		var sql = "REPLACE INTO " + key + " VALUES (" + temp_2 + ")";
		sql = mysql.format(sql, inserts);


		// var fullPath = savePath + key;
		// var sql = "LOAD DATA INFILE \'" + fullPath + ".csv\'" + " INTO TABLE " + key + " FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY " + "\'\r\n\'";
		// sql = sql + ' ' + temp_3 + ' ' + temp_4;

		const query = new Promise((resolve, reject) => {
			connection.query(sql, (err, results, fields) => {
				if (err) {
					return reject(err);
				} else {
					// console.log(tempArray);
					resolve();
				}
			});
		});

		await query;
	}

	console.log(i, 'lines have been inserted.');
}


class StringIdGenerator {
	constructor(chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
		this._chars = chars;
		this._nextId = [0];
	}

	next() {
		const r = [];
		for (const char of this._nextId) {
			r.unshift(this._chars[char]);
		}
		this._increment();
		return r.join('');
	}

	_increment() {
		for (let i = 0; i < this._nextId.length; i++) {
			const val = ++this._nextId[i];
			if (val >= this._chars.length) {
				this._nextId[i] = 0;
			} else {
				return;
			}
		}
		this._nextId.push(0);
	}

	*[Symbol.iterator]() {
		while (true) {
			yield this.next();
		}
	}
}