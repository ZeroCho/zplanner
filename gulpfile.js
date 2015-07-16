var gulp = require('gulp'),
	csslint = require('gulp-csslint'),
	concatcss = require('gulp-concat-css'),
	uglifycss = require('gulp-uglifycss'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	jade = require('gulp-jade'),
	watch = require('gulp-watch'),
	gulpif = require('gulp-if'),
	sass = require('gulp-sass'),
	notify = require('gulp-notify'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	compass = require('gulp-compass'),
	del = require('del'),
	plumber = require('gulp-plumber'),
	path = require('path'),
	config = {
		lint  : false,
		hint  : false,
		concat: true,
		uglify: true,
		rename: true
	},
	dir = {
		sass: {
			src       : 'public/sass/*.sass',
			compassSrc: 'public/sass',
			dest      : 'public/css/'
		},
		js  : {
			src     : 'public/js/*.js',
			filename: 'zecretary.js',
			dest    : 'public/dist/js/'
		},
		css : {
			src     : 'public/css/*.css',
			filename: 'zecretary.css',
			dest    : 'public/dist/css/'
		}
	},
	notifyInfo = {
		title: 'Gulp'
	},
	plumberErrorHandler = {
		errorHandler: notify.onError({
			title  : notifyInfo.title,
			message: "Error: <%= error.message %>"
		})
	};
gulp.task('default', ['build']);
gulp.task('build', ['clean', 'styles', 'scripts', 'watch']);
gulp.task('dev', ['build', 'serve']);
gulp.task('watch', ['clean'], function () {
	livereload.listen();
	gulp.watch(dir.js.src, ['scripts'], function (i, a, c) {
		console.log(i, a, c);
	});
	gulp.watch(dir.sass.src, ['styles'], function (i, a, c) {
		console.log(i, a, c);
	});
	gulp.watch(['public/dist/**/*'], function (event) {
		gulp.src(event.path)
			.pipe(plumber(plumberErrorHandler))
			.pipe(livereload());
			//.pipe(notify({
			//	title  : notifyInfo.title,
			//	message: event.path.replace(__dirname, '').replace(/\\/g, '/') + ' was ' + event.type + ' and reloaded'
			//}));
	});
	gulp.watch(['pubic/html/*.html'], function (event) {
		console.log(event);
		gulp.src(event.path)
			.pipe(plumber(plumberErrorHandler))
			.pipe(livereload());
	});
});
gulp.task('serve', ['build'], function () {
	return nodemon({
		script: 'app.js'
	});
});
gulp.task('scripts', ['js:uglify']);
gulp.task('styles', ['css:uglify']);
gulp.task('clean', function () {
	del([dir.js.dest + '*', dir.css.dest + '*']);
});
gulp.task('compass', function () {
	gulp.src(dir.sass.src)
		.pipe(plumber(plumberErrorHandler))
		.pipe(compass({
			css        : 'public/css',
			sass       : 'public/sass',
			config_file: 'public/config.rb',
			debug      : false
		}))
		.pipe(gulp.dest(dir.sass.dest));
});
gulp.task('css:lint', function () {
	gulp.src(dir.css.src)
		.pipe(gulpif(config.lint, csslint()))
		.pipe(gulpif(config.lint, csslint.reporter()));
});
gulp.task('css:concat', ['compass'], function () {
	gulp.src(dir.css.src)
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif(config.concat, concatcss(dir.css.filename)))
		.pipe(gulp.dest(dir.css.dest));
});
gulp.task('css:uglify', ['css:concat'], function () {
	gulp.src(dir.css.dest + dir.css.filename)
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif(config.uglify, uglifycss()))
		.pipe(gulpif(config.rename, rename({suffix: '.min'})))
		.pipe(gulp.dest(dir.css.dest));
});
gulp.task('js:hint', function () {
	gulp
		.src(dir.js.src)
		.pipe(gulpif(config.hint, jshint()))
		.pipe(gulpif(config.hint, jshint.reporter(stylish)));
});
gulp.task('js:concat', function () {
	gulp
		.src([
			'public/js/zp.js',
			'public/js/zp.model.js',
			'public/js/zp.util.js',
			'public/js/zp.util_b.js',
			'public/js/zp.calendar.js',
			'public/js/zp.shell.js',
			dir.js.src
		])
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif(config.concat, concat(dir.js.filename)))
		.pipe(gulp.dest(dir.js.dest));
});
gulp.task('js:uglify', ['js:concat'], function () {
	gulp.src(dir.js.dest + dir.js.filename)
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif(config.uglify, uglify()))
		.pipe(gulpif(config.rename, rename({suffix: '.min'})))
		.pipe(gulp.dest(dir.js.dest));
});