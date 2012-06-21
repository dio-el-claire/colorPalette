/*!
 * colorPalette - simple color picker.
 * Author: Dmitry (dio) Levashov, <dio@std42.ru>
 * 
 * Copyright 2012, Studio 42
 * Licensed under a 3 clauses BSD license
 */

(function($) {
"use strict"

/**
 * jQuery pseudo class selector to find colorPallete elements.
 * @param {DOMElement}
 * @return {Boolean}
 */
jQuery.expr[':'].colorpalette = function(element) {
	var palette = $(element).data('_palette')
	return typeof palette == 'object' && typeof palette.color == 'function';
}

/**
 * @class jquery plugin colorPalette
 * create colors pallete to select color
 *
 * @param {Object} plugin options
 * @return {jQuery}
 */
$.fn.colorPalette = function(options) {
	
	// call plugin method
	if (typeof options == 'string') {
		var element = this.closest(':colorpalette').eq(0),
			palette, result;
		
		if (element.length) {
			palette = element.data('_palette');

			if (options.indexOf('_') !== 0 && typeof palette[options] == 'function') {
				result = palette[options].apply(palette, Array.prototype.slice.call(arguments, 1));
				return result === void 0 ? this : result;
			}
		}
		
		return this;
	}
	
	options = $.extend(true, {}, $.fn.colorPalette.defaults, options);
	
	this.filter(':not(:colorpalette)').each(function() {
		var target  = $(this),
			classes = options.classes,
			palette = {
				/**
				 * Main plugin element
				 *
				 * @private
				 * @type {jQuery}
				 */
				_element : null,
				
				/**
				 * Source input field
				 *
				 * @private
				 * @type {jQuery}
				 */
				_src : null,
				
				/**
				 * Input for manually set color
				 *
				 * @private
				 * @type {jQuery}
				 */
				_input : $('<input type="text" class="'+classes.input+'"/>'),
				
				/**
				 * Button
				 *
				 * @private
				 * @type {jQuery}
				 */
				_button : $('<a href="#" class="'+classes.button+'"/>'),
				
				/**
				 * Dropdown menu with swatches and input.
				 *
				 * @private
				 * @type {jQuery}
				 */
				_dropdown : $('<div class="'+classes.dropdown+'"><div/></div>'),
				
				/**
				 * Init plugin
				 *
				 * @private
				 */
				_init : function() {
					var self    = this,
						onclick = function(e) {
							self._dropdown.is(':visible') && $(e.target).closest('.'+classes.main).get(0) !== self._element[0] && self._button.click();
						},
						bindto;
					
					if (target[0].nodeName == 'INPUT') {
						self._element = (self._src = target).wrap('<div/>').parent();
					} else {
						self._src = $('<input type="text"/>').appendTo(self._element = target)
					}
					
					self._element.addClass(classes.main).append(self._dropdown);
					self._src.hide();
					
					options.button && self._element.prepend(self._button);
					options.manual && self._dropdown.append(self._input);
					
					if (!self._palettes[self._palette]) {
						$.each(self._palettes, function(name, colors) { return !(self._palette = name); });
					}
					
					self._button
						.click(function(e) {
							var dd  = self._dropdown,
								doc = $(document);
						
							e.preventDefault();
						
							if (dd.is(':visible')) {
								dd.hide();
								doc.off('mousedown', onclick);
							} else {
								dd.show();
								doc.on('mousedown', onclick);
								self._input.select();
							}
						});
					
					self._dropdown
						.delegate('.'+classes.swatch, 'click', function(e) {
							var color = $(this).attr('href');
							
							e.preventDefault();
							
							self.color(color);
							self._button.click();
							typeof options.select == 'function' && options.select(color);
						})
						.delegate('.'+classes.swatch, 'hover', function(e) {
							var color = $(this).attr('href');
							
							if (e.type == 'mouseenter') {
								self._input.val(color);
								self._button.css('background', color);
								typeof options.hover == 'function' && options.hover(color);
							} else {
								self._input.val(self._color);
								self._button.css('background', self._color);
							}
							
						});
						
					self._input
						.keyup(function(e) {
							var color  = self._hex($.trim($(this).val())),
								code   = e.keyCode,
								button = self._button;
						
							if (code == 27) { // on ESC - reset color
								self.color(self._color);
								button.click();
							} else if (code == 13) { // on ENTER - set new color
								self.color(color || self._color);
								button.click();
							} else { // update button
								button.css('background', color);
							}
						});
					
					self._src.change(function() {
						self.color($.trim(self._src.val()))
					})
					
					self._load();
					
					self.color(self._hex(self._src.val() || options.color) || self._palettes[self._palette][0]);

					if (options.bindTo) {
						
					}

				},
				
				/**
				 * Load current palette in dropdown container
				 *
				 * @return {undefined}
				 */
				_load : function() {
					var self     = this,
						palette  = self._palette,
						cssClass = 'palette-'+palette,
						wrapper  = self._dropdown.children(':first'),
						colors   = self._palettes[palette],
						i        = colors.length,
						color;
					
					if (wrapper.is('.'+cssClass)) {
						return;
					}
					
					wrapper.empty().removeAttr('class').addClass(cssClass);	
					
					while (i--) {
						color = colors[i];
						wrapper.prepend('<a href="'+color+'" class="'+classes.swatch+' color-'+color+'" style="background:'+color+'"/>');
					}

				},
				
				/**
				 * Return color in HEX or empty string if convert is impossible.
				 *
				 * @param  {String} color
				 * @return {String}
				 */
				_hex : function (color) {
					var m;
					
					return options.colorsDict[color]
						? options.colorsDict[color]
						: /^\#?([0-9a-f]){3,6}$/i.test(color) 
							? (color.indexOf('#') === 0 ? '' : '#') + color.replace(/^\#?([0-9a-f]{3})$/i, "#$1$1")
							: (m = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color)) ? (1 << 24 | m[1] << 16 | m[2] << 8 | m[3]).toString(16).substr(1) : '';
					
				},
				
				/**
				 * Available palettes
				 *
				 * @private
				 * @type {Object}
				 */
				_palettes : options.palettes,
				
				/**
				 * Current loaded palette.
				 *
				 * @private
				 * @type {String}
				 */
				_palette : options.palette,
				
				/**
				 * Selected color.
				 *
				 * @private
				 * @type {String}
				 */
				_color : options.color,
				
				/**
				 * Add new palette/update existed palette.
				 *
				 * @param {String} palette name
				 * @param {Array}  palette colors
				 * @return {Boolean}
				 */
				addPalette : function(name, colors) {
					if (!this._palettes[name] && $.isArray(colors)) {
						this._palettes[name] = colors;
						return true;
					}
					return false
				},
				
				/**
				 * Get/set palette.
				 * Get : return current palette name.
				 * Set : return true if required palette was loaded.
				 *
				 * @param {String|undefined} palette name or undefined to get current palette name
				 * @return {String|Boolean}
				 */
				palette : function(palette) {
					if (palette === void 0) {
						return this._palette;
					}
					console.log('palette calls')
					if (this._palettes[palette]) {
						this._palette = palette;
						this._load();
						return true;
					}
					return false;
				},
				
				/**
				 * Return palettes.
				 *
				 * @return {Object}
				 */
				palettes : function() {
					return $.extend({}, this._palettes);
				},
				
				/**
				 * Get/set selected color.
				 * Get : return selected color
				 * Set : return undefined
				 *
				 * @param {String|undefined} color
				 * @return {String|undefined}
				 */
				color : function(color) {
					var palette = this._palettes[this.palette];
					
					if (color === void 0) {
						return this._color;
					}
					
					if ((color = this._hex(color))) {
						this._input.val(this._color = color);
						this._src.val(color);
						this._button.css('background', color);
						options.bindTo && $(options.bindTo).val(color).text(color)
					}
				},
				
				/**
				 * Show swatches palette.
				 *
				 * @return {undefined}
				 */
				show : function() {
					this._dropdown.is(':hidden') && this._button.click();
				},
				
				/**
				 * Hide swatches palette.
				 *
				 * @return {undefined}
				 */
				hide : function() {
					this._dropdown.is(':visible') && this._button.click();
				},
				
				/**
				 * Remove plugin node
				 *
				 * @return {undefined}
				 */
				destroy : function() {
					this.hide();
					this._element.empty().remove().removeData('_palette');
				}
			},
			/**
			 * Call palette._init() or wait untill element will be in DOM.
			 *
			 * @return {undefined}
			 */
			init = function() {
				target.closest('body').length ? palette._init() : (to = setTimeout(init, 50));
			},
			to;
			
		target.data('_palette', palette);
		
		init();

	});
	
	return this;
}

/**
 * Plugin default options
 *
 * @type {Object}
 */	
$.fn.colorPalette.defaults = {
	/**
	 * Plugin elements css classes
	 *
	 * @type {Object}
	 */
	classes : {
		main     : 'color-palette',
		button   : 'color-palette-button',
		dropdown : 'color-palette-dropdown',
		swatch   : 'color-palette-swatch',
		input    : 'color-palette-input'
	},
	/**
	 * Colors palettes
	 *
	 * @type {Object}
	 */
	palettes : {
		colors12  : [
			'#ffffff', '#cccccc', '#666666', '#000000', 
			'#00ff00', '#ffff00', '#ff8000', '#ff0000', 
			'#6699ff', '#0000ff', '#000099', '#800080'
		],
		colors16 : [
			'#FFFFFF', '#C0C0C0', '#808080', '#000000',   
			'#00FFFF', '#0000FF', '#008080', '#000080', 
			'#00FF00', '#008000', '#FFA500', '#800080',
			'#FFFF00', '#FF00FF', '#FF0000', '#800000'
		],
		colors48 : [
			'#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#7f7f7f', '#808080',
			'#804000', '#408000', '#008040', '#004080', '#400080', '#800040', '#666666', '#999999',
			'#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#4c4c4c', '#b3b3b3',
			'#ff8000', '#80ff00', '#00ff80', '#0080ff', '#8000ff', '#ff0080', '#333333', '#cccccc',
			'#ff6666', '#ffff66', '#66ff66', '#66ffff', '#6666ff', '#ff66ff', '#191919', '#e6e6e6',
			'#ffcc66', '#ccff66', '#66ffcc', '#66ccff', '#cc66ff', '#ff6fcf', '#000000', '#ffffff'
		],
		web : [
			'#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000', 
			'#ffcccc', '#cc9999', '#996666', '#663333', '#330000', 
			'#ff9999', '#cc6666', '#cc3333', '#993333', '#660000', 
			'#ff6666', '#ff3333', '#ff0000', '#cc0000', '#990000',
			'#ff9966', '#ff6633', '#ff3300', '#cc3300', '#993300',
			'#ffcc99', '#cc9966', '#cc6633', '#996633', '#663300',
			'#ff9933', '#ff6600', '#ff9900', '#cc6600', '#cc9933',
			'#ffcc66', '#ffcc33', '#ffcc00', '#cc9900', '#996600',
			'#ffffcc', '#cccc99', '#999966', '#666633', '#333300',
			'#ffff99', '#cccc66', '#cccc33', '#999933', '#666600',
			'#ffff66', '#ffff33', '#ffff00', '#cccc00', '#999900',
			'#ccff66', '#ccff33', '#ccff00', '#99cc00', '#669900',
			'#ccff99', '#99cc66', '#99cc33', '#669933', '#336600',
			'#99ff33', '#99ff00', '#66ff00', '#66cc00', '#66cc33',
			'#99ff66', '#66ff33', '#33ff00', '#33cc00', '#339900',
			'#ccffcc', '#99cc99', '#669966', '#336633', '#003300',
			'#99ff99', '#66cc66', '#33cc33', '#339933', '#006600',
			'#66ff66', '#33ff33', '#00ff00', '#00cc00', '#009900',
			'#66ff99', '#33ff66', '#00ff33', '#00cc33', '#009933',			
			'#99ffcc', '#66cc99', '#33cc66', '#339966', '#006633',						
			'#33ff99', '#00ff66', '#00ff99', '#00cc66', '#33cc99',						
			'#66ffcc', '#33ffcc', '#00ffcc', '#00cc99', '#009966',						
			'#ccffff', '#99cccc', '#669999', '#336666', '#003333',						
			'#99ffff', '#66cccc', '#33cccc', '#339999', '#006666',						
			'#66cccc', '#33ffff', '#00ffff', '#00cccc', '#009999',						
			'#66ccff', '#33ccff', '#00ccff', '#0099cc', '#006699',																		
			'#99ccff', '#6699cc', '#3399cc', '#336699', '#003366',						
			'#3399ff', '#0099ff', '#0066ff', '#066ccc', '#3366cc',																		
			'#6699ff', '#3366ff', '#0033ff', '#0033cc', '#003399',						
			'#ccccff', '#9999cc', '#666699', '#333366', '#000033',																		
			'#9999ff', '#6666cc', '#3333cc', '#333399', '#000066',																		
			'#6666ff', '#3333ff', '#0000ff', '#0000cc', '#009999',																		
			'#9966ff', '#6633ff', '#3300ff', '#3300cc', '#330099',																		
			'#cc99ff', '#9966cc', '#6633cc', '#663399', '#330066',
			'#9933ff', '#6600ff', '#9900ff', '#6600cc', '#9933cc',			
			'#cc66ff', '#cc33ff', '#cc00ff', '#9900cc', '#660099',
			'#ffccff', '#cc99cc', '#996699', '#663366', '#330033',			
			'#ff99ff', '#cc66cc', '#cc33cc', '#993399', '#660066',
			'#ff66ff', '#ff33ff', '#ff00ff', '#cc00cc', '#990099',			
			'#ff66cc', '#ff33cc', '#ff00cc', '#cc0099', '#990066',
			'#ff99cc', '#cc6699', '#cc3399', '#993366', '#660033',			
			'#ff3399', '#ff0099', '#ff0066', '#cc0066', '#cc3366',
			'#ff6699', '#ff3366', '#ff0033', '#cc0033', '#990033'
		]
	},
	/**
	 * Default palette name
	 *
	 * @type {String}
	 */
	palette : 'colors16',
	/**
	 * Default color
	 *
	 * @type {String}
	 */
	color : '#ffffff',
	/**
	 * Select color callback
	 *
	 * @type {Function|null}
	 */
	select : null,
	/**
	 * Hover color swatch callback
	 *
	 * @type {Function|null}
	 */
	hover : null,
	/**
	 * Element to update on select color.
	 *
	 * @type {String|jQuery|DOMElement}
	 */
	bindTo : null,
	/**
	 * Allow manual set color (show input for color)
	 *
	 * @type {Boolean}
	 */
	manual : true,
	/**
	 * Show color button
	 *
	 * @type {Boolean}
	 */
	button : true,
	/**
	 * Colors names to gex map
	 *
	 * @type {Object}
	 */
	colorsDict : {
		aqua    : '#00ffff',
		black   : '#000000',
		blue    : '#0000ff',
		fuchsia : '#ff00ff',
		gray    : '#808080',
		grey    : '#808080',
		green   : '#008000',
		lime    : '#00ff00',
		maroon  : '#800000',
		navy    : '#000080',
		olive   : '#808000',
		orange  : '#ffa500',
		purple  : '#800080',
		red     : '#ff0000',
		silver  : '#c0c0c0',
		teal    : '#008080',
		white   : '#ffffff',
		yellow  : '#ffff00'
	}
	
}
	
})(jQuery);