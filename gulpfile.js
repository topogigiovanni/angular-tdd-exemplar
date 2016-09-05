/* jshint esversion: 6 */

const
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload,
	liveServer = require('gulp-live-server'),
	mocha = require('gulp-mocha'),
	protractor = require('gulp-protractor').protractor,
	Karma = require('karma').Server;

gulp.task('test-server', function() {

	/* run server tests */
	return gulp.src('test/server.spec.js', {
		read: false
	}).pipe(
		mocha({
			reporter: 'spec'
		})
	);

});


gulp.task('test-browser', function(done) {

	/* run browser tests with karma */
	new Karma({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true,
		reporters: [
			'mocha',
			'coverage'
		],
	}, done).start();

});

/* test ALL THE THINGS */
gulp.task('test', ['test-server', 'test-browser', 'protractor']);

/* serve the app */
gulp.task('serve', ['test-server'], function() {

	var server = new liveServer('server.js');

	server.start();

	browserSync.init({
		notify: false,
		port: 8080,
		server: {
			baseDir: ['app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		'app/*.html',
		'app/scripts/**/*.js',
		'test/spec/**/*.js',
		'server.js'
	], ['test-browser', server.start]).on('change', reload);

});


gulp.task('serve-test', function() {

	browserSync.init({
		notify: false,
		port: 8081,
		server: {
			baseDir: ['test', 'app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		'app/*.html',
		'app/scripts/**/*.js',
		'test/spec/**/*.js'
	]).on('change', reload);

});

gulp.task('serve-coverage', ['test-browser'], function() {

	browserSync.init({
		notify: false,
		port: 7777,
		server: {
			baseDir: ['test/coverage'],
		}
	});

	gulp.watch([
		'app/*.html',
		'app/scripts/**/*.js',
		'test/spec/**/*.js'
	], ['test-browser']).on('change', reload);

});

gulp.task('protractor', ['test-server', 'serve'], function(done) {

	return gulp.src(['./src/tests/*.js']).pipe(
		protractor({
			configFile: 'test/protractor.config.js',
			args: ['--baseUrl', 'http://127.0.0.1:8000']
		})
	).on('error', function(e) {
		throw e;
	}).on('end', process.exit);

});

/* Serve our app for development purposes. */
gulp.task('default', ['test', 'serve']);
