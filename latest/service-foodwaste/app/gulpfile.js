const gulp = require('gulp');
const tsc = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const tslint = require('gulp-tslint');
const phraseapp = require('gulp-phraseapp');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const config = require('./config/default.json');

const tsProject = tsc.createProject('./node_modules/.bin/tsconfig.json');
const srcGlobTsc = ['src/**/*.ts'];
const srcGlobTslint = ['src/**/*.ts', '!src/**/*.d.ts'];
const outDir = 'src';
const tsLintConfig = 'node_modules/.bin/tslint.json';

phraseapp.init({
  accessToken: config.phraseApp.accessToken,
  projectID: config.phraseApp.projectId
});

/*
 * Starts dev environment: watch over .ts files and run default
 */
gulp.task('start', () => {
  return nodemon({
    script: 'src/index.js',
    watch: srcGlobTsc,
    nodeArgs: ['--inspect=0.0.0.0:5858'], // args used for attaching to a debugger
    ignore: ['**/*.js', '**/*.d.ts'],
    ext: 'ts',
    tasks: ['default']
  });
});

/*
 * Compile TypeScript
 */
gulp.task('tsc', () => {
  return gulp.src(srcGlobTsc)
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(outDir));
});

/*
 * Lint TypeScript
 */
gulp.task('tslint', () => {
  return gulp.src(srcGlobTslint)
    .pipe(tslint({ configuration: tsLintConfig }))
    .pipe(tslint.report())
});

/**
 * Fetches translations from phraseapp, translations are stored in files by language in 'app/translations'
 */
gulp.task('phraseapp:import', (done) => {
  // translation files
  phraseapp.download({ file_format: 'simple_json' })
    .pipe(rename((path) => {
      path.basename = path.basename.substring(0, 2);
    }))
    .pipe(gulp.dest('./translations/'))
    .on('end', () => {
      done();
    });
});

/**
 * Post translations to phraseapp
 * this ignores missing keys from the json file
 */
gulp.task('phraseapp:export', () => {
  const language = gutil.env.lang;
  if (!language) {
    console.error('lang argument is missing!!!');
    console.log('Usage example: gulp phraseapp:export --lang da');
  }
  return gulp.src(`./translations/${language}.json`)
    .pipe(phraseapp.upload({ file_format: 'simple_json', }));
});

/*
 * Run tasks asynchronously
 */
gulp.task('default', gulp.series(['tslint', 'tsc']));
