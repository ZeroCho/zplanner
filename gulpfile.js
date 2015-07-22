var gulp = require('gulp'),
	minifycss = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	watch = require('gulp-watch'),
	gulpif = require('gulp-if'),
	notify = require('gulp-notify'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	compass = require('gulp-compass'),
	del = require('del'),
	dusthtml = require('gulp-dust-html'),
	plumber = require('gulp-plumber'),
	merge = require('merge-stream'),
	path = require('path'),
	config = {
		lint: false,
		hint: false,
		concat: true,
		uglify: true,
		rename: true
	},
	dir = {
		sass: {
			src: 'public/sass/*.sass',
			cssSrc: 'public/css',
			compassSrc: 'public/sass',
			dest: 'public/css/'
		},
		js: {
			src: 'public/js/*.js',
			filename: 'zplanner.js',
			dest: 'public/dist/'
		},
		dist: {
			js: 'public/dist/zplanner.js',
			css: 'public/dist/zplanner.min.css'
		},
		www: {
			index: '../www',
			dist: '../www/dist/'
		}
	},
	notifyInfo = {
		title: 'Gulp'
	},
	plumberErrorHandler = {
		errorHandler: notify.onError({
			title: notifyInfo.title,
			message: "Error: <%= error.message %>"
		})
	};
gulp.task('default', ['product']);
gulp.task('build', ['clean', 'styles', 'scripts', 'dust']);
gulp.task('product', ['build', 'serve', 'watch']);
gulp.task('watch', ['clean'], function () {
	livereload.listen();
	gulp.watch(dir.js.src, ['scripts'], function (e) {
		console.log('watch scripts', e, e.path);
	});
	gulp.watch(dir.sass.src, ['styles'], function (e) {
		console.log('watch sass', e, e.path);
	});
	gulp.watch('views/*.dust', ['dust'], function (e) {
		console.log('watch dust', e, e.path);
	});
	gulp.watch([dir.dist.css, dir.dist.js], function (event) {
		gulp.src(event.path)
			.pipe(plumber(plumberErrorHandler))
			.pipe(livereload());
	});
	gulp.watch(['pubic/html/*.html'], function (event) {
		console.log('watch html', event);
		gulp.src(event.path)
			.pipe(plumber(plumberErrorHandler))
			.pipe(livereload());
	});
	gulp.watch(['public/phonegapHandler.js'], function (event) {
		gulp.src(event.path)
			.pipe(plumber(plumberErrorHandler))
			.pipe(gulp.dest(dir.www.index))
			.pipe(livereload());
	});
});
gulp.task('serve', ['build'], function () {
	return nodemon({
		script: './bin/www'
	});
});
gulp.task('scripts', ['js:uglify']);
gulp.task('styles', function () {
	gulp.src(dir.sass.src)
		.pipe(plumber(plumberErrorHandler))
		.pipe(compass({
			css: dir.sass.cssSrc,
			sass: dir.sass.compassSrc
		}))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie9', 'opera 12.1', 'ios 6'))
		.pipe(gulp.dest(dir.js.dest))
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dir.js.dest))
		.pipe(gulp.dest(dir.www.dist));
});
gulp.task('clean', function () {
	del([dir.js.dest + '*']);
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
		.pipe(gulp.dest(dir.js.dest))
		.pipe(gulp.dest(dir.www.dist));
});
gulp.task('js:uglify', ['js:concat'], function () {
	gulp.src(dir.js.dest + dir.js.filename)
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif(config.uglify, uglify()))
		.pipe(gulpif(config.rename, rename({suffix: '.min'})))
		.pipe(gulp.dest(dir.js.dest))
		.pipe(gulp.dest(dir.www.dist));
});
gulp.task('dust', function () {
	gulp.src('views/index.dust')
		.pipe(plumber(plumberErrorHandler))
		.pipe(dusthtml({
			whitespace: true,
			data: {
				title: 'Zplanner'
			}
		}))
		.pipe(gulp.dest('public/'))
		.pipe(gulp.dest(dir.www.index))
		.pipe(livereload());
	gulp.src('public/zplanner.appcache')
		.pipe(gulp.dest(dir.www.index));
});