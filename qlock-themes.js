/*globals console, document, gui, qlock, window*/

(function (document, window, qlock) {
	'use strict';

	qlock.extend({
		theme: '',
		themes: {},
		themeCount: 0,
		loadThemes: function (url, callback) {
			var $this = this,
				theme = '',
				themeCount = 0;

			this.loadJSON(url, function (themes) {
				var i;

				for (i in themes) {
					if (themes.hasOwnProperty(i)) {
						if (!theme.length) {
							theme = i;
						}

						themeCount += 1;
					}
				}

				$this.theme = theme;
				$this.themes = themes;
				$this.themeCount = themeCount;

				callback();
			});
		},
		themesMenu: function () {
			var $this = this,
				mainMenu = this.mainMenu,
				themes = this.themes,
				themesSubMenu = {},
				keys = [],
				i,
				j = 0,
				l = 0;

			themesSubMenu = new gui.Menu();

			for (i in themes) {
				if (themes.hasOwnProperty(i)) {
					keys.push(i);
				}
			}

			for (j = 0, l = keys.length; j < l; j += 1) {
				(function (theme) {
					themesSubMenu.append(new gui.MenuItem({
						label: $this.capitalize(theme),
						click: function () {
							$this.setTheme(theme);
							console.log('New theme:', theme);
						}
					}));
				}(keys[j]));
			}

			mainMenu.append(new gui.MenuItem({
				label: 'Themes',
				submenu: themesSubMenu
			}));

			return this;
		},
		setTheme: function (theme) {
			var themes = this.themes,
				colors = [],
				style = {},
				css = [],
				rules = [],
				i = 0,
				l = 0;

			theme = theme || 'default';

			if (theme === this.theme) {
				return;
			}

			this.theme = theme;

			colors = themes[theme];

			style = document.getElementById('qlock-theme');

			if (!style) {
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = 'qlock-theme';
				document.head.appendChild(style);
			}

			css = [
				['body', 'background-color', colors[0]],
				['#qlock', 'color', colors[1]],
				['#qlock .active', 'color', colors[2]]
			];

			for (i = 0, l = css.length; i < l; i += 1) {
				rules.push(this.render(this.templates.selector, {
					selector: css[i][0],
					rules: this.render(this.templates.rule, {
						property: css[i][1],
						value: css[i][2]
					})
				}));
			}

			style.innerHTML = rules.join('\n');

			return this;
		},
		themesKeyup: function (keyCode) {
			var num = keyCode - 49,
				theme = '',
				themes = this.themes,
				counter = 0,
				i;

			for (i in themes) {
				if (themes.hasOwnProperty(i)) {
					if (counter === num) {
						theme = i;
					}

					counter += 1;
				}
			}

			if (!theme.length) {
				theme = i;
			}

			this.setTheme(theme);

			return;
		}
	});
}(document, window, qlock));