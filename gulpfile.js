var gulp = require('gulp'),
	// 引入JS压缩插件
	uglify = require('gulp-uglify'),
	// 引入handlebars
	handlebars = require('gulp-handlebars'),
	defineModule = require('gulp-define-module'); 

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

// handlebars 模板
gulp.task('templates', function(){
  gulp.src(['templates/*.hbs'])
    .pipe(handlebars())
    .pipe(defineModule('node'))
    .pipe(gulp.dest('build/templates/'));
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['compress', 'watch']);
