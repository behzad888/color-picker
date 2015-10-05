define(['exports', 'jquery'], function (exports, _jquery) {
	'use strict';

	exports.__esModule = true;
	exports.ColorPicker = ColorPicker;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _$ = _interopRequireDefault(_jquery);

	function ColorPicker() {
		var cp = new CP();
		_$['default'].fn.extend({
			ColorPicker: cp.init,
			ColorPickerHide: cp.hidePicker,
			ColorPickerShow: cp.showPicker,
			ColorPickerSetColor: cp.setColor
		});
	}

	var CP = (function () {
		function CP() {
			_classCallCheck(this, CP);

			this.ids = {};
			this.charMin = 65;
			this.tpl = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_alpha"><canvas width="150" height="17"></canvas><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="8" size="8" /></div><div class="colorpicker_rgba_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgba_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgba_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgba_a colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsba_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsba_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsba_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsba_a colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>';

			this.defaults = {
				eventName: 'click',
				onShow: function onShow() {},
				onBeforeShow: function onBeforeShow() {},
				onHide: function onHide() {},
				onChange: function onChange() {},
				onSubmit: function onSubmit() {},
				color: 'ff0000ff',
				livePreview: true,
				flat: false
			};
			this.init();
		}

		CP.prototype.init = function init(opt) {
			opt = _$['default'].extend({}, this.defaults, opt || {});
			if (typeof opt.color == 'string') {
				opt.color = this.HexToHSBA(opt.color);
			} else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined && opt.color.a != undefined) {
				opt.color = this.RGBAToHSBA(opt.color);
			} else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined && opt.color.a != undefined) {
				opt.color = this.fixHSBA(opt.color);
			} else {
				return this;
			}
			return this.each(function () {
				if (!_$['default'](this).data('colorpickerId')) {
					var options = _$['default'].extend({}, opt);
					options.origColor = opt.color;
					var id = 'collorpicker_' + parseInt((Math.random() * 1000).toString());
					_$['default'](this).data('colorpickerId', id);
					var cal = _$['default'](this.tpl).attr('id', id);
					if (options.flat) {
						cal.appendTo(this).show();
					} else {
						cal.appendTo(document.body);
					}
					options.fields = cal.find('input').bind('keyup', this.keyDown).bind('change', this.change).bind('blur', blur).bind('focus', focus);
					cal.find('span').bind('mousedown', this.downIncrement).end().find('>div.colorpicker_current_color').bind('click', this.restoreOriginal);
					options.selector = cal.find('div.colorpicker_color').bind('mousedown', this.downSelector);
					options.selectorIndic = options.selector.find('div div');
					options.el = this;
					options.hue = cal.find('div.colorpicker_hue div');
					cal.find('div.colorpicker_hue').bind('mousedown', this.downHue);
					options.alpha = cal.find('div.colorpicker_alpha div');
					cal.find('div.colorpicker_alpha').bind('mousedown', this.downAlpha);
					options.alphaCanvas = cal.find('div.colorpicker_alpha canvas').get()[0];
					options.alphaCtx = options.alphaCanvas.getContext("2d");
					options.newColor = cal.find('div.colorpicker_new_color');
					options.currentColor = cal.find('div.colorpicker_current_color');
					cal.data('colorpicker', options);
					cal.find('div.colorpicker_submit').bind('mouseenter', this.enterSubmit).bind('mouseleave', this.leaveSubmit).bind('click', this.clickSubmit);
					this.fillRGBAFields(options.color, cal.get(0));
					this.fillHSBAFields(options.color, cal.get(0));
					this.fillHexFields(options.color, cal.get(0));
					this.setHue(options.color, cal.get(0));
					this.setAlpha(options.color, cal.get(0));
					this.setSelector(options.color, cal.get(0));
					this.setCurrentColor(options.color, cal.get(0));
					this.setNewColor(options.color, cal.get(0));
					if (options.flat) {
						cal.css({
							position: 'relative',
							display: 'block'
						});
					} else {
						_$['default'](this).bind(options.eventName, this.show);
					}
				}
			});
		};

		CP.prototype.showPicker = function showPicker() {
			return this.each(function () {
				if (_$['default'](this).data('colorpickerId')) {
					this.show.apply(this);
				}
			});
		};

		CP.prototype.hidePicker = function hidePicker() {
			return this.each(function () {
				if (_$['default'](this).data('colorpickerId')) {
					_$['default']('#' + _$['default'](this).data('colorpickerId')).hide();
				}
			});
		};

		CP.prototype.setColor = function setColor(col) {
			if (typeof col == 'string') {
				col = this.HexToHSBA(col);
			} else if (col.r != undefined && col.g != undefined && col.b != undefined && col.a != undefined) {
				col = this.RGBAToHSBA(col);
			} else if (col.h != undefined && col.s != undefined && col.b != undefined && col.a != undefined) {
				col = this.fixHSBA(col);
			} else {
				return this;
			}
			return this.each(function () {
				if (_$['default'](this).data('colorpickerId')) {
					var cal = _$['default']('#' + _$['default'](this).data('colorpickerId'));
					cal.data('colorpicker').color = col;
					cal.data('colorpicker').origColor = col;
					this.fillRGBAFields(col, cal.get(0));
					this.fillHSBAFields(col, cal.get(0));
					this.fillHexFields(col, cal.get(0));
					this.setHue(col, cal.get(0));
					this.setAlpha(col, cal.get(0));
					this.setSelector(col, cal.get(0));
					this.setCurrentColor(col, cal.get(0));
					this.setNewColor(col, cal.get(0));
				}
			});
		};

		CP.prototype.fillRGBAFields = function fillRGBAFields(hsba, cal) {
			var rgba = this.HSBAToRGBA(hsba);
			_$['default'](cal).data('colorpicker').fields.eq(1).val(Math.round(rgba.r)).end().eq(2).val(Math.round(rgba.g)).end().eq(3).val(Math.round(rgba.b)).end().eq(4).val(Math.round(rgba.a)).end();
		};

		CP.prototype.fillHSBAFields = function fillHSBAFields(hsba, cal) {
			_$['default'](cal).data('colorpicker').fields.eq(5).val(Math.round(hsba.h)).end().eq(6).val(Math.round(hsba.s)).end().eq(7).val(Math.round(hsba.b)).end().eq(8).val(Math.round(hsba.a)).end();
		};

		CP.prototype.fillHexFields = function fillHexFields(hsba, cal) {
			_$['default'](cal).data('colorpicker').fields.eq(0).val(this.HSBAToHex(hsba)).end();
		};

		CP.prototype.setSelector = function setSelector(hsba, cal) {
			_$['default'](cal).data('colorpicker').selector.css('backgroundColor', this.HSBAToCSSRGBA({ h: hsba.h, s: 100, b: 100, a: 255 }));
			_$['default'](cal).data('colorpicker').selectorIndic.css({
				left: parseInt((150 * hsba.s / 100, 10).toString()),
				top: parseInt((150 * (100 - hsba.b) / 100, 10).toString())
			});
		};

		CP.prototype.setHue = function setHue(hsba, cal) {
			_$['default'](cal).data('colorpicker').hue.css('top', parseInt((150 - 150 * hsba.h / 360, 10).toString()));
			var ctx = _$['default'](cal).data('colorpicker').alphaCtx;
			var grad = ctx.createLinearGradient(0, 0, 150, 0);
			grad.addColorStop(0, this.HSBAToCSSRGBA({ h: hsba.h, s: hsba.s, b: hsba.b, a: 0 }));
			grad.addColorStop(1, this.HSBAToCSSRGBA({ h: hsba.h, s: hsba.s, b: hsba.b, a: 100 }));
			ctx.clearRect(0, 0, 150, 17);
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, 150, 17);
		};

		CP.prototype.setAlpha = function setAlpha(hsba, cal) {
			_$['default'](cal).data('colorpicker').alpha.css('left', parseInt((150 * hsba.a / 100).toString(), 10));
		};

		CP.prototype.setCurrentColor = function setCurrentColor(hsba, cal) {
			_$['default'](cal).data('colorpicker').currentColor.css('backgroundColor', this.HSBAToCSSRGBA(hsba));
		};

		CP.prototype.setNewColor = function setNewColor(hsba, cal) {
			_$['default'](cal).data('colorpicker').newColor.css('backgroundColor', this.HSBAToCSSRGBA(hsba));
		};

		CP.prototype.keyDown = function keyDown(ev) {
			var pressedKey = ev.charCode || ev.keyCode || -1;
			if (pressedKey > this.charMin && pressedKey <= 90 || pressedKey == 32) {
				return false;
			}
			var cal = _$['default'](this).parent().parent();
			if (cal.data('colorpicker').livePreview === true) {
				this.change.apply(this);
			}
		};

		CP.prototype.change = function change(ev) {
			var cal = _$['default'](this).parent().parent(),
			    col;
			if (this.parentNode.className.indexOf('_hex') > 0) {
				cal.data('colorpicker').color = col = this.HexToHSBA(this.fixHex(this.value));
			} else if (this.parentNode.className.indexOf('_hsba') > 0) {
				cal.data('colorpicker').color = col = this.fixHSBA({
					h: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
					s: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10),
					b: parseInt(cal.data('colorpicker').fields.eq(7).val(), 10),
					a: parseInt(cal.data('colorpicker').fields.eq(8).val(), 10)
				});
			} else {
				cal.data('colorpicker').color = col = this.RGBAToHSBA(this.fixRGBA({
					r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
					g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
					b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10),
					a: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10)
				}));
			}
			if (ev) {
				this.fillRGBAFields(col, cal.get(0));
				this.fillHexFields(col, cal.get(0));
				this.fillHSBAFields(col, cal.get(0));
			}
			this.setSelector(col, cal.get(0));
			this.setHue(col, cal.get(0));
			this.setAlpha(col, cal.get(0));
			this.setNewColor(col, cal.get(0));
			cal.data('colorpicker').onChange.apply(cal, [col, this.HSBAToHex(col), this.HSBAToRGBA(col)]);
		};

		CP.prototype.blur = function blur(ev) {
			var cal = _$['default'](this).parent().parent();
			cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
		};

		CP.prototype.focus = function focus() {
			this.charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
			_$['default'](this).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
			_$['default'](this).parent().addClass('colorpicker_focus');
		};

		CP.prototype.downIncrement = function downIncrement(ev) {
			var field = _$['default'](this).parent().find('input').focus();
			var current = {
				el: _$['default'](this).parent().addClass('colorpicker_slider'),
				max: this.parentNode.className.indexOf('_hsba_h') > 0 ? 360 : this.parentNode.className.indexOf('_hsba') > 0 ? 100 : 255,
				y: ev.pageY,
				field: field,
				val: parseInt(field.val(), 10),
				preview: _$['default'](this).parent().parent().data('colorpicker').livePreview
			};
			_$['default'](document).bind('mouseup', current, this.upIncrement);
			_$['default'](document).bind('mousemove', current, this.moveIncrement);
			return false;
		};

		CP.prototype.moveIncrement = function moveIncrement(ev) {
			ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt((ev.data.val + ev.pageY - ev.data.y).toString(), 10))));
			if (ev.data.preview) {
				this.change.apply(ev.data.field.get(0), [true]);
			}
			return false;
		};

		CP.prototype.upIncrement = function upIncrement(ev) {
			this.change.apply(ev.data.field.get(0), [true]);
			ev.data.el.removeClass('colorpicker_slider').find('input').focus();
			_$['default'](document).unbind('mouseup', this.upIncrement);
			_$['default'](document).unbind('mousemove', this.moveIncrement);
			return false;
		};

		CP.prototype.downHue = function downHue(ev) {
			var current = {
				cal: _$['default'](this).parent(),
				y: _$['default'](this).offset().top
			};
			current.preview = current.cal.data('colorpicker').livePreview;
			_$['default'](document).bind('mouseup', current, this.upHue);
			_$['default'](document).bind('mousemove', current, this.moveHue);
			ev.data = current;
			this.moveHue(ev);
			return false;
		};

		CP.prototype.moveHue = function moveHue(ev) {
			this.change.apply(ev.data.cal.data('colorpicker').fields.eq(5).val(parseInt((360 * (150 - Math.max(0, Math.min(150, ev.pageY - ev.data.y))) / 150).toString(), 10)).get(0), [ev.data.preview]);
			return false;
		};

		CP.prototype.upHue = function upHue(ev) {
			this.fillRGBAFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
			this.fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
			_$['default'](document).unbind('mouseup', this.upHue);
			_$['default'](document).unbind('mousemove', this.moveHue);
			return false;
		};

		CP.prototype.downAlpha = function downAlpha(ev) {
			var current = {
				cal: _$['default'](this).parent(),
				x: _$['default'](this).offset().left
			};
			current.preview = current.cal.data('colorpicker').livePreview;
			_$['default'](document).bind('mouseup', current, this.upAlpha);
			_$['default'](document).bind('mousemove', current, this.moveAlpha);
			ev.data = current;
			this.moveAlpha(ev);
			return false;
		};

		CP.prototype.moveAlpha = function moveAlpha(ev) {
			this.change.apply(ev.data.cal.data('colorpicker').fields.eq(8).val(parseInt((100 * Math.max(0, Math.min(150, ev.pageX - ev.data.x)) / 150).toString(), 10)).get(0), [ev.data.preview]);
			return false;
		};

		CP.prototype.upAlpha = function upAlpha(ev) {
			this.fillRGBAFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
			this.fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
			_$['default'](document).unbind('mouseup', this.upAlpha);
			_$['default'](document).unbind('mousemove', this.moveAlpha);
			return false;
		};

		CP.prototype.downSelector = function downSelector(ev) {
			var current = {
				cal: _$['default'](this).parent(),
				pos: _$['default'](this).offset()
			};
			current.preview = current.cal.data('colorpicker').livePreview;
			_$['default'](document).bind('mouseup', current, this.upSelector);
			_$['default'](document).bind('mousemove', current, this.moveSelector);
			ev.data = current;
			this.moveSelector(ev);
			return false;
		};

		CP.prototype.moveSelector = function moveSelector(ev) {
			this.change.apply(ev.data.cal.data('colorpicker').fields.eq(7).val(parseInt((100 * (150 - Math.max(0, Math.min(150, ev.pageY - ev.data.pos.top))) / 150).toString(), 10)).end().eq(6).val(parseInt((100 * Math.max(0, Math.min(150, ev.pageX - ev.data.pos.left)) / 150).toString(), 10)).get(0), [ev.data.preview]);
			return false;
		};

		CP.prototype.upSelector = function upSelector(ev) {
			this.fillRGBAFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
			this.fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
			_$['default'](document).unbind('mouseup', this.upSelector);
			_$['default'](document).unbind('mousemove', this.moveSelector);
			return false;
		};

		CP.prototype.enterSubmit = function enterSubmit(ev) {
			_$['default'](this).addClass('colorpicker_focus');
		};

		CP.prototype.leaveSubmit = function leaveSubmit(ev) {
			_$['default'](this).removeClass('colorpicker_focus');
		};

		CP.prototype.clickSubmit = function clickSubmit(ev) {
			var cal = _$['default'](this).parent();
			var col = cal.data('colorpicker').color;
			cal.data('colorpicker').origColor = col;
			this.setCurrentColor(col, cal.get(0));
			cal.data('colorpicker').onSubmit(col, this.HSBAToHex(col), this.HSBAToRGBA(col), cal.data('colorpicker').el);
		};

		CP.prototype.show = function show(ev) {
			var cal = _$['default']('#' + _$['default'](this).data('colorpickerId'));
			cal.data('colorpicker').onBeforeShow.apply(this, [cal.get(0)]);
			var pos = _$['default'](this).offset();
			var viewPort = this.getViewport();
			var top = pos.top + this.offsetHeight;
			var left = pos.left;
			if (top + 176 > viewPort.t + viewPort.h) {
				top -= this.offsetHeight + 176;
			}
			if (left + 356 > viewPort.l + viewPort.w) {
				left -= 356;
			}
			cal.css({ left: left + 'px', top: top + 'px' });
			if (cal.data('colorpicker').onShow.apply(this, [cal.get(0)]) != false) {
				cal.show();
			}
			_$['default'](document).bind('mousedown', { cal: cal }, this.hide);
			return false;
		};

		CP.prototype.hide = function hide(ev) {
			if (!this.isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
				if (ev.data.cal.data('colorpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
					ev.data.cal.hide();
				}
				_$['default'](document).unbind('mousedown', this.hide);
			}
		};

		CP.prototype.isChildOf = function isChildOf(parentEl, el, container) {
			if (parentEl == el) {
				return true;
			}
			if (parentEl.contains) {
				return parentEl.contains(el);
			}
			if (parentEl.compareDocumentPosition) {
				return !!(parentEl.compareDocumentPosition(el) & 16);
			}
			var prEl = el.parentNode;
			while (prEl && prEl != container) {
				if (prEl == parentEl) return true;
				prEl = prEl.parentNode;
			}
			return false;
		};

		CP.prototype.getViewport = function getViewport() {
			var m = document.compatMode == 'CSS1Compat';
			return {
				l: window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
				t: window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
				w: window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
				h: window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
			};
		};

		CP.prototype.fixHSBA = function fixHSBA(hsba) {
			return {
				h: Math.min(360, Math.max(0, hsba.h)),
				s: Math.min(100, Math.max(0, hsba.s)),
				b: Math.min(100, Math.max(0, hsba.b)),
				a: Math.min(100, Math.max(0, hsba.a))
			};
		};

		CP.prototype.fixRGBA = function fixRGBA(rgba) {
			return {
				r: Math.min(255, Math.max(0, rgba.r)),
				g: Math.min(255, Math.max(0, rgba.g)),
				b: Math.min(255, Math.max(0, rgba.b)),
				a: Math.min(255, Math.max(0, rgba.a))
			};
		};

		CP.prototype.fixHex = function fixHex(hex) {
			var len = 8 - hex.length;
			if (len > 0) {
				var o = [];
				for (var i = 0; i < len; i++) {
					o.push('0');
				}
				o.push(hex);
				hex = o.join('');
			}
			return hex;
		};

		CP.prototype.HexToRGBA = function HexToRGBA(hex) {
			var hex = parseInt(hex.indexOf('#') > -1 ? hex.substring(1) : hex, 16);
			return { r: hex >> 24, g: (hex & 0xFF0000) >> 16, b: (hex & 0x00FF) >> 8, a: hex & 0xFF };
		};

		CP.prototype.HexToHSBA = function HexToHSBA(hex) {
			return this.RGBAToHSBA(this.HexToRGBA(hex));
		};

		CP.prototype.RGBAToHSBA = function RGBAToHSBA(rgba) {
			var hsba = {
				h: 0,
				s: 0,
				b: 0,
				a: 0
			};
			var min = Math.min(rgba.r, rgba.g, rgba.b);
			var max = Math.max(rgba.r, rgba.g, rgba.b);
			var delta = max - min;
			hsba.b = max;
			if (max != 0) {}
			hsba.s = max != 0 ? 255 * delta / max : 0;
			if (hsba.s != 0) {
				if (rgba.r == max) {
					hsba.h = (rgba.g - rgba.b) / delta;
				} else if (rgba.g == max) {
					hsba.h = 2 + (rgba.b - rgba.r) / delta;
				} else {
					hsba.h = 4 + (rgba.r - rgba.g) / delta;
				}
			} else {
				hsba.h = -1;
			}
			hsba.h *= 60;
			if (hsba.h < 0) {
				hsba.h += 360;
			}
			hsba.s *= 100 / 255;
			hsba.b *= 100 / 255;
			hsba.a = rgba.a * 100 / 255;
			return hsba;
		};

		CP.prototype.HSBAToRGBA = function HSBAToRGBA(hsba) {
			var rgba = {};
			var h = Math.round(hsba.h);
			var s = Math.round(hsba.s * 255 / 100);
			var v = Math.round(hsba.b * 255 / 100);
			var a = Math.round(hsba.a * 255 / 100);
			rgba.a = a;
			if (s == 0) {
				rgba.r = rgba.g = rgba.b = v;
			} else {
				var t1 = v;
				var t2 = (255 - s) * v / 255;
				var t3 = (t1 - t2) * (h % 60) / 60;
				if (h == 360) h = 0;
				if (h < 60) {
					rgba.r = t1;rgba.b = t2;rgba.g = t2 + t3;
				} else if (h < 120) {
					rgba.g = t1;rgba.b = t2;rgba.r = t1 - t3;
				} else if (h < 180) {
					rgba.g = t1;rgba.r = t2;rgba.b = t2 + t3;
				} else if (h < 240) {
					rgba.b = t1;rgba.r = t2;rgba.g = t1 - t3;
				} else if (h < 300) {
					rgba.b = t1;rgba.g = t2;rgba.r = t2 + t3;
				} else if (h < 360) {
					rgba.r = t1;rgba.g = t2;rgba.b = t1 - t3;
				} else {
					rgba.r = 0;rgba.g = 0;rgba.b = 0;
				}
			}
			return { r: Math.round(rgba.r), g: Math.round(rgba.g), b: Math.round(rgba.b), a: Math.round(rgba.a) };
		};

		CP.prototype.RGBAToHex = function RGBAToHex(rgba) {
			var hex = [rgba.r.toString(16), rgba.g.toString(16), rgba.b.toString(16), rgba.a.toString(16)];
			_$['default'].each(hex, function (nr, val) {
				if (val.length == 1) {
					hex[nr] = '0' + val;
				}
			});
			return hex.join('');
		};

		CP.prototype.HSBAToHex = function HSBAToHex(hsba) {
			return this.RGBAToHex(this.HSBAToRGBA(hsba));
		};

		CP.prototype.HSBAToCSSRGBA = function HSBAToCSSRGBA(hsba) {
			var rgba = this.HSBAToRGBA(hsba);
			var css = 'rgba(' + Math.round(rgba.r) + ',' + Math.round(rgba.g) + ',' + Math.round(rgba.b) + ',' + Math.round(rgba.a / 255) + ')';
			return css;
		};

		CP.prototype.restoreOriginal = function restoreOriginal() {
			var cal = _$['default'](this).parent();
			var col = cal.data('colorpicker').origColor;
			cal.data('colorpicker').color = col;
			this.fillRGBAFields(col, cal.get(0));
			this.fillHexFields(col, cal.get(0));
			this.fillHSBAFields(col, cal.get(0));
			this.setSelector(col, cal.get(0));
			this.setHue(col, cal.get(0));
			this.setAlpha(col, cal.get(0));
			this.setNewColor(col, cal.get(0));
		};

		return CP;
	})();
});