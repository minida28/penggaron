var penggaron = require('./process_wises_files.js');

var chokidar = require('chokidar');

var savePath = '/home/miq/nodejs/penggaron/';

var watchedPaths = [
  "/home/sammy/ftp/files/node/*.txt",
  "/home/sammy/ftp/files/combined/*.txt"
];

// var file1 = '/home/sammy/ftp/files/node/*.txt';
// var file2 = '/home/sammy/ftp/files/combined/*.txt';

var watcher = chokidar.watch(watchedPaths, {
  // ignored: /^\./,
  ignored: /(^|[\/\\])\../,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  },
  // atomic: true
});

watcher
  .on('add', function (path) {
    var time = new Date();
    console.log(time.toISOString(), 'File', path, 'has been added');
    // run();
    penggaron.run(path, savePath);
  })
  .on('change', function (path) {
    var time = new Date();
    console.log(time.toISOString(), 'File', path, 'has been changed');
    // penggaron.run(loggerFile, savePath);
    penggaron.run(path, savePath);
  })
  .on('unlink', function (path) {
    var time = new Date();
    console.log(time.toISOString(), 'File', path, 'has been removed');
  })
  .on('error', function (error) {
    var time = new Date();
    console.error(time.toISOString(), 'Error happened', error);
  })