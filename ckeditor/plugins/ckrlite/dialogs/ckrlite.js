/**
 * Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

// Note: This automatic widget to dialog window binding (the fact that every field is set up from the widget
// and is committed to the widget) is only possible when the dialog is opened by the Widgets System
// (i.e. the widgetDef.dialog property is set).
// When you are opening the dialog window by yourself, you need to take care of this by yourself too.

CKEDITOR.dialog.add( 'ckrlite', function( editor ) {
	return {
		title: 'rlite widget editor',
		minWidth: 800,
		minHeight: 150,
		contents: [
			{
				id: 'info',
				elements: [
				    {
						id:'functions',
    					type: 'hbox',
   	 					widths: [ '25%', '25%', '25%', '25%' ],
    					children: [
        							{
            							type: 'button',
            							id: 'setformat',
            							label: 'Format',
            							onClick: function(){
            								// calculate and reset the Format
            								var widget = this.getDialog().widget;
            								var content = this.getDialog().getContentElement('info',
            																			'content').getValue();
            								var format = widget.resetFormat(JSON.parse(content));
            								this.getDialog().getContentElement('info','format').setValue(format);
            								widget.editor.ckrlite.format[widget.ckrlite.id]=format;
            							}
        							},
        							{
            							type: 'button',
            							id: 'setTemplate',
            							label: 'Template',
            							onClick: function(){
            								// calculate and reset the Format
            								var widget = this.getDialog().widget;
            								var format = this.getDialog().getContentElement('info',
            																				'format').getValue();
            								var type = this.getDialog().getContentElement('info',
            																				'type').getValue();
            								var template = widget.resetTemplate(format,type);
            								this.getDialog().getContentElement('info',
            																	'template').setValue(template);
            								widget.editor.ckrlite.template[widget.ckrlite.id]=template;
            							}
        							},
        							{
            							type: 'button',
            							id: 'render',
            							label: 'Render',
            							onClick: function(){
            								var widget = this.getDialog().widget;
            								widget.refresh();
            							}
        							},
        							 {
                    					type: 'html',
                    					html: '',
                    					id: 'htmlid',
                    					lable: 'ID',
                    					setup: function( widget ){
											var id = widget.ckrlite.id;
											var html = this.getDialog().getContentElement('info','htmlid');
											html.getElement().$.innerText="ref:"+id;
										}
               						 }
    								]
					},
				    {
						id:'references',
    					type: 'hbox',
   	 					widths: [ '25%', '25%' , '25%' , '25%'],
    					children: [        														
							{
								id: 'table',
								type: 'text',
								label: 'table',
								width: '250px',
								setup: function( widget ) {													
									var eckrlite = widget.editor.ckrlite;
									var wckrlite = widget.ckrlite;
									if(eckrlite.dataset[wckrlite.id].select.table!=undefined)
										this.setValue( eckrlite.dataset[wckrlite.id].select.table );	
								},
								commit: function( widget ) {
									// persist							
									widget.editor.ckrlite.dataset[widget.ckrlite.id].select.table=this.getValue();
								},
								onChange: function(api){
									var widget = this.getDialog().widget;
									widget.editor.ckrlite.dataset[widget.ckrlite.id].select.table=this.getValue();
									// just update content from ArrestDB (not all editor's widgets)
									var uri = root.uri+root.adb+
									       widget.editor.ckrlite.dataset[widget.ckrlite.id].select.table+"/"+
									       widget.editor.ckrlite.dataset[widget.ckrlite.id].select.column+"/"+
									       widget.editor.ckrlite.dataset[widget.ckrlite.id].select.id;
									widget.editor.ckrlite.dataset[widget.ckrlite.id].content = 
												CKEDITOR.restajax.getjson(uri);
									this.getDialog().getContentElement('info','content').setValue(JSON.stringify(
									          widget.editor.ckrlite.dataset[widget.ckrlite.id].content
									       ));
									
								}
							},
							{
								id: 'column',
								type: 'text',
								label: 'column',
								width: '250px',
								setup: function( widget ) {													
									var eckrlite = widget.editor.ckrlite;
									var wckrlite = widget.ckrlite;
									if(eckrlite.dataset[wckrlite.id].select.column!=undefined)
										this.setValue( eckrlite.dataset[wckrlite.id].select.column );	
								},
								commit: function( widget ) {
									// persist							
								  widget.editor.ckrlite.dataset[widget.ckrlite.id].select.column=this.getValue();
								},
								onChange: function(api){
									var widget = this.getDialog().widget;
									
								}
							},
							{
								id: 'id',
								type: 'text',
								label: 'id',
								width: '250px',
								setup: function( widget ) {													
									var eckrlite = widget.editor.ckrlite;
									var wckrlite = widget.ckrlite;
									if(eckrlite.dataset[wckrlite.id].select.id!=undefined)
										this.setValue( eckrlite.dataset[wckrlite.id].select.id );	
								},
								commit: function( widget ) {
									// persist							
								  widget.editor.ckrlite.dataset[widget.ckrlite.id].select.id=this.getValue();
								},
								onChange: function(api){
									var widget = this.getDialog().widget;
								}
							}
					    ]
					},
					{
						id: 'content',
						type: 'textarea',
						label: 'ArrestDB Content',
						'default':'',
						setup: function( widget ) {
						},
						commit: function( widget ) {
						}
					},
					{
						id: 'format',
						type: 'textarea',
						label: 'Format',
						'default':'',
						setup: function( widget ) {
							var eckrlite = widget.editor.ckrlite;
							var wckrlite = widget.ckrlite;
							if(eckrlite.format[wckrlite.id]!=undefined)
								this.setValue( eckrlite.format[wckrlite.id] );	
						},
						commit: function( widget ) {
							var eckrlite = widget.editor.ckrlite;
							var wckrlite = widget.ckrlite;
							eckrlite.format[wckrlite.id]=this.getValue();
						}
					},
					{
						id: 'template',
						type: 'textarea',
						label: 'Template',
						'default':'',
						setup: function( widget ) {
							var eckrlite = widget.editor.ckrlite;
							var wckrlite = widget.ckrlite;
							if(eckrlite.template[wckrlite.id]!=undefined)
								this.setValue( eckrlite.template[wckrlite.id] );	
						},
						commit: function( widget ) {
							var eckrlite = widget.editor.ckrlite;
							var wckrlite = widget.ckrlite;
							eckrlite.template[wckrlite.id]=this.getValue();
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
						},
						// When committing (saving) this field, set its value to the widget data.
						commit: function( widget ) {
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
								// When setting up this field, set its value to the "align" 
								// value from widget data.
								// Note: Align values used in the widget need to be 
								// the same as those defined in the "items" array above.
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
