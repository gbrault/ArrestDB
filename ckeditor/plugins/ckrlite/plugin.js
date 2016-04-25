/**
 * Copyright (c) 2016, Gilbert Brault. All rights reserved.
 *
 * ckrlite plugin (widget to display database chuncks)
 *
 */
 /**
 * todo
 * use PubSub as the update communication vector for parameterized query
 * constraints
 *		- avoid multiple xhr request for an editor "fragment"
 *		- Dataset updated at the editor level
 *		- Plugin dialog must update Dataset definition
 *		- Dataset subscribe to 'datasetselect' event with data providing all the parameters to make the getjson query
 *		  to get all the data necessary for all the widget rendering within the editor
 *      - publish 'datasetupdate'
 *      - When dataset refreshed, publish 'datasetupdate' with new dataset as a parameter
 *		- Custom widget subcribe to this 'datasetupdate'
 *		- dataset items association made thanks the widget id
 *		- each widget have rendering template and mode associated defined by the widget dialog
 * 
 */
// Register the plugin within the editor.
CKEDITOR.plugins.add('ckrlite', {
    // This plugin requires the Widgets System defined in the 'widget' and the 'ajax' plugins.
    requires: 'widget,restajax',
    
    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'ckrlite',

    // The plugin initialization logic goes inside this method.
    init: function(editor) {
        // Register the editing dialog.
        CKEDITOR.dialog.add('ckrlite', this.path + 'dialogs/ckrlite.js'); 
        
        // Register the ckrlite widget.
        editor.widgets.add('ckrlite', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'div(!ckrlite,align-left,align-right,align-center)[!data-id]{width};' + 
            'div(!ckrlite-rendered)[title];',
            
            // Minimum HTML which is required by this widget to work.
            requiredContent: 'div(ckrlite)',
            
            // Define a nested editable area.
            editables: {
                rendered: {
                    selector:  '.ckrlite-rendered',
                    allowedContent: 'tr td[data-cell] p b br ul li ol strong em i;'+'table[csqlite-render]'   
                }
            },
            
            // Define the template of a new Sqlite widget.
            // The template will be used when creating new instances of the Simple Box widget.
            template: '<div class="ckrlite" title="Arrest DB Widget">' + 
            '<div class="ckrlite-rendered" title="rendered Data"><p>Content...</p></div>' + 
            '</div>',
            
            // Define the label for a widget toolbar button which will be automatically
            // created by the Widgets System. This button will insert a new widget instance
            // created from the template defined above, or will edit selected widget
            // (see second part of this tutorial to learn about editing widgets).
            //
            // Note: In order to be able to translate your widget you should use the
            // editor.lang.ckrlite.* property. A string was used directly here to simplify this tutorial.
            button: 'Sqlite Query Editor',
            
            // Set the widget dialog window name. This enables the automatic widget-dialog binding.
            // This dialog window will be opened when creating a new widget or editing an existing one.
            dialog: 'ckrlite',
            
            // Check the elements that need to be converted to widgets.
            //
            // Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
            // so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
            // during data processing which is done on DOM represented by JavaScript objects.
            upcast: function(element) {
                // Return "true" (that element needs to converted to a Simple Box widget)
                // for all <div> elements with a "ckrlite" class.
                return element.name == 'div' && element.hasClass('ckrlite');
            },
            /* get called before the edit dialog is open
            edit: function(evt){
                
            },
            */
            // When a widget is being initialized, we need to read the data 
            init: function() {
                // makes sure we can reference widget from the nested editable
                this.editables.rendered.widget = this;
                
                // attach the PubSub Communication Object to this widget
                this.PubSub = this.editor.window.PubSub;             
                // makes widget accessible from his cnfiguration dialog
                this.on('dialog',function(evt){
                	var data = evt.data;
                	data.widget = this
                }.bind(this));
                
                // data model at the editor level (created at editor load)
                // this.editor.ckrlite.format[this.ckrlite.id] format to filter the table query
                // this.editor.ckrlite.dataset[this.ckrlite.id].content select result
                // this.editor.ckrlite.dataset[this.ckrlite.id].select select definition
                // this.editor.ckrlite.template[this.ckrlite.id] how transform data into html
                // test if this variable exist if not initialize them
                this.ckrlite={};
                if(this.element.getAttribute('data-id')){
					this.ckrlite.id = this.element.getAttribute('data-id');
				} else {
					this.element.setAttribute('data-id',this.editor.ckrlite.counter++);
					this.ckrlite.id = this.element.getAttribute('data-id');
				}            
                if(this.editor.ckrlite.format[this.ckrlite.id]==undefined) 
                				this.editor.ckrlite.format[this.ckrlite.id]=null;
                if(this.editor.ckrlite.dataset[this.ckrlite.id]==undefined) {
                	this.editor.ckrlite.dataset[this.ckrlite.id]={};
                	this.editor.ckrlite.dataset[this.ckrlite.id].content={};
                	this.editor.ckrlite.dataset[this.ckrlite.id].select={};
                }
                if(this.editor.ckrlite.template[this.ckrlite.id]==undefined) 
                				this.editor.ckrlite.template[this.ckrlite.id]=null;
                if(this.editor.ckrlite.rendered[this.ckrlite.id]==undefined) 
                				this.editor.ckrlite.rendered[this.ckrlite.id]=null;
                
                // Other parameters
                var width = this.element.getStyle('width');
                if (width)
                    this.setData('width', width);
                
                if (this.element.hasClass('align-left'))
                    this.setData('align', 'left');
                if (this.element.hasClass('align-right'))
                    this.setData('align', 'right');
                if (this.element.hasClass('align-center'))
                    this.setData('align', 'center');
                
                this.PubSub.subscribe('datasetupdate',function(){
                	this.refresh();
                }.bind(this));
               
            },
            
            // Listen to the widget#data event which is fired every time the widget data changes
            // and updates the widget's view.
            // Data may be changed by using the widget.setData() method, used in the widget dialog window.			
            data: function() {
                this.refresh();
                // positionning
                if (this.data.width == '')
                    this.element.removeStyle('width');
                else
                    this.element.setStyle('width', this.data.width);
                
                // Brutally remove all align classes and set a new one if "align" widget data is set.
                this.element.removeClass('align-left');
                this.element.removeClass('align-right');
                this.element.removeClass('align-center');
                if (this.data.align)
                    this.element.addClass('align-' + this.data.align);
            },
            refresh: function(){
                // SQL data
                var format = this.editor.ckrlite.format[this.ckrlite.id]; 
                var content = this.editor.ckrlite.dataset[this.ckrlite.id].content; 
                var template = this.editor.ckrlite.template[this.ckrlite.id]; 
                var rendered = this.render(format,content,template);
                this.editor.ckrlite.rendered[this.ckrlite.id]=rendered;
                this.editables.rendered.setHtml(rendered);                        
            },
            render: function(format, content1, template){
              // with filtered data and template issue the html patch
              var i,j, content;
              if((format==null)||(content1==null)||(template==null)) return "";
              if(!Array.isArray(content1)){
			  	content = [content1];
			  } else {
			  	content = content1;
			  }              
              var formatList = JSON.parse(format);                            
              var out = this.formatData(content,format);
              var output='<table class="ckrlite-render">';
              var tokenizer = new Tokenizer([/\$(\w+)\$/],function( src, real, re ){
                                return real ? src.replace(re,function(all,name){
                                                  return content[i][name];
                                              }) : src;
                                }
                              );

			  
              for(i=0; i<content.length;i++){
                        var rendered_template = template;
                        rendered_template=rendered_template.replace(new RegExp('\\$row\\$','g'),""+i);
                        var tpl = rendered_template;
                        var tokens = tokenizer.parse(tpl);
                        output += tokens.join('');
              }
              output += '</table>' ;   
              return output;    
            },
            resetTemplate: function(format,type){
                // calculate out-of-the box template
                   var template="";
                   var i=0;
                   var formatList = JSON.parse(format);
                   if(type=='horizontal'){
                         template +="<tr>";
                         for(i=0; i<formatList.length; i++){
                             template +='<td>' // '<td data-cell="$row$,'+i+'">';
                             template += "$"+formatList[i].variable+"$";
                             template +="</td>";
                         }
                         template +="</tr>";
                   } else {
                       // vertical                         
                         for(i=0; i<formatList.length; i++){
                             template +="<tr>";
                             template +="<td><b>";
                             template +=formatList[i].title;
                             template +="</td></b>";
                             template +="<td>";
                             template += "$"+formatList[i].variable+"$";
                             template +="</td>";
                             template +="</tr>";
                         }                         
                   }
                   return template;
            },
            resetFormat: function(sqlData) {
                // calculate the out-of-the box format for the given query
                if ((!!sqlData) && (Array.isArray(sqlData))) {
                    var format = [];
                    var i = 0;
                    for (var key in sqlData[0]) {
                        var temp={};
                        temp={variable:key,title:key,format:"%s"};
                        format.push(temp);
                        // by default the format is the string format
                    }
                }
                return JSON.stringify(format);
            },
            formatData: function(sqlData, format) {
                var formatList = JSON.parse(format);
                var out = [];
                var i, j;
                if ((!!sqlData) && (Array.isArray(sqlData))) {
                    for (i = 0; i < sqlData.length; i++) {
                        var record = {};
                        for (j = 0; j < formatList.length; j++) {
                            record[formatList[j].variable] = sprintf(formatList[j].format, 
                            										   sqlData[i][formatList[j].variable]);
                        }
                        out.push(record);
                    }
                }
                return out;
            }
    });
    }
});
