var gulp = require('gulp'),
	uglify = require('gulp-uglify');

var appueConfig = {
	projects: ['prj-test']
	scripts: 'js/**/*js'
};

gulp.task('compress', function() {
	gulp.src(appueConfig.projects+'*js')
		.pipe(uglify({
			outSourceMap: true
		}))
		.pipe(gulp.dest('build'))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
	gulp.watch(appueConfig.projects+'*js', ['compress']);
});


// The default task (called when you run `gulp` from cli)
gulp.task('default', ['compress', 'watch']);
