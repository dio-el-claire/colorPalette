jquery.colorPalette
========

Color picker plugin with palette presets, can load palettes on the fly.

Features
--------
 * Simple and lightweight
 * Has 4 color palettes presets - 12/16/48/128 colors
 * Custom palettes on init or later on the fly
 * Switching between loaded palettes
 * Callbacks for select and hover events
 * Allow set color on init or later 
 * Can update selected DOM element value/text with selected color
 * Fully customizable through config/css

Requirements
--------
 * jQuery >= 1.7

Options 
--------
css classes
classes : {
	// class for plugin container
	main     : 'color-palette',
	// button class
	button   : 'color-palette-button',
	// dropdown menu class
	dropdown : 'color-palette-dropdown',
	// one color swatch class
	swatch   : 'color-palette-swatch',
	// text field for input color class
	input    : 'color-palette-input'
},
// named palettes presets
palettes : {
	colors12  : [
		'#ffffff', '#cccccc', '#666666', '#000000', 
		'#00ff00', '#ffff00', '#ff8000', '#ff0000', 
		'#6699ff', '#0000ff', '#000099', '#800080'
	],
	....
},
// default palette name to load on init
palette : 'colors16',

// default seleted color
color : '#ffffff',

// 
select : fucnction(color) { console.log('selected color: '+color)},

Usage
--------
### Simple examples

$(':text:first').colorPalette();

$('<div/>').appendTo('body').colorPalette();