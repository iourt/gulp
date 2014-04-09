var gulp = require('gulp'),
	uglify = require('gulp-uglify');

// 初始化配置
var appueConfig = {
	// 项目目录
	projects: ['prj-test'],
	// js文件
	scripts: '/**/*js'
};

// 循环项目run task
appueConfig.projects.forEach(function(prj){

	var paths = prj+appueConfig.scripts;

	// 压缩代码
	gulp.task('compress', function(){
		gulp.src(paths)
			.pipe(uglify({
				outSourceMap: false
			}))
			.pipe(gulp.dest('build/'+prj))
	});

	// 监视项目
	gulp.task('watch', function() {
		gulp.watch(paths, ['compress']);
	});
});


// The default task (called when you run `gulp` from cli)
gulp.task('default', ['compress', 'watch']);
