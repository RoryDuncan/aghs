var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var coffeeify = require('gulp-coffeeify');
 
var build = {
  
  main: function(){
    gulp.src('index.coffee')
      .pipe(coffeeify())
      .pipe(gulp.dest('./bin'));
  } ,
  
  livedev: function(){
    gulp.src('index.coffee')
      .pipe(coffeeify())
      .pipe(gulp.dest('./')); // outputs as 'index.js', but is ignored in .gitignore
      
    
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

