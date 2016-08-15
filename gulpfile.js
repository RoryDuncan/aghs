var gulp = require('gulp');
var watch = require('gulp-watch');
var coffeeify = require('gulp-coffeeify');
var rename = require('gulp-rename');
 
gulp.task('build', function() {
  
  gulp.src('./src/coffee/**/*.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('src/build/'));
    
  gulp.src('./index.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('./'));
});

gulp.task('dev', function() {
  
  watch('./src/coffee/**/*.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('src/build/'));
    
  watch('./index.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('./'));
});