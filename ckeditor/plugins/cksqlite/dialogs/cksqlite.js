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
		minWidth: 800,
		minHeight: 150,
		contents: [
			{
				id: 'info',
				elements: [
				    /*
					{
						id:'identity',
    					type: 'vbox',
    					align: 'right',
    					width: '200px',
    					children: [
        					{
           					 	type: 'text',
            					id: 'age',
            					label: 'Age'
        					},
        					{
            					type: 'text',
            					id: 'sex',
            					label: 'Sex'
        					},
        					{
            					type: 'text',
            					id: 'nationality',
            					label: 'Nationality'
        					}
    					]
					},									
					{ // ne marche pas
            			id: 'tab1',
            			label: '',
            			title: '',
            			elements: [
                					{
                    					type: 'html',
                    					html: '<div id="myDiv">Sample <b>text</b>.</div><div id="otherId">Another div.</div>'
               						 }
            				]
        			},
        			*/
				    {
						id:'functions',
    					type: 'hbox',
   	 					widths: [ '25%', '25%', '50%' ],
    					children: [
        							{
            							type: 'button',
            							id: 'setformat',
            							label: 'Format',
            							onClick: function(){
            								// calculate and reset the Format
            								var widget = this.getDialog().widget;
            								var content = this.getDialog().getContentElement('info','content').getValue();
            								var format = widget.resetFormat(JSON.parse(content));
            								this.getDialog().getContentElement('info','format').setValue(format);
            							}
        							},
        							{
            							type: 'button',
            							id: 'setTemplate',
            							label: 'Template',
            							onClick: function(){
            								// calculate and reset the Format
            								var widget = this.getDialog().widget;
            								var format = this.getDialog().getContentElement('info','format').getValue();
            								var template = widget.resetTemplate(format);
            								var type = this.getDialog().getContentElement('info','type').getValue();          								
            								this.getDialog().getContentElement('info','template').setValue(template,type);
            							}
        							},
        							{
            							type: 'button',
            							id: 'fun3',
            							label: 'tbd',
        							}
    								]
					},		
					{
						id: 'select',
						type: 'text',
						label: 'Rest SQL Url',
						width: '250px',
						setup: function( widget ) {
							this.setValue( widget.data.select );
							// save the widget context into the dialog to be able to use widget functions
							// must be in the first elements
							this.getDialog().widget = widget;
						},
						commit: function( widget ) {
							// persist into DOM
							widget.element.setAttribute('data-select',this.getValue());
							widget.setData( 'select', this.getValue() );
						},
						onChange: function(api){
							var url = "/ArrestDB/ArrestDB.php" + this.getValue();
                    		var sqlData = CKEDITOR.restajax.getjson(url);
                    		// var widget = this.getDialog().widget;
                    		// widget.setData('content',JSON.stringify(sqlData));
                    		this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
						}
					},
					{
						id: 'content',
						type: 'textarea',
						label: 'ArrestDB Content',
						'default':'',
						setup: function( widget ) {
							// this.setValue( widget.data.content );
							// done by restSqlUrl.onChange event
						},
						commit: function( widget ) {
							// persist into DOM
							widget.element.setAttribute('data-content',this.getValue());
							widget.setData( 'content', this.getValue() );
						}
					},
					{
						id: 'format',
						type: 'textarea',
						label: 'Format',
						'default':'',
						setup: function( widget ) {
							this.setValue( widget.data.format );
						},
						commit: function( widget ) {
							// persist into DOM
							widget.element.setAttribute('data-format',this.getValue());
							widget.setData( 'format', this.getValue() );
						}
					},
					{
						id: 'template',
						type: 'textarea',
						label: 'Template',
						'default':'',
						setup: function( widget ) {
							this.setValue( widget.data.template );
						},
						commit: function( widget ) {
							// persist into DOM
							widget.element.setAttribute('data-template',this.getValue());
							widget.setData( 'template', this.getValue() );
						}
					},
					{
						id: 'type',
						type: 'radio',
						label: 'Type',
						items: [
							[ 'horizontal', 'horizontal' ],
							[ 'vertical', 'vertical' ],
						],
						'default':'horizontal',
						// When setting up this field, set its value to the "type" value from widget data.
						setup: function( widget ) {
							this.setValue( widget.data.type );
						},
						// When committing (saving) this field, set its value to the widget data.
						commit: function( widget ) {
							widget.setData( 'type', this.getValue() );
						}
					},
					{
						id:'positionning',
    					type: 'hbox',
   	 					widths: [ '50%', '50%' ],
    					children: [
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
							}
					]
					}									
				]
			}
		]
	};
} );
