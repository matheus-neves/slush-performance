import gulp from 'gulp';
import jeet from 'jeet';
import rupture from 'rupture';
import koutoSwiss from 'kouto-swiss';
import browserSync from 'browser-sync';
import runSequence from 'run-sequence';
import imagemin from 'imagemin';
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import plugins from 'gulp-load-plugins';

const $ = plugins();
const Sync = browserSync.create();

const path = {
  stylus: ['dev/assets/stylus/**/*.styl'],
  css: ['dev/assets/css/**/*.css', '!dev/assets/css/**/*.min.css'],
  html: 'dev/*.html',
  js: ['dev/assets/js/**/*.js', '!dev/assets/js/lib/**/*.js'],
  jsEntry: 'dev/assets/js/app/boot.js',
  img: 'dev/assets/img'
};

gulp.task('stylus', () => {
  gulp.src(['dev/assets/stylus/style.styl', 'dev/assets/stylus/priority/first.styl'])
    .pipe($.plumber({
      errorHandler: function (err) {
        console.log([
          'Errrroou!',
          'Erro: '+err.name,
          'plugin: '+err.plugin,
          'Mensagem: '+err.message
        ].join('\n'));
        this.emit('end');
      }
    }))
    .pipe($.stylus({
      compress: true,
      use: [jeet(), rupture(), koutoSwiss()]
    }))
    .pipe(gulp.dest('dev/assets/css'))
    .pipe(Sync.stream())
});

gulp.task('browserify', () => {
   browserify(path.jsEntry, {debug: true})
    .transform("babelify", {presets: ["es2015"]})
    .bundle()
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('dev/assets/js/'))
    .pipe(Sync.stream())
});

gulp.task('sync', () => {
  Sync.init({
    server: {
      baseDir: "./dev"
    }
  })
});

gulp.task('watch', () => {
  gulp.watch(path.stylus, ['stylus']);
  gulp.watch(path.html, ['html']);
  gulp.watch(path.jsEntry, ['browserify']);
});

gulp.task('html', () => {
  gulp.src(path.html)
    .pipe(Sync.stream());
});

gulp.task('sprite-icon-mob', () => {
  let spriteData = gulp.src('dev/assets/img/sprites/mob/*.{jpg,png}')
  .pipe($.spritesmith({
    imgPath: '../img/sprite-icon-mob.png',
    imgName: 'sprite-icon-mob.png',
    cssName: 'sprite-icon-mob.styl',
    cssFormat: 'stylus',
    algorithm: 'binary-tree',
    padding: 5
  }));
  spriteData.img.pipe(gulp.dest(path.img));
  spriteData.css.pipe(gulp.dest('dev/assets/stylus/'));
});

gulp.task('sprite-icon', () => {
  let spriteData = gulp.src('dev/assets/img/sprites/hd/*.{jpg,png}')
  .pipe($.spritesmith({
    imgPath: '../img/sprite-icon-hd.png',
    imgName: 'sprite-icon-hd.png',
    cssName: 'sprite-icon-hd.styl',
    cssFormat: 'stylus',
    algorithm: 'binary-tree',
    padding: 5
  }));
  spriteData.img.pipe(gulp.dest(path.img));
  spriteData.css.pipe(gulp.dest('dev/assets/stylus/'));
});

gulp.task('sprite-svg', () => {
  gulp.src('dev/assets/img/sprites/svg/*.svg')
    .pipe($.svgSymbols({
      templates: ['default-svg']
    }))
    .pipe(gulp.dest(path.img));
});


/* BUILD */
gulp.task('imagemin', () => {

  imagemin(['dev/assets/img/*.{jpg,png}'], 'build/assets/img/',{
    plugins: [
      mozjpeg({'progressive': true, 'quality': 90}),
      pngquant({'progressive': true, 'quality': 90})
    ]
  });

});

gulp.task('clean:build', () => {
  return gulp.src('./build')
    .pipe($.clean());
});

gulp.task('move:build', ['clean:build'], () => {
  return gulp.src([
    'dev/**',
    '!dev/assets/js/**/',
    '!dev/assets/img/sprites{,/**}',
    '!dev/assets/stylus{,/**}',
    '!dev/assets/stylus/**/*.styl'
  ])
  .pipe(gulp.dest('build/'));
});

gulp.task('minify', ['imagemin'], () => {
  return gulp.src('./dev/*.html')
    .pipe($.htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest('build'))
});

gulp.task('js:build', () => {
  return gulp.src('dev/assets/js/main.js')
    .pipe($.uglify({outSourceMap: true}))
    .on('error', $.util.log)
    .pipe(gulp.dest('build/assets/js/'));
});

/* END BUILD */

gulp.task('build', () => {
  runSequence('move:build', 'js:build', 'imagemin', 'minify');
});
gulp.task('default', [ 'stylus', 'browserify', 'watch', 'sync']);
