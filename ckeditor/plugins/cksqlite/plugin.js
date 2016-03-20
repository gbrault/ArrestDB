/**
 * Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Simple CKEditor Widget (Part 2).
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'cksqlite', {
	// This plugin requires the Widgets System defined in the 'widget' and the 'ajax' plugins.
	requires: 'widget,restajax',

	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'cksqlite',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		// Register the editing dialog.
		CKEDITOR.dialog.add( 'cksqlite', this.path + 'dialogs/cksqlite.js' );

		// Register the cksqlite widget.
		editor.widgets.add( 'cksqlite', {
			// Allow all HTML elements, classes, and styles that this widget requires.
			// Read more about the Advanced Content Filter here:
			// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
			// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
			allowedContent:
				'div(!cksqlite,align-left,align-right,align-center)[!title]{width};' +
				'div(!cksqlite-content); h2(!cksqlite-title)',

			// Minimum HTML which is required by this widget to work.
			requiredContent: 'div(cksqlite)',

			// Define a nested editable area.
			editables: {
				title: {
					// Define CSS selector used for finding the element inside widget element.
					selector: '.cksqlite-title',
					// Define content allowed in this nested editable. Its content will be
					// filtered accordingly and the toolbar will be adjusted when this editable
					// is focused.
					allowedContent: 'br strong em'
				},
				content: {
					selector: '.cksqlite-content',
					allowedContent: 'p br ul ol li strong em'
				}
			},

			// Define the template of a new Sqlite widget.
			// The template will be used when creating new instances of the Simple Box widget.
			template:
				'<div class="cksqlite">' +
					'<h2 class="cksqlite-title">Title</h2>' +
					'<div class="cksqlite-content"><p>Content...</p></div>' +
				'</div>',

			// Define the label for a widget toolbar button which will be automatically
			// created by the Widgets System. This button will insert a new widget instance
			// created from the template defined above, or will edit selected widget
			// (see second part of this tutorial to learn about editing widgets).
			//
			// Note: In order to be able to translate your widget you should use the
			// editor.lang.cksqlite.* property. A string was used directly here to simplify this tutorial.
			button: 'Sqlite Query Editor',

			// Set the widget dialog window name. This enables the automatic widget-dialog binding.
			// This dialog window will be opened when creating a new widget or editing an existing one.
			dialog: 'cksqlite',

			// Check the elements that need to be converted to widgets.
			//
			// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
			// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
			// during data processing which is done on DOM represented by JavaScript objects.
			upcast: function( element ) {
				// Return "true" (that element needs to converted to a Simple Box widget)
				// for all <div> elements with a "cksqlite" class.
				return element.name == 'div' && element.hasClass( 'cksqlite' );
			},

			// When a widget is being initialized, we need to read the data (restSqlUrl)
			// from DOM and set it by using the widget.setData() method.
			// More code which needs to be executed when DOM is available may go here.
			init: function() {
				// SQL parameters 
				// check if set as data
				var restSqlUrl = this.element.data('restSqlUrl');
				if((restSqlUrl=undefined)||restSqlUrl==null||(restSqlUrl=="")){ 
				    // get the DOM value (persisted into Title as I don't know how to get a custom attribute...')
					var domRestSqlUrl = this.element.getAttribute("title");
					if((domRestSqlUrl!=undefined) && (domRestSqlUrl!="") ){
						this.setData('restSqlUrl',domRestSqlUrl);
					}
				}
				// Other parameters
				var width = this.element.getStyle( 'width' );
				if ( width )
					this.setData( 'width', width );

				if ( this.element.hasClass( 'align-left' ) )
					this.setData( 'align', 'left' );
				if ( this.element.hasClass( 'align-right' ) )
					this.setData( 'align', 'right' );
				if ( this.element.hasClass( 'align-center' ) )
					this.setData( 'align', 'center' );
			},

			// Listen on the widget#data event which is fired every time the widget data changes
			// and updates the widget's view.
			// Data may be changed by using the widget.setData() method, used in the widget dialog window.			
			data: function() {
				// SQL data
				// get the restSqlUrl data, creat the ajax request and feed the result in the content field
				if((this.data.restSqlUrl!=undefined) &&(this.data.restSqlUrl!="")){
					var url="/ArrestDB/ArrestDB.php"+this.data.restSqlUrl;
					var sqlData = CKEDITOR.restajax.load(url);
					this.editables.content.setText(sqlData);
					this.editables.title.setText(this.data.restSqlUrl);			
				}
				// other data
				// Check whether "width" widget data is set and remove or set "width" CSS style.
				// The style is set on widget main element (div.simplebox).
				if ( this.data.width == '' )
					this.element.removeStyle( 'width' );
				else
					this.element.setStyle( 'width', this.data.width );

				// Brutally remove all align classes and set a new one if "align" widget data is set.
				this.element.removeClass( 'align-left' );
				this.element.removeClass( 'align-right' );
				this.element.removeClass( 'align-center' );
				if ( this.data.align )
					this.element.addClass( 'align-' + this.data.align );
			}
		} );
	}
} );
