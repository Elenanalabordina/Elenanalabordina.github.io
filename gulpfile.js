'use strict';

var autoprefixer = require('autoprefixer');
var del = require('del');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var minify = require('gulp-csso');
var mqpacker = require('css-mqpacker');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var run = require('run-sequence');
var sass = require('gulp-sass');
var server = require('browser-sync').create();
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');

gulp.task('style', function() {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([
      autoprefixer({browsers: [
        'last 2 versions'
      ]}),
      mqpacker({
        sort: false
      })
    ]))
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('images', function() {
  return gulp.src('build/img/**/*.{png,jpg,gif}')
  .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
  ]))
  .pipe(gulp.dest('build/img'));
});

gulp.task('symbols', function() {
  return gulp.src('build/img/icons/*.svg')
  .pipe(svgmin())
  .pipe(svgstore())
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('img'))
  .pipe(gulp.dest('build/img'));
});

gulp.task('serve', function() {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('*.html').on('change', server.reload);
});

gulp.task('copy', function() {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'img/**',
    'js/**',
    '*.html'
  ], {
    base: '.'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('build', function(fn) {
  run(
    'clean',
    'copy',
    'style',
    'images',
    'symbols',
    fn
  );
});
