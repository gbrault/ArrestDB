/**
 * Copyright (c) 2016, Gilbert Brault. All rights reserved.
 *
 * cksqlite plugin (widget to display database chuncks)
 *
 */
 /**
 * to do
 * 1- reengineer the data storage of document widget data (very poor performance now)
 * 2- see a document with parameters = parametric documents
 * 
 * 1- add a data storage with the document in the sqlite database
 * 1- save it as a json object
 * 1- while loading the document attach the data blob to editor instance
 * 1- access from the widget: wiget.editor.cksqlite[widget.data.name].<widget parameter>
 * 1- data stored as javascript objet in-memory and as json in the database
 *
 * 2- Parametric document: add parameters to the calling url respecting the url syntax
 * 2- exemple: <serverpath>cksqlite.html?doc=facture&client=ALFAKI&order=10364
 * 2- to get the bill of ALFAKI order 10364
 * 2- save parameters as a json object into the database
 * 2- create a list of document instances as a table in the database
 * 2- can then browse 'created' documents using this table
 * 2- the paradygm is then to browse this table which is an avatar of clerk job
 * 2- in this table must put more than the parameters
 * 2- date of creation, who have created it, seen it... with dates and may be more 
 */
// Register the plugin within the editor.
CKEDITOR.plugins.add('cksqlite', {
    // This plugin requires the Widgets System defined in the 'widget' and the 'ajax' plugins.
    requires: 'widget,restajax',
    
    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'cksqlite',

    // The plugin initialization logic goes inside this method.
    init: function(editor) {
        // Register the editing dialog.
        CKEDITOR.dialog.add('cksqlite', this.path + 'dialogs/cksqlite.js'); 
        
        // Register the cksqlite widget.
        editor.widgets.add('cksqlite', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'div(!cksqlite,align-left,align-right,align-center)[!data-name]{width};' + 
            'div(!cksqlite-rendered)[title];',
            
            // Minimum HTML which is required by this widget to work.
            requiredContent: 'div(cksqlite)',
            
            // Define a nested editable area.
            editables: {
                rendered: {
                    selector:  '.cksqlite-rendered',
                    allowedContent: 'tr td[data-cell] p b br ul li ol strong em i;'+'table[csqlite-render]'   
                }
            },
            
            // Define the template of a new Sqlite widget.
            // The template will be used when creating new instances of the Simple Box widget.
            template: '<div class="cksqlite" title="Arrest DB Widget">' + 
            '<div class="cksqlite-rendered" title="rendered Data"><p>Content...</p></div>' + 
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
            upcast: function(element) {
                // Return "true" (that element needs to converted to a Simple Box widget)
                // for all <div> elements with a "cksqlite" class.
                return element.name == 'div' && element.hasClass('cksqlite');
            },
            /* get called before the edit dialog is open
            edit: function(evt){
                
            },
            */
            // When a widget is being initialized, we need to read the data 
            // from DOM and set it by using the widget.setData() method.
            // More code which needs to be executed when DOM is available may go here.
            init: function() {
                /*  events possible subscription
                        this.on('deselect',function(){
                             alert("deselect");       
                        });
                        this.on('select',function(){
                             alert("select");       
                        });
               
                this.on('customchange', function() {
                    alert("custom change");
                });
                
                this.on('rendered', function() {
                    alert("widget rendered");
                });    
                this.on('selectChange', function() {
                    alert("widget selectChange");
                });
                */
                // prerequisite editor should have the cksqlite object attached create it if not
                if(this.editor.cksqlite==undefined)
                      this.editor.cksqlite = {};
                this.on( 'doubleclick', function( evt ) {
                        console.log( 'widget#doubleclick' );
                        }, null, null, 5 );
                this.on('destroy',function(evt){
                   if(!!this.editor.cksqlite[this.data.name])
                        delete this.editor.cksqlite[this.data.name];      
                });
                this.on('key',function(evt){
                    console.log(evt.data.keyCode);
                    // 34 page down, 33 page up
                    // receive the keys when widget selected
                    var page = parseInt(this.data.page);
                    var offset = parseInt(this.data.offset);
                    if (evt.data.keyCode==34){
                       offset += page; 
                    }                    
                    if (evt.data.keyCode==33){
                        offset -=page;
                        if(offset<0) offset=0;
                    }
                    this.editor.cksqlite[this.data.name].offset = offset;
                    var content = this.getContent();
                    if((!!!content.error)&&!!(content.length)){
                        var sqlData = JSON.stringify(content);                    
                        this.editor.cksqlite[this.data.name].content=sqlData;  
                    } 
                });
                // the following 4 lines must be at the bigenning of init function
                // makes sure we can reference widget from the nested editable
                this.editables.rendered.widget = this;
                // attach the PubSub Communication Object to this widget
                this.PubSub = this.editor.window.PubSub;       

                // widget is busy constructing
                this.editables.rendered.$.style.cursor='wait';
              
                // this is a widget...
                if(!!this.editor.cksqlite_timer){
                   // console.log("load cksqlite widget:"+Date.now());
                   clearTimeout(this.editor.cksqlite_timer);
                } 
                this.editor.cksqlite_timer=setTimeout(function(){
                   // the last loaded widget will publish an init message
                   this.PubSub.publish('Init',{event:'contentChange',widget:this});
                   console.log("Init");
                   this.editables.rendered.$.style.cursor='auto';
                   this.PubSub.publish('endwait',this);                 
                }.bind(this),500); // assuming no more than 500ms to load a widget            

                this.editables.rendered.on('click', function() {
                    // alert("rendered clicked");
                    var ref=arguments[0].data.$.srcElement.getAttribute('data-cell');
                    if((ref!=undefined)&&(ref!=null)&&(ref!="")){
                        // save the index of the new selected object
                        this.widget.editor.cksqlite[this.widget.data.name].index=ref;
                        // publish index change
                        var event = {event:'indexChange',widget:this.widget};
                        this.widget.PubSub.publish(this.widget.data.name,event);
                    }
                });                
                
                // SQL parameters from persisted attributes
                var name = this.element.data('name');
                if(!!!name) name="new name";
                this.setData('name', name);

                if(this.editor.cksqlite[name]==undefined){
                    this.editor.cksqlite[name]={};        
                }

                /*
                var select = this.element.data('select');
                this.setData('select', decodeURI(select));
                */
                /*
                var master = this.element.data('master');
                this.setData('master', master);
                */
                // subscribing to all master events
                var master = this.editor.cksqlite[name].master;
                if((!!master)&&(master!=-1)){
                   var eventb = this.event.bind(this);
                   // token is a widget variable which reference the subscribe token
                   this.token = this.PubSub.subscribe(master,eventb);
                   this.token = this.PubSub.subscribe('Init',eventb);
                }

                this.PubSub.subscribe('endwait', function(msg,data){
                    widget=this;
                    console.log(msg+" from:"+data.data.name+" to:"+widget.data.name+" "+Date.now());
                    widget.editables.rendered.$.style.cursor='auto';        
                }.bind(this));            

                /*
                var page = this.element.data('page');
                */
                var page = this.editor.cksqlite[name].page;
                if(!!!page){
                   page=10;
                   // this.element.setAttribute('data-page',page);
                   this.editor.cksqlite[name].page=page;
                }
                var ipage= parseInt(page);
                if(isNaN(ipage)){
                   page=10;
                   this.element.setAttribute('data-page',page);
                   this.editor.cksqlite[name].page=page;
                }
                this.setData('page', page);
                
                /*
                var offset = this.element.data('offset');
                */
                var offset = this.editor.cksqlite[name].offset;
                if(!!!offset|| ((!!offset)&&(offset=="NaN"))) { 
                   offset=0;
                   // this.element.setAttribute('data-offset',offset);
                   this.editor.cksqlite[name].offset=offset;
                }
                var ioffset = parseInt(offset);
                if(isNaN(ioffset)){
                  offset=0;
                  // this.element.setAttribute('data-offset',offset);
                  this.editor.cksqlite[name].offset=offset;
                }      
                               
                // this.setData('offset', offset);

                /*
                var index = this.element.data('index');
                this.setData('index', index);
                                         
                var content = this.element.data('content');
                this.setData('content', decodeURI(content));
 
                var format = this.element.data('format');
                this.setData('format', format);
 
                var type = this.element.data('type');
                this.setData('type', type);

                var template = this.element.data('template');
                this.setData('template', template);

                var rendered = this.element.data('rendered');
                this.setData('rendered', rendered);
                */
                // let the other parameters as they are...
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
               
            },
            
            // Listen on the widget#data event which is fired every time the widget data changes
            // and updates the widget's view.
            // Data may be changed by using the widget.setData() method, used in the widget dialog window.			
            data: function() {
                // SQL data
                var format = this.editor.cksqlite[this.data.name].format; // this.data.format;
                var content = this.editor.cksqlite[this.data.name].content; // this.data.content;
                var template = this.editor.cksqlite[this.data.name].template; // this.data.template;
                var rendered = this.render(format,content,template);
                // this.element.setAttribute('data-rendered',rendered);
                this.editor.cksqlite[this.data.name].rendered=rendered;
                // this.setData('rendered', rendered);
                this.editables.rendered.setHtml(rendered);
                
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
           render: function(format, content, template){
              // with filtered data and template issue the html patch
              var i,j;
              if((format==null)||(content==null)||(template==null)) return "";
              var formatList = JSON.parse(format);              
              var content = JSON.parse(content);
              var out = this.formatData(content,format);
              var output='<table class="cksqlite-render">';
              /*
              for(i=0; i<content.length;i++){
                 var rendered_template = template;
                 rendered_template=rendered_template.replace(new RegExp('\\$row\\$','g'),""+i);
                 for(j=0;j<formatList.length;j++){
                    var r = new RegExp("\\$"+formatList[j].variable+"\\$",'i');
                    rendered_template = rendered_template.replace(r,out[i][formatList[j].variable]);
                 }
                 output += rendered_template;
              }*/
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
                             template +='<td data-cell="$row$,'+i+'">';
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
                            record[formatList[j].variable] = this.sprintf(formatList[j].format, sqlData[i][formatList[j].variable]);
                        }
                        out.push(record);
                    }
                }
                return out;
            },
            findCksqlite: function(name){                
                var instances = this.editor.widgets.instances
                if((instances!=undefined)&&(instances!=null)){                     
                      for(var i in instances){
                          if(instances[i].name=='cksqlite') {
                               if(instances[i].data.name==name) {
                                    return instances[i]; 
                               }     
                          }       
                      }      
                }
                return null
            },
            masterList: function(){
                var instances = this.editor.widgets.instances
                if((instances!=undefined)&&(instances!=null)){
                      var select = [];
                      for(var i in instances){
                          if(instances[i].name=='cksqlite'){
                              if(instances[i].data.name!=this.data.name){
                                    select.push([instances[i].data.name, instances[i].data.name]);
                              }
                          }  
                      }
                      return select;                                  
                }       
            },
            getContent: function(){
                  // test if master mode setData
               var path=this.editor.cksqlite[this.data.name].select;
               if((path!=undefined)&&(!!path)){   
                  var master = this.editor.cksqlite[this.data.name].master;                 
                  if((master!=undefined) &&
                     (master!=null) &&
                     (master!="") &&
                     (master!="-1")){
                     // this widget is master linked
                     // get the column name of master from select
                     var n = path.lastIndexOf("/");
                     var column_name = path.substring(0,n);
                     var m = column_name.lastIndexOf("/");
                     column_name = column_name.substring(m+1);
                     var master_widget = this.findCksqlite(this.editor.cksqlite[this.data.name].master);
                     var index = this.editor.cksqlite[master_widget.data.name].index;
                     if((index==undefined)||(index==null)){
                         // set the index to 0,0
                         index=this.editor.cksqlite[master_widget.data.name].index="0,0";
                     }
                     var content = this.editor.cksqlite[master_widget.data.name].content;
                     if((master_widget!=undefined)&&(master_widget!=null)){                        
                        
                           if((content!=undefined)&&(content!=null)){
                              content = JSON.parse(content);
                              if((content!=undefined)&&(content!=null)){
                                 var index = parseInt(index.split()[0],10);
                                 if((!!content[index])&&(content[index][column_name]!=undefined)&&(content[index][column_name]!=null)){                                    
                                     path = path.substring(0,n+1)+content[index][column_name];
                                 }
                              }
                           }                           
                          
                     }
                  }
                  if(!!this.editor.cksqlite[this.data.name].page){
                     path += "?limit="+this.editor.cksqlite[this.data.name].page
                  } else {
                     path += "?limit=10";
                  }
                  if(!!this.editor.cksqlite[this.data.name].offset){
                     path+="&offset="+this.editor.cksqlite[this.data.name].offset;
                  }                 
                  var url = "/ArrestDB/ArrestDB.php" + path;
                  var sqlData = CKEDITOR.restajax.getjson(url);
                  return sqlData;
               } else return {};
            },
            event: function(msg,data){
                console.log(msg+" "+" event:"+data.event+" from:"+data.widget.data.name+" to:"+this.data.name+" "+Date.now());
                // msg = master (must be unique) which published the event
                // data = {event:'event',widget:widget}            
                if((data.event=='indexChange')||(data.event=='contentChange')){
                    var widget = this;
                    // reset index
                    this.editor.cksqlite[this.data.name].index="0,0";
                    // reset the offset
                    this.editor.cksqlite[this.data.name].offset=0;
                    // recompute content
                    var sqlData = widget.getContent();
                    // widget.setData('content',JSON.stringify(sqlData));
                    this.editor.cksqlite[this.data.name].content=JSON.stringify(sqlData);
                    // widget.fire('contentChange',this);
					widget.setData('refresh',"0");
					widget.setData('refresh',"1");									
                    widget.PubSub.publish(this.data.name,{event:'contentChange',widget:widget});
                }                
            },
            sprintf: function(format) {
                // Check for format definition
                if (typeof format != 'string') {
                    throw "sprintf: The first arguments need to be a valid format string.";
                }
                
                /**
                 * Define the regex to match a formating string
                 * The regex consists of the following parts:
                 * percent sign to indicate the start
                 * (optional) sign specifier
                 * (optional) padding specifier
                 * (optional) alignment specifier
                 * (optional) width specifier
                 * (optional) precision specifier
                 * type specifier:
                 *  % - literal percent sign
                 *  b - binary number
                 *  c - ASCII character represented by the given value
                 *  d - signed decimal number
                 *  f - floating point value
                 *  o - octal number
                 *  s - string
                 *  x - hexadecimal number (lowercase characters)
                 *  X - hexadecimal number (uppercase characters)
                 */
                var r = new RegExp(/%(\+)?([0 ]|'(.))?(-)?([0-9]+)?(\.([0-9]+))?([%bcdfosxX])/g);
                
                /**
                 * Each format string is splitted into the following parts:
                 * 0: Full format string
                 * 1: sign specifier (+)
                 * 2: padding specifier (0/<space>/'<any char>)
                 * 3: if the padding character starts with a ' this will be the real
                 *    padding character
                 * 4: alignment specifier
                 * 5: width specifier
                 * 6: precision specifier including the dot
                 * 7: precision specifier without the dot
                 * 8: type specifier
                 */
                var parts = [];
                var paramIndex = 1;
                while (part = r.exec(format)) {
                    // Check if an input value has been provided, for the current
                    // format string (no argument needed for %%)
                    if ((paramIndex >= arguments.length) && (part[8] != '%')) {
                        throw "sprintf: At least one argument was missing.";
                    }
                    
                    parts[parts.length] = {
                        /* beginning of the part in the string */
                        begin: part.index,
                        /* end of the part in the string */
                        end: part.index + part[0].length,
                        /* force sign */
                        sign: (part[1] == '+'),
                        /* is the given data negative */
                        negative: (parseFloat(arguments[paramIndex]) < 0) ? true : false,
                        /* padding character (default: <space>) */
                        padding: (part[2] == undefined) ? (' ')/* default */ : ((part[2].substring(0, 1) == "'") ? (part[3])/* use special char */ : (part[2])/* use normal <space> or zero */),
                        /* should the output be aligned left?*/
                        alignLeft: (part[4] == '-'),
                        /* width specifier (number or false) */
                        width: (part[5] != undefined) ? part[5] : false,
                        /* precision specifier (number or false) */
                        precision: (part[7] != undefined) ? part[7] : false,
                        /* type specifier */
                        type: part[8],
                        /* the given data associated with this part converted to a string */
                        data: (part[8] != '%') ? String(arguments[paramIndex++]) : false
                    };
                }
                
                var newString = "";
                var start = 0;
                // Generate our new formated string
                for (var i = 0; i < parts.length; ++i) {
                    // Add first unformated string part
                    newString += format.substring(start, parts[i].begin);
                    
                    // Mark the new string start
                    start = parts[i].end;
                    
                    // Create the appropriate preformat substitution
                    // This substitution is only the correct type conversion. All the
                    // different options and flags haven't been applied to it at this
                    // point
                    var preSubstitution = "";
                    switch (parts[i].type) {
                    case '%':
                        preSubstitution = "%";
                        break;
                    case 'b':
                        preSubstitution = Math.abs(parseInt(parts[i].data)).toString(2);
                        break;
                    case 'c':
                        preSubstitution = String.fromCharCode(Math.abs(parseInt(parts[i].data)));
                        break;
                    case 'd':
                        preSubstitution = String(Math.abs(parseInt(parts[i].data)));
                        break;
                    case 'f':
                        preSubstitution = (parts[i].precision === false) ? (String((Math.abs(parseFloat(parts[i].data))))) : (Math.abs(parseFloat(parts[i].data)).toFixed(parts[i].precision));
                        break;
                    case 'o':
                        preSubstitution = Math.abs(parseInt(parts[i].data)).toString(8);
                        break;
                    case 's':
                        preSubstitution = parts[i].data.substring(0, parts[i].precision ? parts[i].precision : parts[i].data.length);
                        /* Cut if precision is defined */
                        break;
                    case 'x':
                        preSubstitution = Math.abs(parseInt(parts[i].data)).toString(16).toLowerCase();
                        break;
                    case 'X':
                        preSubstitution = Math.abs(parseInt(parts[i].data)).toString(16).toUpperCase();
                        break;
                    default:
                        throw 'sprintf: Unknown type "' + parts[i].type + '" detected. This should never happen. Maybe the regex is wrong.';
                    }
                    
                    // The % character is a special type and does not need further processing
                    if (parts[i].type == "%") {
                        newString += preSubstitution;
                        continue;
                    }
                    
                    // Modify the preSubstitution by taking sign, padding and width
                    // into account
                    
                    // Pad the string based on the given width
                    if (parts[i].width != false) {
                        // Padding needed?
                        if (parts[i].width > preSubstitution.length) {
                            var origLength = preSubstitution.length;
                            for (var j = 0; j < parts[i].width - origLength; ++j) {
                                preSubstitution = (parts[i].alignLeft == true) ? (preSubstitution + parts[i].padding) : (parts[i].padding + preSubstitution);
                            }
                        }
                    }
                    
                    // Add a sign symbol if neccessary or enforced, but only if we are
                    // not handling a string
                    if (parts[i].type == 'b' || parts[i].type == 'd' || parts[i].type == 'o' || parts[i].type == 'f' || parts[i].type == 'x' || parts[i].type == 'X') {
                        if (parts[i].negative == true) {
                            preSubstitution = "-" + preSubstitution;
                        } else if (parts[i].sign == true) {
                            preSubstitution = "+" + preSubstitution;
                        }
                    }
                    
                    // Add the substitution to the new string
                    newString += preSubstitution;
                }
                
                // Add the last part of the given format string, which may still be there
                newString += format.substring(start, format.length);
                
                return newString;
            }
        });
    }
});
