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
	scripts: '/**/*js',
	// hbs 模板
	hbs: '/**/*hbs'
};

// 循环项目run task
appueConfig.projects.forEach(function(prj){

	var pathsJS  = prj+appueConfig.scripts,
		pathsHBS = prj+appueConfig.hbs;

	// 压缩代码
	gulp.task('compress', function(){
		gulp.src(pathsJS)
			.pipe(uglify({
				outSourceMap: false
			}))
			.pipe(gulp.dest('build/'+prj))
	});

	// handlebars 模板
	gulp.task('templates', function(){
		gulp.src(pathsHBS)
			.pipe(handlebars())
			.pipe(defineModule('amd'))
			.pipe(gulp.dest('build/'+prj));
	});

	// 监视项目
	gulp.task('watch', function() {
		gulp.watch(pathsJS, ['compress']);
		gulp.watch(pathsHBS, ['templates']);
	});
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['compress', 'templates', 'watch']);
