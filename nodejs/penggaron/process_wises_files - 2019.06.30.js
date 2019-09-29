var mysql = require('mysql');
const fs = require('fs');

exports.run = function (file, sPath) {
	// return Date();
	loggerFile = file;
	savePath = sPath;
	run(loggerFile, savePath);
};


// file name to process
// var loggerFile = '/home/sammy/ftp/files/penggaron_all_backup.csv';
// var loggerFile = '/home/sammy/ftp/files/penggaron_all.csv';
// var savePath = '/home/miq/nodejs/penggaron/';

var loggerFile;
var savePath;


// MySql data
var msqlHost = 'localhost';
var mysqlUser = 'miq';
var mysqlPass = 'Admin123';
var dbName = 'test'

var dataStr;
var dataObj;


var hrstart = process.hrtime();

// function to handle 'UnhandledRejection' error
process.on('unhandledRejection', function (err) {
	console.error(err);
});

async function main() {
	for (const product of products) {
		await sell(product);
	}
}


async function run(loggerFile, savePath) {

	var start = new Date();

	await processFile(loggerFile, savePath);
	await processData(dataStr);
	if (true) { } else return;
	await connectMysql();

	if (false) {
		asyncForEach(Object.keys(dataObj), async function (element, index) {
			var tableExist = await checkTable(element);
			if (tableExist) {
				console.log('table name:', element, 'exist', 'number of lines:', dataObj[element].length);
				await insertData(element, dataObj);
			}
			else
				console.log(element, 'table NOT exist');
		});
	}

	// JavaScript: async/await with forEach(), see:
	// https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
	var array = Object.keys(dataObj);

	for (let index = 0; index < array.length; index++) {		
		// await callback(array[index], index, array);

		var element = array[index];

		var tableExist = await checkTable(element);
		if (tableExist) {
			console.log('table name:', element, 'exist', 'number of lines:', dataObj[element].length);
			await insertData(element, dataObj);
		}
		else
			console.log(element, 'table NOT exist');
	}

	console.log('Disconnecting Mysql...');
	connection.end();

	console.log('Deleting', loggerFile);
	try {
		fs.unlinkSync(loggerFile)
		//file removed
	} catch (err) {
		console.error(err)
	}

	var end = new Date() - start, hrend = process.hrtime(hrstart);

	console.info('Execution time: %dms', end)
	console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
	console.log('Run completed!');

	// process.exit();
}

// Open a file on the server and return its content:
async function processFile(fileName, savePath) {

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
	const reading = new Promise((resolve, reject) => {
		fs.readFile(fileName, 'utf8', function (error, data) {
			if (error) return reject(error);

			dataStr = data;

			console.log('Success');
			// console.log(dataStr);

			resolve();
		})
	});

	await reading;
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

	lines.forEach(function (element, index) {
		if (lines[index].length) {

			var temp = lines[index].split(',');
			// console.log(temp);

			if (!myObj.hasOwnProperty(temp[1])) {
				myObj[temp[1]] = [];
			}

			myObj[temp[1]].push(lines[index]);
			// console.log(lines[i]);
		}
	});

	console.log(Object.keys(myObj).length, 'keys found');
	// console.log(myObj);

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
		inserts.findIndex(function (currentValue, index) {
			if (currentValue) {
			} else {
				inserts[index] = null;
			}
		});

		inserts.forEach(function (element, index) {
			var num = Number(element);
			if (element != null && !isNaN(num)) {
				inserts[index] = num;
			}
		});


		// console.log(inserts.join(','));

		// console.log(inserts);

		var temp_1 = [];
		inserts.forEach(function (element, index) {
			temp_1.push('?');
		});

		var temp_2 = temp_1.join(',');

		var sql = "REPLACE INTO " + key + " VALUES (" + temp_2 + ")";
		sql = mysql.format(sql, inserts);

		// console.log(sql);

		// var fullPath = savePath + key;
		// var sql = "LOAD DATA INFILE \'" + fullPath + ".csv\'" + " INTO TABLE " + key + " FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY " + "\'\r\n\'";
		// sql = sql + ' ' + temp_3 + ' ' + temp_4;


		// console.log('tempArray:', tempArray);
		// console.log('temp_2:', temp_2);
		// console.log('inserts:', inserts);
		// console.log('Query:', sql);

		const query = new Promise((resolve, reject) => {
			connection.query(sql, (err, results, fields) => {
				if (err) {
					console.error('Error when running this query:', err.sql);
					console.error('tempArray:', tempArray);
					console.error('temp_2:', temp_2);
					console.error('inserts:', inserts);
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

	if (true) {
		var fullPath = savePath + 'BACKUP.csv';

		try {
			fs.appendFileSync(fullPath, dataStr);
			console.log('Data backup to file', fullPath);
		} catch (error) {
			// Handle the error
			console.log('Failed backtup to', fullPath);
			// throw error;
		}
	}

	if (false) {
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
	}
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