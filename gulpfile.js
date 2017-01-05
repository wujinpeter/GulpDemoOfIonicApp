var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var del = require('del');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var lazypipe = require('lazypipe');
var cssnano = require('gulp-cssnano');
var gulpNgConfig = require('gulp-ng-config');

var paths = {
  sass: ['./scss/**/*.scss']
};

var jsFilePath = [
  'app/js/*.js',
  'app/js/*/*.js',
  'app/*.js'];

var cssFilePath = [
  'app/css/*.css',
  'app/css/*/*.css',
  'app/*.css'];

// var htmlFilePath = [
//   'app/templates/**/*.html',
//   'app/templates/**/**/*.html'];

var imagePath = [
  "app/img/*",
  "app/img/*/*"];

var libDevFilePath = [
  'app/lib/**/*.*',
  'app/lib/**/**/*.*',
  'app/lib/**/**/**/*.*'];

//配置开发环境 的正式环境的 config.Xml文件 和 app图标、启动页
var configXMLPath = ['publish/dev/configxmlDev/*'];
var configXMLProdPath = ['publish/prod/configxmlprod/*'];
var resourcePath = ['publish/dev/resourcesDev/*/*/*', 'publish/dev/resourcesDev/*.png'];
var resourcePathProd = ['publish/prod/resourcesProd/*/*/*', 'publish/prod/resourcesProd/*.png'];

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('lint', function () {
  return gulp.src(jsFilePath)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concat And Uglify JS
gulp.task('scripts', function () {
  return gulp.src(jsFilePath)
    .pipe(concat('app.bundle.js'))
    .pipe(gulp.dest('www/build/js'))  // write source file for debug
    .pipe(uglify({mangle: true}))  // for debug, do not mangle variable name
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '.'}))
    .pipe(gulp.dest('www/build/js'));
});

gulp.task('css', function () {
  return gulp.src(cssFilePath)
    // .pipe(sourcemaps.init())
    .pipe(concat('app.core.css'))
    .pipe(gulp.dest('www/build/css'))  // write source file for debug
    .pipe(cssnano({reduceIdents: false}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '.'}))
    .pipe(gulp.dest('www/build/css'));
});

// 开发环境
gulp.task('copy-config', function () {
  return gulp.src('app/config/devConfig.json')
    .pipe(gulpNgConfig('baseConfig'))
    .pipe(rename("baseConfig.js"))
    .pipe(gulp.dest('app/js'))
});

// 正式环境
gulp.task('copy-config-prod', function () {
  return gulp.src('app/config/prodConfig.json')
    .pipe(gulpNgConfig('baseConfig'))
    .pipe(rename("baseConfig.js"))
    .pipe(gulp.dest('app/js'))
});

gulp.task('copy-configxml', function () {
  return gulp.src(configXMLPath)
    .pipe(useref({noAssets: true}, lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(''));
});

// config.xml
gulp.task('copy-configxml-prod', function () {
  return gulp.src(configXMLProdPath)
    .pipe(useref({noAssets: true}, lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(''));
});

// image task
gulp.task('resource', function () {
  return gulp.src(resourcePath)
    .pipe(gulp.dest('resources'));
});
gulp.task('resourceProd', function () {
  return gulp.src(resourcePathProd)
    .pipe(gulp.dest('resources'));
});

// gulp.task('pagesHtml', function () {
//   return gulp.src(htmlFilePath)
//     .pipe(useref({noAssets: true}, lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest('www/build/pages'));
// });

// Copy Ionic Lib
gulp.task('copy-dev-libs', function () {
  return gulp.src(libDevFilePath)
    .pipe(gulp.dest('www/build/lib'));
});

gulp.task('copy-img', function () {
  return gulp.src(imagePath)
    .pipe(gulp.dest('www/build/img'));
});

gulp.task('copy-dev', function () {
  return gulp.src([
    'app/**/*',
    '!app/lib/*',
    '!app/lib/**/*',
    '!app/js/*',
    '!app/js/**/*',
    '!app/img/*',
    '!app/img/*/*',
    '!app/css/*',
    '!app/css/*/*',
    '!app/config',
    '!app/config/*'])
    .pipe(gulp.dest('www/build'));
});

gulp.task('copy-prod', function () {
  return gulp.src([
    'app/**/*',
    '!app/lib/*',
    '!app/lib/**/*',
    '!app/js/*',
    '!app/js/**/*',
    '!app/img/*',
    '!app/img/*/*',
    '!app/css/*',
    '!app/css/*/*',
    '!app/config',
    '!app/config/*'])
    .pipe(gulp.dest('www/build'));
});

gulp.task('clean', function () {
  del(['www/build/*']);
});

gulp.task('build-dev', function (callback) {
  runSequence('copy-dev','copy-config',[
    'lint',
    'copy-dev-libs',
    'scripts',
    'copy-img',
    'css',
    'copy-configxml',
    'resource'], callback);
});

gulp.task('build-prod', function (callback) {
  runSequence('copy-prod', 'copy-config-prod',[
    'lint',
    'copy-dev-libs',
    'scripts',
    'copy-img',
    'css',
    'copy-configxml-prod',
    'resourceProd'], callback);
});
