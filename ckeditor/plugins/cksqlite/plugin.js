/**
 * Copyright (c) 2016, CKSource -Gilbert Brault. All rights reserved.
 *
 * cksqlite plugin 
 *
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
            allowedContent: 'div(!cksqlite,align-left,align-right,align-center)[!data-select,!data-content,!data-format,!data-template]{width};' + 
            'div(!cksqlite-rendered)[title];',
            
            // Minimum HTML which is required by this widget to work.
            requiredContent: 'div(cksqlite)',
            
            // Define a nested editable area.
            editables: {
                rendered: {
                    selector:  '.cksqlite-rendered',
                    allowedContent: 'tr td p b br ul li ol strong em i;'+'table[csqlite-render]'   
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
            // When a widget is being initialized, we need to read the data (restSqlUrl)
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
                */
                
                
                // SQL parameters from persisted attributes
                var select = this.element.data('select');
                this.setData('select', select);
                               
                var content = this.element.data('content');
                this.setData('content', content);
 
                var format = this.element.data('format');
                this.setData('format', format);
 
                var template = this.element.data('template');
                this.setData('template', template);
     
                
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
                if(this.data.rendered!=""){
                    this.editables.rendered.setHtml(this.data.rendered);
                }
                
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
            render: function(){
              // with filtered data and template issue the html patch
              var i,j;
              var formatList = JSON.parse(this.editables.format.getText());              
              var content = JSON.parse(this.editables.content.getText());
              var output='<table class="cksqlite-render">';
              for(i=0; i<content.length;i++){
                 var template = this.editables.template.getText();
                 for(j=0;j<formatList.length;j++){
                    var r = new RegExp("\\$"+formatList[j].variable+"\\$",'i');
                    template = template.replace(r,content[i][formatList[j].variable]);
                 }
                 output += template;
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
                             template +="<td>";
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
                        format.push({
                            variable: key,
                            title: key,
                            format: "%s"
                        });
                        // by default the format is the string format
                    }
                }
                return JSON.stringify(format);
            },
            formatData: function(sqlData) {
                var formatList = JSON.parse(this.editables.format.getText());
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
