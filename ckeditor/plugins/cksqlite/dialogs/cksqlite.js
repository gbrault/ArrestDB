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
   	 					widths: [ '25%', '25%' , '25%' , '25%'],
    					children: [        														
							{
								id: 'select',
								type: 'text',
								label: 'Rest SQL Url (ArrestDB)',
								width: '250px',
								setup: function( widget ) {																	
									// save the widget context into the dialog to be able to use widget functions
									// must be in the first elements
									this.getDialog().start=true; // tell it's the dialog boot
									this.getDialog().widget = widget;									
									this.setValue( widget.editor.cksqlite[widget.data.name].select );	
									var sqlData = widget.getContent();
                   				    this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
								},
								commit: function( widget ) {
									// persist into DOM									
									widget.setData('refresh',"0");
									widget.setData('refresh',"1");									
									widget.editor.cksqlite[widget.data.name].select=this.getValue();									
								},
								onChange: function(api){
									if (this.getDialog().start) return;
									var widget = this.getDialog().widget;
									if((widget!=undefined)&&(widget!=null)){
										widget.editor.cksqlite[widget.data.name].select = this.getValue();
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
									widget.element.setAttribute('data-name',this.getValue());																	
									widget.setData( 'name', this.getValue() );
								},
								onChange: function(api){
									var widget = this.getDialog().widget;
									var name = this.getValue();
                    				// if name has changed, links may be broken
                    				// forbid changing name if not new
                    				if (widget.data.name=='new name'){
										// new but ...
                    					// must check it's unique (and cannot rename for now...)
                    					var w = widget.findCksqlite(name);
                    					if((w!=null)&&(w!=widget)){
                    						// name not unique... add an underscore
                    						name = name+"_";
                    						this.getDialog().getContentElement('info','name').setValue(name);
                    					}
                    					// copy all attribute to the new name
                    					var copie = Object.assign({},widget.editor.cksqlite[widget.data.name]);
                    					delete widget.editor.cksqlite[widget.data.name];
                    					widget.editor.cksqlite[name]=copie;
                    					widget.data.name=name;
                    				} else {
                    					if(name != widget.data.name){
                    						this.getDialog().getContentElement('info','name').setValue(widget.data.name);
                    					}
                    				}
								}

							},
							{
								id: 'page',
								type: 'text',
								label: '?limit=',
								width: '75px',
								setup: function( widget ) {																	
									this.setValue( widget.editor.cksqlite[widget.data.name].page );	
								},
								commit: function( widget ) {
									widget.editor.cksqlite[widget.data.name].page=parseInt(this.getValue());									
								},
								onChange: function(api){
									if (this.getDialog().start) return;
									var widget = this.getDialog().widget;
									if((widget!=undefined)&&(widget!=null)){
										widget.editor.cksqlite[widget.data.name].page = parseInt(this.getValue());
										// when I change the page size, I need to refresh content
										var sqlData = widget.getContent();
                   				    	this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
                   				    }
								}
							},							
							{
								id: 'offset',
								type: 'text',
								label: '?offset=',
								width: '75px',
								setup: function( widget ) {																	
									this.setValue( widget.editor.cksqlite[widget.data.name].offset );	
								},
								commit: function( widget ) {
									widget.editor.cksqlite[widget.data.name].offset=parseInt(this.getValue());
								},
								onChange: function(api){
									if (this.getDialog().start) return;
									var widget = this.getDialog().widget;
									if((widget!=undefined)&&(widget!=null)){
										widget.editor.cksqlite[widget.data.name].offset=parseInt(this.getValue());
										// when I change the page size, I need to refresh content
										var sqlData = widget.getContent();
                   				    	this.getDialog().getContentElement('info','content').setValue(JSON.stringify(sqlData));
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
									this.setValue( widget.editor.cksqlite[widget.data.name].master );							
								},
								// When committing (saving) this field, set its value to the widget data.
								commit: function( widget ) {
									widget.editor.cksqlite[widget.data.name].master=this.getValue();
								},
								onChange: function(api){
									// need to recompute content
									// 1- select a table ex: /Orders?limit=2
									// 2- restrict to a field ex: /Orders/CustomerID/VINET
									// 3- select the master link
									// the sample value is replace by the indexed value from the master
									// the column name is the token before the value
									if (this.getDialog().start) { this.getDialog().start=false ; return;}
									var widget = this.getDialog().widget;
									if((widget!=undefined)&&(widget!=null)){
										// if already subscribed, unsubscribe
										if(!!widget.token){
											widget.PubSub.unsubscribe(widget.token);
										}
										// now subscribe to the new master
										var eventb = widget.event.bind(widget);
                   						// token is a widget variable which reference the subscribe token
                   						widget.token = widget.PubSub.subscribe(this.getValue(),eventb);
									    widget.editor.cksqlite[widget.data.name].master=this.getValue();
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
						},
						commit: function( widget ) {
							widget.editor.cksqlite[widget.data.name]['content']=this.getValue();
						}
					},
					{
						id: 'format',
						type: 'textarea',
						label: 'Format',
						'default':'',
						setup: function( widget ) {
							this.setValue(widget.editor.cksqlite[widget.data.name].format );
						},
						commit: function( widget ) {
							widget.editor.cksqlite[widget.data.name].format = this.getValue();
						}
					},
					{
						id: 'template',
						type: 'textarea',
						label: 'Template',
						'default':'',
						setup: function( widget ) {
							this.setValue( widget.editor.cksqlite[widget.data.name].template );
						},
						commit: function( widget ) {
							widget.editor.cksqlite[widget.data.name].template=this.getValue();
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
							this.setValue( widget.editor.cksqlite[widget.data.name].type );
						},
						// When committing (saving) this field, set its value to the widget data.
						commit: function( widget ) {
							widget.editor.cksqlite[widget.data.name].type=this.getValue();
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
