var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var coffeeify = require('gulp-coffeeify');
var exec = require('child_process').exec;

var markdown = require('gulp-markdown');
var markdownConfig = {
  gfm: true,
  tables: true,
  breaks: true,
  smartypants: true
}

var build = {
  
  // build it!
  main: function(){
    gulp.src('index.coffee')
      .pipe(coffeeify())
      .pipe(gulp.dest('./bin'));
  },
  
  // documentation: function(){
    
  //   gulp.src("./docs/**/*.md")
  //     .pipe(markdown(markdownConfig))
  //     .pipe(gulp.dest('./docs'));
  // },
  
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
