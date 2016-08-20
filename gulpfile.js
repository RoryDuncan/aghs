var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var coffeeify = require('gulp-coffeeify');
 
gulp.task('build', function() {
  
  gulp.src('index.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('./'));
    
  gulp.src('tests/test.coffee')
    .pipe(coffee({bare:true}))
    .pipe(gulp.dest('./tests'));
    
});

gulp.task('dev', function() {
  
  watch('index.coffee')
    .pipe(coffeeify())
    .pipe(gulp.dest('./'));
    
  watch('tests/test.coffee')
    .pipe(coffee({bare:true}))
    .pipe(gulp.dest('./tests'));
});

