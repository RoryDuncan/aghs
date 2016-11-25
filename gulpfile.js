var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var coffeeify = require('gulp-coffeeify');

var build = {
  
  // build it!
  main: function(){
    gulp.src('index.coffee')
      .pipe(coffeeify())
      .pipe(gulp.dest('./bin'));
  } ,
  
  // live development
  // watches all files and things
  livedev: function(){
    gulp.src('index.coffee')
      .pipe(coffeeify())
      .pipe(gulp.dest('./dev'));
      
    
      gulp.src('dev/dev.coffee')
        .pipe(coffee({bare:true}))
        .pipe(gulp.dest('./dev'));
      
  }
  
}

gulp.task('build', function() {
  build.main();
});

gulp.task('dev', function() {
  
  watch('./**/*.coffee', function(){
    build.livedev();
  })
});

