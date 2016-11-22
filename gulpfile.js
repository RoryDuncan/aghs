var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');
var coffeeify = require('gulp-coffeeify');
var exec = require('child_process').exec;
var groc = function() {
  console.log("\n\tgroc: Generating Documentation")
  exec('groc "src/**/*.coffee" README.md --out ./docs');
  console.log("\tgroc: Done.\n")
}

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
      .pipe(gulp.dest('./')); // outputs as 'index.js', but is ignored in .gitignore
      
    
      gulp.src('dev/dev.coffee')
        .pipe(coffee({bare:true}))
        .pipe(gulp.dest('./dev'));
      
      groc();
  },
  
  // generates documentation
  docs: groc
  
}

gulp.task('build', function() {
  build.main();
});

gulp.task('dev', function() {
  
  watch('./**/*.coffee', function(){
    build.livedev();
  })
});

