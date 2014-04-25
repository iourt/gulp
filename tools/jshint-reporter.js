'use strict';
var chalk = require('chalk'),
	table = require('text-table');

module.exports = {
	reporter: function (result, config, options) {
		var total = result.length,
			msg = '',
			headers = [],
			prevfile;

		options = options || {};

		msg += table(result.map(function (el, i) {
			var err = el.error,
				line = [
				'',
				chalk.gray('line ' + err.line),
				chalk.gray('col ' + err.character),
				chalk.cyan(err.reason)
			];

			if (el.file !== prevfile) {
				headers[i] = chalk.white(el.file);
			}

			if (options.verbose) {
				line.push(chalk.gray('(' + err.code + ')'));
			}

			prevfile = el.file;

			return line;
		}), {
			stringLength: function (str) {
				return chalk.stripColor(str).length;
			}
		}).split('\n').map(function (el, i) {
			return headers[i] ? '\n' + headers[i] + '\n' + el : el;
		}).join('\n') + '\n\n';

		if (total > 0) {
			msg += chalk.red.bold((process.platform !== 'win32' ? '✖ ' : '') + total + ' problem' + (total === 1 ? '' : 's'));
		} else {
			msg += chalk.green.bold((process.platform !== 'win32' ? '✔ ' : '') + 'No problems');
			msg = '\n' + msg.trim();
		}

		console.log(msg + '\n');
	}
};
