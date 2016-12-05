var gulp        = require('gulp'),
    stylus      = require('gulp-stylus'),
    jeet        = require('jeet'),
    rupture     = require('rupture'),
    koutoSwiss  = require('kouto-swiss'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    uglify      = require('gulp-uglify'),
    gutil       = require('gulp-util'),
    concat      = require('gulp-concat'),
    changed     = require('gulp-changed'),
    runSequence = require('run-sequence'),
    plumber     = require('gulp-plumber'),
    svgSymbols  = require('gulp-svg-symbols'),
    spritesmith = require('gulp.spritesmith'),
    clean       = require('gulp-clean'),
    imagemin    = require('imagemin'),
    mozjpeg     = require('imagemin-mozjpeg'),
    pngquant    = require('imagemin-pngquant'),
    htmlmin     = require('gulp-htmlmin');

var path = {
  stylus: ['dev/assets/stylus/**/*.styl'],
  css: ['dev/assets/css/**/*.css', '!dev/assets/css/**/*.min.css'],
  html: ['dev/*.html'],
  js: ['dev/assets/js/**/*.js', '!dev/assets/js/**/*.min.js']
};

gulp.task('sprite-icon', function () {
  var spriteData = gulp.src('dev/assets/img/sprites/icons/*.png')
  .pipe(spritesmith({
    imgPath: 'dev/assets/img/sprite-icon.png',
    imgName: 'sprite-icon.png',
    cssName: 'sprite-icon.styl',
    cssFormat: 'stylus',
    algorithm: 'binary-tree'
  }));
  spriteData.img.pipe(gulp.dest('dev/assets/img/'));
  spriteData.css.pipe(gulp.dest('dev/assets/stylus/'));
});

gulp.task('sprite-imgs', function () {
  var spriteData = gulp.src('dev/assets/img/sprites/imgs/*.png')
  .pipe(spritesmith({
    imgPath: 'dev/assets/img/sprite-imgs.png',
    imgName: 'sprite-imgs.png',
    cssName: 'sprite-imgs.styl',
    cssFormat: 'stylus',
    algorithm: 'binary-tree'
  }));
  spriteData.img.pipe(gulp.dest('dev/assets/img/'));
  spriteData.css.pipe(gulp.dest('dev/assets/stylus/'));
});

gulp.task('spritesvg', function () {
  return gulp.src('dev/img/svg/*.svg')
    .pipe(svgSymbols({
      templates: ['default-svg']
    }))
    .pipe(gulp.dest('dev/img/'));
});


gulp.task('stylus', function () {
  return gulp.src(['dev/assets/stylus/style.styl', 'dev/assets/stylus/priority/header.styl'])
    .pipe(plumber({
      errorHandler: function (err) {
        console.log([
          'Errrroou!',
          '    Erro: ' + err.name + '',
          '  plugin: ' + err.plugin + '',
          'Mensagem: ' + err.message + '',
        ].join('\n'));
        this.emit('end');
      }
    }))
    .pipe(stylus({
      compress: true,
      use: [jeet(), rupture(), koutoSwiss()]
    }))
    .pipe(gulp.dest('dev/assets/css'))
    .pipe(reload({stream:true}));
});

gulp.task('sync', function() {
  browserSync({
    server: {
      baseDir: "./dev"
    }
  });
});

gulp.task('watch', function () {
  gulp.watch(path.stylus, ['stylus']);
  gulp.watch(path.html, ['html']);
  gulp.watch(path.js, ['js']);
});

gulp.task('html', function () {
  return gulp.src(path.html)
    .pipe(reload({stream:true}));
});

gulp.task('js', function () {
  return gulp.src(path.js)
    .pipe(reload({stream:true}));
});

/* BUILD */
gulp.task('imagemin', function() {
  return imagemin(['dev/assets/img/*.{jpg,png}'], 'build/assets/img/', {
    plugins: [
      mozjpeg({'progressive': true, 'quality': 90}),
      pngquant({'progressive': true, 'quality': 90})
    ]
  });
});

gulp.task('clean:build', function () {
  return gulp.src('build')
    .pipe(clean());
});

gulp.task('move:build', ['clean:build'], function () {
  return gulp.src([ 
    'dev/**',
    '!dev/assets/img/sprites{,/**}',
    '!dev/assets/stylus{,/**}', 
    '!dev/assets/stylus/**/*.styl'
  ])
  .pipe(gulp.dest('build/'));
});

gulp.task('minify', function() {
  gulp.src('./dev/*.html')
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest('build'))
});

gulp.task('js:build', function () {
  return gulp.src(path.js)
    .pipe(uglify({outSourceMap: true}))
    .on('error', gutil.log)
    .pipe(gulp.dest('build/assets/js/'));
});

/* END BUILD */

gulp.task('build', function () {
  runSequence('move:build', 'js:build', 'imagemin', 'minify');
});
gulp.task('default', [ 'stylus' , 'watch', 'sync']);