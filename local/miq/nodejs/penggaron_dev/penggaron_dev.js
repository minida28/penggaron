var penggaron = require('./process_wises_files.js');
const fs = require('fs');

var chokidar = require('chokidar');

// var loggerFile = '/home/sammy/ftp/files/penggaron_all_backup.csv';

// var loggerFile = '/home/sammy/ftp/files/test.csv';
// var savePath = '/home/miq/nodejs/penggaron/';

var loggerFile = '/home/miq/nodejs/penggaron_dev/sample_copy.csv';
var savePath = '/home/miq/nodejs/penggaron_dev/';

fs.copyFileSync('/home/miq/nodejs/penggaron_dev/sample.csv', '/home/miq/nodejs/penggaron_dev/sample_copy.csv');
console.log('sample.csv was copied to sample_copy.csv');

var watcher = chokidar.watch(loggerFile, {
  ignored: /^\./, persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  },
  atomic: true
});

watcher
  .on('add', function (path) {
    var time = new Date();
    console.log(time.toISOString(), 'File', path, 'has been added');
    // run();
    penggaron.run(loggerFile, savePath);
  })
  .on('change', function (path) {
    var time = new Date();
    console.log(time.toISOString(), 'File', path, 'has been changed');
    // penggaron.run(loggerFile, savePath);
  })
  .on('unlink', function (path) {
    var time = new Date();
    console.log(time.toISOString(), 'File', path, 'has been removed');
  })
  .on('error', function (error) {
    var time = new Date();
    console.error(time.toISOString(), 'Error happened', error);
  })