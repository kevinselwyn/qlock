/*globals document, qlock, window*/

(function (document, window, qlock) {
	'use strict';

	qlock.extend({
		face: [
			[['it'], 'l', ['is'], 'as', ['time']],
			[['a'], 'c', ['quarter'], 'oc'],
			[['twenty'], ['five'], 'x'],
			[['half'], 'b', ['ten'], 'f', ['to']],
			[['past'], 'eru', ['nine']],
			[['one'], ['six'], ['three']],
			[['four'], ['five'], ['two']],
			[['eight'], ['eleven']],
			[['seven'], ['twelve']],
			[['ten'], 'se', ['oclock']]
		],
		generate: function (container) {
			var ticks = document.createElement('div'),
				ticksArr = [],
				numbers = document.createElement('div'),
				rowsArr = [],
				spanArr = [],
				spanCounter = 0,
				textArr = [],
				textCount = 0,
				face = this.face,
				faceRow = [],
				type = 'text',
				className = '',
				html = '',
				i = 0,
				j = 0,
				k = 0,
				l = 0;

			this.addClass(container, 'loading');
			this.addClass(ticks, 'ticks');
			this.addClass(numbers, 'numbers');

			for (i = 0, l = 4; i < l; i += 1) {
				ticksArr[i] = document.createElement('span');
				ticksArr[i].innerHTML = '&bull;';

				className = ['tick', ['tick', i + 1].join('-')].join(' ');
				this.addClass(ticksArr[i], className);

				ticks.appendChild(ticksArr[i]);
			}

			for (i = 0, j = 10; i < j; i += 1) {
				rowsArr[i] = document.createElement('div');
				this.addClass(rowsArr[i], 'qlock-row');

				faceRow = face[i];

				for (k = 0, l = faceRow.length; k < l; k += 1) {
					if (typeof faceRow[k] === 'object') {
						spanArr[spanCounter] = document.createElement('span');

						html = faceRow[k][0].split('').join(' ').toUpperCase();
						spanArr[spanCounter].innerHTML = html;

						if (spanCounter < 3) {
							type = 'text';
						} else if (spanCounter < 11) {
							type = 'minute';
						} else if (spanCounter < 23) {
							type = 'hour';
						} else {
							type = 'text';
						}

						className = [faceRow[k][0], type].join(' ');
						this.addClass(spanArr[spanCounter], className);

						if (k > 0 && typeof faceRow[k - 1] === 'object') {
							textArr[textCount] = document.createTextNode(' ');
							rowsArr[i].appendChild(textArr[textCount]);

							textCount += 1;
						}

						rowsArr[i].appendChild(spanArr[spanCounter]);

						spanCounter += 1;
					} else {
						html = faceRow[k].split('').join(' ').toUpperCase();
						html = [html, ''].join(' ');

						if (k > 0 && typeof faceRow[k - 1] === 'object') {
							html = ['', html].join(' ');
						}

						textArr[textCount] = document.createTextNode(html);

						rowsArr[i].appendChild(textArr[textCount]);

						textCount += 1;
					}
				}

				numbers.appendChild(rowsArr[i]);
			}

			container.appendChild(ticks);
			container.appendChild(numbers);
		}
	});
}(document, window, qlock));