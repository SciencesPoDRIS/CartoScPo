var gulp = require('gulp'),
    server = require('gulp-server-livereload'),
    connect = require('gulp-connect');
var sass = require('gulp-sass');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
 
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

gulp.task('js', function() {
    return gulp.src([
      'bower_components/lodash/dist/lodash.min.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-simple-logger/dist/angular-simple-logger.js',
      // 'bower_components/leaflet/dist/leaflet.js',
      'bower_components/ui-leaflet/dist/ui-leaflet.min.js',
      'bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/jquery-ui/ui/minified/jquery-ui.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'bower_components/angular-route/angular-route.min.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/ng-grid/build/ng-grid.js',
      'bower_components/ng-grid/plugins/ng-grid-csv-export.js',
      'bower_components/angular-loading-bar/build/loading-bar.js',
      // 'bower_components/angulartics/dist/angulartics.min.js',
      'bower_components/angulartics-google-analytics/dist/angulartics-google-analytics.min.js',
      'bower_components/d3/d3.min.js',
      'bower_components/papaparse/papaparse/min.js'
      ],
      {base: 'bower_components/'}
    )
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./app/assets/js/'));
});

gulp.task('css', function() {
    return gulp.src([
        'bower_components/angular-ui-select/dist/select.css',
        'bower_components/ng-grid/ng-grid.css',
        'bower_components/angular-loading-bar/build/loading-bar.css',
        'bower_components/leaflet/dist/leaflet.css'
      ],
      {base: 'bower_components/'}
    )
    .pipe(concat('allcss.css'))
    // .pipe(uglify())
    .pipe(gulp.dest('./app/assets/css/'));
});

// gulp.task('sass', function() {
//     return gulp.src('app/style/*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('./app/assets/css'))
//         .pipe(browserSync.stream());
// });

gulp.task('less', function() {
    return gulp.src('./app/style/*.less')
        .pipe(less())
        .pipe(gulp.dest('./app/assets/css'))
        .pipe(browserSync.stream());
});

gulp.task('serve', function() {
    browserSync.init({ server: "./app" });

    //gulp.watch('./app/assets/scss/*.scss', ['sass']);

    gulp.watch(['app/*.js', 'app/**/*js']).on('change', browserSync.reload);
    gulp.watch('app/views/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['js', 'css', 'less', 'serve']);