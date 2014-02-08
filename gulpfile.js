var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

// Coffee
gulp.task('js', function () {
    return gulp.src('profiler.coffee')
        .pipe(coffee().on('error', gutil.log))
        .pipe(gulp.dest('./'));
});

// Uglify
gulp.task('uglify', function () {
    var options = {
        outSourceMaps: false,
        output: {
            max_line_len: 150
        }
    };

    return gulp.src('profiler.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify(options))
        .pipe(gulp.dest('./'));
});

// Watch
gulp.task('watch', function () {
    gulp.watch('profiler.coffee', ['js']);
    gulp.watch('profiler.js', ['uglify']);
});

gulp.task('default', ['js', 'uglify', 'watch']);
