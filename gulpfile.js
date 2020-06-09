'use strict'

const strip = require('gulp-strip-css-comments')
const prefix = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sass = require('gulp-sass')
const gulp = require('gulp')

const src = {
  css: ['public/sass/style.scss'],
  js: [
    'node_modules/prismjs/prism.js',
    'node_modules/prismjs/components/prism-json.js'
  ]
}

const dist = {
  path: 'public',
  name: {
    css: 'css/style',
    js: 'js/main'
  }
}

function watch () {
  gulp.watch(src.css, styles)
  gulp.watch(src.js, scripts)
}

const styles = () =>
  gulp
    .src(src.css)
    .pipe(
      sass({
        includePaths: ['node_modules/hack/dist', 'node_modules/prismjs/themes']
      }).on('error', sass.logError)
    )
    .pipe(concat(`${dist.name.css}.min.css`))
    .pipe(prefix())
    .pipe(strip({ all: true }))
    .pipe(cssnano())
    .pipe(gulp.dest(dist.path))

const scripts = () =>
  gulp
    .src(src.js)
    .pipe(concat(`${dist.name.js}.min.js`))
    .pipe(uglify())
    .pipe(gulp.dest(dist.path))

const build = gulp.parallel(styles, scripts)

module.exports.default = gulp.series(build, watch)
module.exports.build = build
module.exports.watch = watch
