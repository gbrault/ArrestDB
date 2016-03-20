/**
 * Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

// Note: This automatic widget to dialog window binding (the fact that every field is set up from the widget
// and is committed to the widget) is only possible when the dialog is opened by the Widgets System
// (i.e. the widgetDef.dialog property is set).
// When you are opening the dialog window by yourself, you need to take care of this by yourself too.

CKEDITOR.dialog.add( 'cksqlite', function( editor ) {
	return {
		title: 'Sqlite Query Editor',
		minWidth: 200,
		minHeight: 100,
		contents: [
			{
				id: 'info',
				elements: [
					{
						id: 'align',
						type: 'select',
						label: 'Align',
						items: [
							[ editor.lang.common.notSet, '' ],
							[ editor.lang.common.alignLeft, 'left' ],
							[ editor.lang.common.alignRight, 'right' ],
							[ editor.lang.common.alignCenter, 'center' ]
						],
						// When setting up this field, set its value to the "align" value from widget data.
						// Note: Align values used in the widget need to be the same as those defined in the "items" array above.
						setup: function( widget ) {
							this.setValue( widget.data.align );
						},
						// When committing (saving) this field, set its value to the widget data.
						commit: function( widget ) {
							widget.setData( 'align', this.getValue() );
						}
					},
					{
						id: 'width',
						type: 'text',
						label: 'Width',
						width: '50px',
						setup: function( widget ) {
							this.setValue( widget.data.width );
						},
						commit: function( widget ) {
							widget.setData( 'width', this.getValue() );
						}
					},
					{
						id: 'restSqlUrl',
						type: 'text',
						label: 'Rest SQL Url',
						width: '250px',
						setup: function( widget ) {
							this.setValue( widget.data.restSqlUrl );
						},
						commit: function( widget ) {
							// persist into DOM?
							widget.element.setAttribute('title',this.getValue());
							widget.setData( 'restSqlUrl', this.getValue() );
						}
					},
					{
						id: 'resetFormat',
						type: 'checkbox',
						label: 'Reset Format',
						width: '10px',
						setup: function( widget ) {
							this.setValue( widget.data.resetFormat );
						},
						commit: function( widget ) {
							widget.setData( 'resetFormat', this.getValue() );
						}
					}
				]
			}
		]
	};
} );