var gulp = require('gulp');
var watch = require('gulp-watch');
var coffeeify = require('gulp-coffeeify');
var filter = require('gulp-filter');
var rename = require('gulp-rename');
 
gulp.task('build', function() {
  
  var filterAghs = filter("src/build/aghs.js");
  
  gulp.src('src/coffee/**/*.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('src/build/'))
    .pipe(filterAghs)
    .pipe(rename("index.js"))
    .pipe(gulp.dest("./"));
});

gulp.task('dev', function() {
  
  var filterAghs = filter("src/build/aghs.js");
  
  return watch('./src/coffee/**/*.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('src/build/'))
    .pipe(gulp.dest('./'))
    .pipe(filterAghs)
    .pipe(rename("index.js"))
    .pipe(gulp.dest("./"));
});