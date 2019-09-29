var chokidar = require('chokidar');

var watcher = chokidar.watch('/home/sammy/ftp/files/penggaron_all_backup.csv', {ignored: /^\./, persistent: true});

watcher
  .on('add', function(path) {
		var time = new Date();
		console.log(time.toISOString(), 'File', path, 'has been added');
	  })
  .on('change', function(path) {
		var time = new Date();
		console.log(time.toISOString(), 'File', path, 'has been changed');})
  .on('unlink', function(path) {
	  var time = new Date();
	  console.log(time.toISOString(), 'File', path, 'has been removed');})
  .on('error', function(error) {
	  var time = new Date();
	  console.error(time.toISOString(), 'Error happened', error);})