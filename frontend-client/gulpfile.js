const gulp = require('gulp');
const gutil = require('gulp-util');
const sassdoc = require('sassdoc');
const phraseapp = require('gulp-phraseapp');
const rename = require('gulp-rename');
const typedoc = require('gulp-typedoc');
const fs = require('fs');

// optional, credentials can also be passed to download/upload functions
phraseapp.init({
  accessToken: '84cfebca7f56a8d6d0801e362c3ea0ae99393f4688470997656936c21f686d0a',
  projectID: '52c32890bdf9ea28ef909eec89d5bfb3'
});

gulp.task('phraseapp:import', (done) => {
  // translation files
  phraseapp
    .download({ file_format: 'simple_json' })
    .pipe(
      rename((path) => {
        path.basename = path.basename.substring(0, 2);
      })
    )
    .pipe(gulp.dest('./src/i18n'))
    .on('end', () => {
      const enLocale = require('./src/i18n/en.json');
      const phraseApp = {};
      for (const key in enLocale) {
        if (enLocale.hasOwnProperty(key)) {
          phraseApp[key] = key;
        }
      }
      fs.writeFileSync('./src/i18n/phraseapp.json', JSON.stringify(phraseApp, null, 2));
      const { green, cyan } = gutil.colors;
      gutil.log(green('phraseapp'), 'Generated phraseapp.json', cyan('from en.json'));
      done();
    });
});

/**
 * Exports PhraseApp translation files (from /i18n) to PhraseApp for FoodWaste.
 */
gulp.task('phraseapp:export', () => {
  const language = gutil.env.lang ? gutil.env.lang : gutil.env.language;
  if (!language) {
    gutil.log(gutil.colors.red('phraseapp:export'), 'Error: --lang argument is missing.');
    gutil.log(
      gutil.colors.red('phraseapp:export'),
      'usage: gulp phraseapp:export --lang [da|en|fi|de|nb|sv|all]'
    );
    gutil.log(gutil.colors.red('phraseapp:export'), 'Failed to export PhraseApp translations.');
    return;
  }

  if (language !== 'all') {
    try {
      fs.accessSync(`./src/i18n/${language}.json`);
    } catch (e) {
      gutil.log(
        gutil.colors.red('phraseapp:export'),
        `Error: Language file "./src/i18n/${language}.json" is missing.`
      );
      gutil.log(gutil.colors.red('phraseapp:export'), 'Failed to export PhraseApp translations.');
      return;
    }

    return gulp
      .src(`./src/i18n/${language}.json`)
      .pipe(phraseapp.upload({ file_format: 'simple_json' }));
  }

  return new Promise((resolve, reject) => {
    fs.readdir('./src/i18n/', (err, files) => {
      let fileNames = [];

      files
        .filter((fn) => fn.endsWith('.json'))
        .forEach((file) => {
          if (file === 'phraseapp.json') {
            return;
          }
          fileNames.push(file);
        });

      const iterate = (i) => {
        const file = fileNames[i];
        phraseapp
          .upload({
            files: { [file.substring(0, 2)]: './src/i18n/' + file },
            file_format: 'simple_json'
          })[0]
          .on('data', () => {
            if (fileNames[i + 1]) {
              iterate(i + 1);
            } else {
              resolve();
            }
          });
      };
      try {
        iterate(0);
      } catch (e) {
        reject(e);
      }
    });
  });
});

gulp.task('typedoc', function () {
  return gulp
    .src(['!./src/core/**/*.test.ts', '!./node_modules/**/*.ts', '!./**/*.d.ts', './src/core/*.ts'])
    .pipe(
      typedoc({
        // TypeScript options (see typescript docs)
        module: 'commonjs',
        target: 'es6',
        includeDeclarations: true,

        // Output options (see typedoc docs)
        out: './docs',
        json: 'output/to/file.json',

        // TypeDoc options (see typedoc docs)
        name: 'resmiley-core',
        ignoreCompilerErrors: true,
        version: true
      })
    );
});

gulp.task('sassdoc', function () {
  const options = {};
  return gulp.src(['./src/styles/**/*.scss']).pipe(sassdoc(options));
});

gulp.task('translations', gulp.series(['phraseapp:import']));
gulp.task('docs', gulp.series(['sassdoc', 'typedoc'])); //TODO Add typedoc here once merged...
