if(window.rlite==undefined){
  window.rlite={};
}
// wait for CKEDITOR loaded (hiddeneditor)
window.rlite.waitCKEDITOR = function(docref){
	if(CKEDITOR.restajax){
	  loadDocument(docref);
	  return;
    } else {
	  setTimeout(window.rlite.waitCKEDITOR,0,docref);
	}
};
parseQuery();
// loading a Document
document.onreadystatechange = function () {
  if (document.readyState == "complete") {
  	loadHiddenEditor();  	
  	var docref; 
  	if(typeof window.rlite.vars['docref'] !='undefined'){
  		docref = window.rlite.vars['docref'];
  	} else {
		docref = 'rlite';
	}
	window.rlite.waitCKEDITOR(docref);	   
  }
}

function parseQuery() {
	var vars = {};
    var query = window.location.search.substring(1);
    if (query.length>0){
	    var pairs = query.split("&amp;");
	    
	    for (var i=0;i<pairs.length;i++) {
	    	if(pairs[i].indexOf('=')>=0){
	     		var split = pairs[i].split("=");
	      		vars[split[0]]=split[1];		
			} else {
				vars[pairs[i]]=true;
			}
	    }		
	}
    window.rlite.vars = vars;
}

function getRandom() {
  var array = new Uint8Array(3);
  if(typeof window.crypto !='undefined'){
  	window.crypto.getRandomValues(array);
  } else {
  	for(var i=0; i<3; i++){
		array[i] = Math.floor(Math.random() * (256 - 0)) + 0;
	}  	
  }
  return ""+array[0]+256*array[1]+256*256*array[2];
}
function renDocument(docdef){
	// change the names and other properties of the current loaded object
	var newdocdef = JSON.parse(docdef);
	// get document current definition
	var lastdocdef = window.rlite.docdef;
	// save all data except the IdDocument
	
	var uri = root.uri+root.adb+"Documents/"+lastdocdef.IdDocument;
	delete newdocdef.IdDocument;
	CKEDITOR.restajax.putjson(uri,newdocdef,function(newdocdef,lastdocdef,data){
		if(typeof data.success != 'undefined'){
			// then rename all fragments if needed (except shared ones!!!)
			eval("var lastfragments="+lastdocdef.definition+";")
			eval("var newfragments="+newdocdef.definition+";");
			for(var i=0; i<newfragments.length;i++ ){
				if(newfragments[i]!= lastfragments[i]){
					// if not shared, rename needed
					uri = root.uri+root.adb+"Fragments/name/"+lastfragments[i];
					var lastfragment = CKEDITOR.restajax.getjson(uri);
					eval("var config ="+lastfragment[0].data);
					if(config.clone){
						// none shared
						uri = root.uri+root.adb+"Fragments/"+lastfragment[0].IdFragment;
						CKEDITOR.restajax.putjson(uri,{name:newfragments[i]}, function(data){
							 // do it blind...
							}); 
					}
				}
			}
		}
	}.bind(null,newdocdef,lastdocdef));
	setTimeout(function(){
		PubSub.publish('load',newdocdef.name);
	},2000); // let 2 seconds to reload document
}
function deleteDocument(docdef){
	var docdefinition = JSON.parse(docdef);
	var uri=root.uri+root.adb+"Documents/"+docdefinition.IdDocument;
	CKEDITOR.restajax.deljson(uri);
	eval("var fragments="+docdefinition.definition+";");
	for(var i=0;i<fragments.length;i++){
		uri=root.uri+root.adb+"Fragments/name/"+fragments[i]+'?columns="IdFragment,data"';
		var fragment = CKEDITOR.restajax.getjson(uri);
		eval("var config ="+fragment[0].data);
		if(config.clone){
			uri = root.uri+root.adb+"Fragments/"+fragment[0].IdFragment;
			CKEDITOR.restajax.deljson(uri);
		}
	}
}
function newDocument(docdef){
	var docdefinition = JSON.parse(docdef);
	if(docdefinition.name==window.rlite.docname){
		docdefinition.name += getRandom();
	}
	delete docdefinition.IdDocument;
	var uri=root.uri+root.adb+"Documents";
	CKEDITOR.restajax.postjson(uri,docdefinition,function(docdefinition,data){
		// main document is created
		// now, copy fragments (renaming them adding _ char at the end)
		var i={i:0};
		if(typeof data.success != 'undefined'){
			docdefinition.IdDocument=data.index;
			var copyFragments=function(docdefinition,i,data){
				if((typeof data =='undefined')||(typeof data.success != 'undefined')){
					var fragments = eval(docdefinition.definition);
					if(i.i==fragments.length){
						// update the new document definition
						var uri=root.uri+root.adb+"Documents/"+docdefinition.IdDocument;
						var docdef = {	definition:docdefinition.definition, 
										category:docdefinition.category, 
										role:docdefinition.role};					
						CKEDITOR.restajax.putjson(uri,docdef,function(docdefinition,data){
							if(typeof data.success != 'undefined'){
								PubSub.publish('load',docdefinition.name); // load the new document
							} else {
								PubSub.publish('load','rlite');
							}						
						}.bind(null,docdefinition));			
						return; // it's over
					}
					var uri = root.uri+root.adb+"Fragments/name/"+fragments[i.i];
					var fragment = CKEDITOR.restajax.getjson(uri);
					eval("var config ="+fragment[0].data);
					if(config.clone){
						var rnd = getRandom();
						fragments[i.i]+=rnd;						
						docdefinition.definition=jsDump.parse(fragments);
						uri = root.uri+root.adb+"Fragments";
						delete fragment[0].IdFragment;
						fragment[0].name +=rnd;					
						i.i++;
						CKEDITOR.restajax.postjson(uri,fragment[0],copyFragments);
					} else {
						i.i++;
						copyFragments();
					}				
				}
			}.bind(null,docdefinition,i);
			copyFragments();
		}
	}.bind(null,docdefinition));
}
function saveDocument(){
	var docdef = window.rlite.docdef;
	var fragments = eval(docdef.definition);
	for(var i=0; i< fragments.length; i++ ){
		if(typeof window.rlite.fragmentowners[fragments[i]] != 'undefined'){
			var owner = window.rlite.fragmentowners[fragments[i]];
			if(typeof owner.save === 'function'){
				(function(){
					if(typeof this.editor !='undefined'){
						this.save(this.editor);
					}									
				}.bind(owner))();
			}
		}
	}
}

function loadDocument(docname){
	var i;
	if((window.rlite.loading!=undefined)&&(window.rlite.loading)){
			return; // loading is not recursive but only iterative...
	}
	if(window.rlite.fragments==undefined){
		window.rlite.fragments=[];
	}
	if(typeof window.rlite.fragmentowners === 'undefined' ){
		window.rlite.fragmentowners = [];
	}
	window.rlite.docname = docname;
	window.rlite.document="";
	// empty content div
	var content = document.getElementById("rlitediv");
	content.innerHTML="";
	PubSub.clearAllSubscriptions();
	PubSub.subscribe('loaded',function(msg,data){
		location.href="#content";
	});
	window.rlite.loading = true;	
	var uri= window.root.uri+window.root.adb+'Documents/name/'+docname;
    var doclist = CKEDITOR.restajax.getjson(uri);
    if(!doclist.hasOwnProperty("error")){
	      var doc = doclist[0];
	      // save in memory (global variables) the document definition
	      window.rlite.docdef = doc;
	      var fragments=eval(doc.definition);
	      // purge fragments not belonging to this document
	      for(var key in window.rlite.fragments){
	      	var del=true;
		  	for(i=0;i<fragments.length;i++){
				if(key==fragments[i]){
					del = false;
					break;
				}
			}
			if(del){
				delete window.rlite.fragments[key];
			}
		  }
	      // load fragments if needed and create document
	      // create the fragment list
	      var ids=[]; 
	      for(i=0; i<fragments.length; i++){
	      	if(window.rlite.fragments[fragments[i]]==undefined){
	      		// items={"col":"CustomerID","ids":["ANATR","ANTON"]}
	      		ids.push(fragments[i]);
	      	}
	      }
	      if(ids.length!=0){
		      var items = {col:"name",ids:ids };
		      var uri = window.root.uri+window.root.adb+'Fragments/?items='+JSON.stringify(items);
		      var fraglist = CKEDITOR.restajax.getjson(uri);
		      if(!fraglist.hasOwnProperty("error")){
			      for(i=0;i<fraglist.length;i++){
				  	var frag = fraglist[i];
			    		eval('var config='+frag.data);
						window.rlite.fragments[frag.name] = {
							id: frag.IdFragment,
							name: frag.name,
							config: config,
							html: '<!-- begin fragment: '+frag.name+' -->'+frag.html+'<!-- end fragment: '+frag.name+' -->',
							plugins: frag.plugins
						}			  	
				  }
			  }
		  }
		  // build the document according to fragment list and user role
	      for(i=0; i<fragments.length; i++){
	      	// fragments are cached in the window.rlite.fragments array
	      	if(window.rlite.fragments[fragments[i]]!=undefined){
				if((window.rlite.fragments[fragments[i]].config.type=='html')
				   ||(((typeof window.user==='undefined')||
				   		((typeof window.user==='object')&&(typeof window.user.view !='undefined')&&(window.user.view))
				   	   )&&
				      ( window.rlite.fragments[fragments[i]].config.type=='editor'))){
					window.rlite.document = window.rlite.document.concat(
				                             window.rlite.fragments[fragments[i]].html);
					
				} else if(((window.user!=undefined)&&(typeof window.user.view !='undefined')&&(!window.user.view))&&
				          ( window.rlite.fragments[fragments[i]].config.type=='editor')){
					window.rlite.document = window.rlite.document.concat(
					                         '<!-- fragment textarea: '+
					                         window.rlite.fragments[fragments[i]].name+' -->'+
				                             '<textarea id="'+
				                             window.rlite.fragments[fragments[i]].config.name
				                             +'"></textarea>');
				}
			 }
		  }		
		  // render the document
		  var content = document.getElementById("rlitediv");
		  content.innerHTML="";
		  content.insertAdjacentHTML('beforeend',window.rlite.document);
		  // now load scripts, styles and editors
		  for(i=0; i<fragments.length; i++){
		    if(window.rlite.fragments[fragments[i]]!=undefined){
				loadFragment(window.rlite.fragments[fragments[i]]);
			}
		  }		
	}
    window.rlite.loading=false;
    PubSub.subscribe('user',function(msg,data){
    		loadDocument(window.rlite.docname);
	});
	PubSub.subscribe('load',function(msg,data){
		// encapsulate to make sure browser ready
		setTimeout(
			function(data){
				loadDocument(data);
			}.bind(null,data),0);    	
	});
}

function loadFragment(frag){	
	if(frag.config.type=='script'){
		for(var i=0;i<frag.config.list.length;i++){
			if(frag.config.list[i].ext=='js'){
				// clean the dom if script was already loaded (to make dom readeable)
				var scripts = document.querySelectorAll('script[src='
				                            +"'"+frag.config.list[i].file+"'"+']');
				if((scripts!=null)&& (scripts.length==1)){
					scripts[0].remove();
				}
				var scriptElement = document.createElement('script');
    			scriptElement.src = frag.config.list[i].file;
    			document.body.appendChild(scriptElement);					
			} else if (frag.config.list[i].ext=='css'){
				// clean the dom if css was already loaded (to make dom readeable)
				var stylesheets = document.querySelectorAll('link[href='
				                            +"'"+frag.config.list[i].file+"'"+']');
				if((stylesheets!=null)&& (stylesheets.length==1)){
					stylesheets[0].remove();
				}					                        
				var ls = document.createElement('link');
				ls.rel="stylesheet";
				ls.type="text/css";
				ls.href=frag.config.list[i].file;
				ls.media = 'all';
				document.getElementsByTagName('head')[0].appendChild(ls);
			}
		}
	} else if(!(window.user==undefined)&&((typeof window.user.view !='undefined')&&(!window.user.view))&&(frag.config.type=='editor')){
		// load a CKEDITOR section...
		// update the repository information
		frag.config.editor.repository.script = window.root.uri+window.root.adb;
		frag.config.editor.repository.table = 'fragments';
		frag.config.editor.repository.column = 'name';
		frag.config.editor.repository.id = frag.name;
		frag.config.editor.repository.contentcol = 'html';  // which column do I need to save?
		frag.config.editor.repository.pluginscol='plugins'; // data for plugins
		
		CKEDITOR.replace( frag.config.name, frag.config.editor );
		CKEDITOR.instances[frag.config.name].on("instanceReady", function(event)
	    {
     		//triggered after the editor is setup
     		// set editor readOnly mode 			
     		event.editor.setData(frag.html,{noSnapshot:true});
     		if(window.user.role=='admin'){
				event.editor.setReadOnly(false);
			}
			var plugins=null;
			if((frag.plugins!=undefined)&&(frag.plugins.length!=0)){
				 plugins = JSON.parse(frag.plugins);	
			}	
			// check if ckrlite is enabled and init data accordingly
			if(event.editor.plugins.ckrlite){
				if((plugins!=null)&&(plugins['ckrlite'])){
					event.editor.ckrlite=plugins['ckrlite'];
				}		
				if(event.editor.ckrlite==undefined)event.editor.ckrlite={};
				if(event.editor.ckrlite.counter==undefined) event.editor.ckrlite.counter=0;
				if(event.editor.ckrlite.format==undefined)event.editor.ckrlite.format={};
				if(event.editor.ckrlite.dataset==undefined)event.editor.ckrlite.dataset={};
				if(event.editor.ckrlite.template==undefined)event.editor.ckrlite.template={};
				if(event.editor.ckrlite.rendered==undefined)event.editor.ckrlite.rendered={};
			}
	    });
	    CKEDITOR.instances[frag.config.name].on("dataReady", function(event){
	    	// install the PubSub API
	    	if(CKEDITOR.instances[frag.config.name].window){
				CKEDITOR.instances[frag.config.name].window.PubSub=PubSub;
				CKEDITOR.instances[frag.config.name].window.root=root;
			}
			// install editor extensions
			rliteEditorExtend(event.editor);
			// who is managing the fragment now!
	    	window.rlite.fragmentowners[frag.name]=event.editor.rlite;
        });
	} else if(frag.config.type=='html'){
		if(typeof frag.config.Filtre === 'object'){
			if((typeof window.user === 'object')&&(typeof window.user.view !='undefined')&&(window.user.view)){
				// just put the 'html' part
				window.rlite.fragmentowners[frag.name]= new htmlEditor(frag.name);
				// hidden by navigation... // todo not generic: suppose banner to be under Navigation
				// add a fake div before the active filter div
				var div = document.getElementById(frag.config.Filtre.id);
				var parentDiv = div.parentElement;				
				var header = document.getElementById("header");
    			var h = header.getClientRects()[0].height;
    			var div1 = document.createElement("DIV");
    			div1.style.minHeight=Math.floor(h*1.2)+"px";
    			parentDiv.insertBefore(div1,div);
			} else {
				// need to add a Filtre
				var loadFiltreFunction = function(fragname){
					var myNav = null;
					if(typeof window.Filtre === 'function'){
						myFiltre = new Filtre(this.mode,this.def,this.id,this.type,fragname);
						myFiltre.setup();
						window.rlite.fragmentowners[fragname]=myFiltre;
					} else {
						setTimeout(loadFiltreFunction,10,fragname);
					}
				}.bind(frag.config.Filtre,frag.name)
				loadFiltreFunction();		
			}
	    } else {
			// add a simple html "editor" (edit with chrome or web browser developper tools and just program "save")
			window.rlite.fragmentowners[frag.name]= new htmlEditor(frag.name);
		}
	}
}

function htmlEditor(editor){
	this.editor=editor;
}

htmlEditor.prototype.save = function(fragname){
	var IdFragment = window.rlite.fragments[fragname].id;
	var uri = window.root.uri + window.root.adb + "Fragments/" + IdFragment;
	// update fragment in memory html part
	var html = betweenFingerprintInDocument(fragname);
	var ohtml=trimFingerprint(fragname,window.rlite.fragments[fragname].html);
	// save html if changes made and if allowed (config.save)
	if((ohtml!=html) && window.rlite.fragments[fragname].config.save){
		var content={};
		content['html']=html;	
		CKEDITOR.restajax.putjson(uri,content);		
	}	
	/*
	var id=window.rlite.fragments[fragname].config.Filtre.id;
	var idhtml=window.rlite.fragments[fragname].config.Filtre.idhtml;
	var div = document.getElementById(idhtml);
	var html="<div id='"+id+"'></div>"+div.outerHTML;
    // save to database
	var content={};
	content['data']=jsDump.parse(window.rlite.fragments[fragname].config);
	content['html']=html;	
	CKEDITOR.restajax.putjson(uri,content);	
	*/
}

function loadHiddenEditor(){
if(CKEDITOR.instances.hideneditor==undefined){
		CKEDITOR.replace( 'hideneditor', {
			extraPlugins: 'restajax'
		} );
		var editor = CKEDITOR.instances.hideneditor;
	    editor.waitDialog = function(){
		  	if(editor.currentDialog){
				editor.currentDialog.setupContent();
				return;
			} else{
				setTimeout(editor.waitDialog,200);
			}
		};
		editor.on('dialogShow',function(evt){
			editor.currentDialog = evt.data;
		});
		editor.on('dialogHide',function(evt){
			editor.currentDialog = null;
			editor.DialogPending=false;
		});		
		// beep function added to the editor (to warn user)
		editor.beep = function() {
           var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        snd.play();
        };
        // popup text in the middle of the window
	    editor.say = function( text, color, beep ) {
	    	if (color==undefined){
				color = 'lightcoral';
			}
			if (beep==undefined){
				beep = true;
			}
			var message = new CKEDITOR.dom.element( 'div' );
			message.setStyles( {
				float: 'right',
				position: 'absolute',
				top:'50%',
				left:'50%',
				'z-index':1000000,
				display:'block',
				'margin-left': '0px',
				'margin-top': '0px',
				'background-color':color
			} );
			message.setAttributes( {
				'aria-live': 'assertive',
				'aria-atomic': 'true'
			} );
			message.setText( text );

			CKEDITOR.document.getBody().append( message );
			if(beep)
				this.beep();

			setTimeout( function() {
				message.remove();
			}, 1500 );
		};
		var href = document.location.href.split( '/' );
		href.pop();
		href.push( 'login.js' );
		href = href.join( '/' );
		CKEDITOR.dialog.add('login',href);	
		
	  }
}

function getEditorFrame(editor){
	var ifs = window.document.querySelectorAll('iframe');
	for(var i=0; i<ifs.length;i++){
		if(ifs[i].title.indexOf(editor.name)>-1){
			return ifs[i];
		}
	}
	return null;
}

function Navigate(seditor,tag){
	// lets 'normal' behaviour exec and then do what's we want
	setTimeout(function(){
		if((window.user==undefined)||((typeof window.user === 'object')&&(typeof window.user.view !== 'undefined')&&(window.user.view))){
			location.href = "#";
	        location.href = "#"+tag;
		} else {
			var editor = CKEDITOR.instances[seditor];
			var f = getEditorFrame(editor);
			if( (typeof f.contentDocument.getElementById(tag) !="undefined") &&
			    ( f.contentDocument.getElementById(tag) != null ) &&
				(typeof f.contentDocument.getElementById(tag).offsetTop !="undefined"))
				f.contentWindow.scrollTo(0,f.contentDocument.getElementById(tag).offsetTop);
		}
	},0,seditor,tag);
}

function IdColName(table){
	var tb = table.charAt(0).toUpperCase() + table.toLowerCase().slice(1);
	var idColName = "Id"+tb;
	var i = table.length;
	if(table[i-1]=='s'){
		i = idColName.length;
		idColName=idColName.substr(0,i-1);
		// suppress the s
	}
	return idColName;
}

function sprintf(format) {
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
            padding: (part[2] == undefined) ? (' ')/* default */ : 
            	((part[2].substring(0, 1) == "'") ? (part[3])/* use special char */ : (part[2])/* use normal <space> or zero */),
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

function trimFingerprint(docref,doccontent){
	// suppress the fragment fingerprint if it exists
	// <!-- begin fragment: rlitedocument -->
	// <!-- end fragment: rlitedocument -->
	var start = '<!-- begin fragment: '+docref+' -->';
	var end = '<!-- end fragment: '+docref+' -->';	
	var istart = doccontent.indexOf(start);							
	if(istart>=0){
		doccontent=doccontent.substr(istart+start.length);
	}
	var iend = doccontent.indexOf(end);
	if(iend>=0){
		doccontent=doccontent.substr(0,iend);
	}
	return doccontent;
}
function betweenFingerprintInDocument(docref){
	var found = false;
	var start = '<!-- begin fragment: '+docref+' -->';
	var end = '<!-- end fragment: '+docref+' -->';								
	var doccontent=document.body.innerHTML;
	var istart = doccontent.indexOf(start);
	if(istart>=0){
		doccontent=doccontent.substr(istart+start.length);
		found=true;
	}
	var iend = doccontent.indexOf(end);
	if(iend>=0){
		doccontent=doccontent.substr(0,iend);
	} else {
		found=false;
	}
	if(found){
		return doccontent;
	}
	return "";
}

// Dataset API + other extension
// Interface between editor ckrlite widgets and actual data to optimize server sql data access
// <editor>.ckrlite.dataset[this.id].content select result
// <editor>.ckrlite.dataset[this.id].select select definition

function rliteEditorExtend(editor){
	if(editor.rlite) return; // already extended...
	// init data structures
	editor.rlite ={};
	editor.rlite.dataset ={};
	// let rlite people know which is the editor
	editor.rlite.editor = editor;
	// define save
	editor.rlite.save = function(editor){
		var docref = editor.config.repository.id;
		var idColName = IdColName(editor.config.repository.table);
		if(!!docref){
			var doccontent = editor.getData();
			doccontent = trimFingerprint(docref,doccontent);
			var uritable=editor.config.repository.script+
			editor.config.repository.table+"/";
		var uridoc= uritable+
			editor.config.repository.column+"/"+
			docref;     				
			// get the id of the current document
			var doc=CKEDITOR.restajax.getjson(uridoc);
			if(!doc.hasOwnProperty("error")){
				var uriid=uritable+doc[0][idColName];
				// what do we need to save?						
				var content={};
				content[editor.config.repository.contentcol]=doccontent;
				var plugins = {};
				// makes sure editor content is in synch
				editor.widgets.checkWidgets();
				// prepare save 
				var plugins = {};
				if(typeof editor.rlite !='undefined'){
					editor.rlite.prepsave(editor,plugins);
				}
				content[editor.config.repository.pluginscol]=JSON.stringify(plugins);				
				CKEDITOR.restajax.putjson(uriid,
									content							
									);
			}
		}		
	}
	// define prepsave
	editor.rlite.prepsave = function(editor,plugins){
		// check this data structure is in-line with editor widget content (ckrlite)
		var widgets=editor.widgets.instances;
		var test=[];
		for(var i in widgets){
			if(typeof widgets[i].ckrlite != 'undefined'){
				var id = widgets[i].ckrlite.id;
				test[id]=false;	
			}
		}
		// not all rlite are ckrlite!
		var keys = Object.keys(test);
		if(keys.length!=0){
			var struct = editor.ckrlite.format;
			editor.rlite.prune(struct,test);
			struct = editor.ckrlite.dataset;
			editor.rlite.prune(struct,test);
			struct = editor.ckrlite.template;
			editor.rlite.prune(struct,test);
			struct = editor.ckrlite.rendered;
			editor.rlite.prune(struct,test);
			plugins['ckrlite']=editor.ckrlite;	
		}	
	}
	// define prune function
	editor.rlite.prune = function(struct,test){
		for(var key in struct){
			if((test[key]==undefined)|| test[key]){
				delete struct[key];
			}
		}
	};
	// define dataset select function
	editor.rlite.dataset.select = function(){
		// update data according to definition
		var editor=this;
		var records=[];
		for(var key in editor.ckrlite.dataset){			
			records.push(editor.ckrlite.dataset[key].select); // select.table, select.col, select.id
			editor.ckrlite.dataset[key].content=null;
		}
		var uri = window.root.uri+window.root.adb+'?records='+JSON.stringify(records);
		var content = CKEDITOR.restajax.getjson(uri);
		// save content
		for(var key in editor.ckrlite.dataset){
			for(var i=0; i<content.length; i++){
				var table = Object.keys(content[i]);
				if(editor.ckrlite.dataset[key].select.table==table[0]){
					editor.ckrlite.dataset[key].content = content[i][table[0]];		
				}
			}			
		}
		// publish change
		editor.window.PubSub.publish('datasetupdate',editor.ckrlite.dataset)
	}.bind(editor);
	// subscribe to fragment parameters changes
	editor.window.PubSub.subscribe('datasetselect',function(msg,data){
		// set parameters
		// data definition
		// data = [{wid:"widgetid",table:"table",col:"colname",id:"idvalue"},{...},...]
		for(var i=0; i<data.length; i++){
			this.ckrlite.dataset[data[i].wid].select={table:data[i].table,column:data[i].col,id:data[i].id};
		}
		// update data
		this.rlite.dataset.select();
	}.bind(editor));
	//
	
}
        
