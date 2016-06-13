var gulp = require('gulp'),
    server = require('gulp-server-livereload'),
    connect = require('gulp-connect');
 
gulp.task('webserver', function() {
  gulp.src('app')
    .pipe(server({
      livereload: true,
      open: true,
      fallback: 'index.html'
    }));
});

gulp.task('connect', function() {
  connect.server({
    root: './app/',
    livereload: true,
    fallback: './app/index.html'
  });
});