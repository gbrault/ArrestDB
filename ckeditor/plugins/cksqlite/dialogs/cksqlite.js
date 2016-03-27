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
            								var type = this.getDialog().getContentElement('info','type').getValue();          								
            								var template = widget.resetTemplate(format,type);
            								this.getDialog().getContentElement('info','template').setValue(template);
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
						id:'references',
    					type: 'hbox',
   	 					widths: [ '50%', '50%' ],
    					children: [        														
							{
								id: 'select',
								type: 'text',
								label: 'Rest SQL Url (ArrestDB)',
								width: '250px',
								setup: function( widget ) {
									this.setValue( widget.data.select );
									// save the widget context into the dialog to be able to use widget functions
									// must be in the first elements
									this.getDialog().widget = widget;
									var sqlData = widget.getContent(widget.data.select,widget.data.master);
                   				    this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
								},
								commit: function( widget ) {
									// persist into DOM
									widget.element.setAttribute('data-select',encodeURI(this.getValue()));
									widget.setData( 'select', this.getValue() );
								},
								onChange: function(api){
									var widget = this.getDialog().widget;
									if((widget!=undefined)&&(widget!=null)){
										widget.data.select = this.getValue(); // don't want to fire data
										var sqlData = widget.getContent();
                   				    	this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
                   				    }
								}
							},
							{
								id: 'name',
								type: 'text',
								label: 'Widget Instance Name',
								width: '250px',
								setup: function( widget ) {
									this.setValue( widget.data.name );
								},
								commit: function( widget ) {
									// persist into DOM
									widget.element.setAttribute('data-name',this.getValue());
									widget.setData( 'name', this.getValue() );
								},
								onChange: function(api){
                    				// may fire an event to tell name has changed
                    				// must check it's unique
                    				var widget = this.getDialog().widget;
                    				var w = widget.findCksqlite(this.getValue());
                    				if((w!=null)&&(w!=widget)){
                    					// name not unique...
                    					this.getDialog().getContentElement('info','name').setValue('Invalid');
                    				}
								}

							},
							{
								id: 'master',
								type: 'select',
								label: 'Master link',
								items:  [["none", "-1"]],
								// When setting up this field, set its value to the "master" value from widget data.
								setup: function( widget ) {
									this.clear();
									this.add("none","-1");
									var options = widget.masterList();
									for(var i=0; i<options.length; i++){
										this.add(options[i][0], options[i][1]);
									}
									this.setValue( widget.data.master );							
								},
								// When committing (saving) this field, set its value to the widget data.
								commit: function( widget ) {
									widget.element.setAttribute('data-master',this.getValue());
									widget.setData( 'master', this.getValue() );
								},
								onChange: function(api){
									// need to recompute content
									// 1- select a table ex: /Orders?limit=2
									// 2- restrict to a field ex: /Orders/CustomerID/VINET
									// 3- select the master link
									// the sample value is replace by the indexed value from the master
									// the column name is the token before the value
									var widget = this.getDialog().widget;
									if((widget!=undefined)&&(widget!=null)){
										widget.data.master=this.getValue(); // don't want to trigger data event
										var sqlData = widget.getContent();
                   				    	this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
									}
								}
							},

					    ]
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
							widget.element.setAttribute('data-content',encodeURI(this.getValue()));
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
							widget.element.setAttribute('data-type',this.getValue());
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
