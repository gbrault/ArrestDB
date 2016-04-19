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

// loading a Document
document.onreadystatechange = function () {
  if (document.readyState == "complete") {
  	loadHiddenEditor();  	
  	var docref = window.location.search.substring(1);
  	if(!docref){
  		docref = 'rlite';
  	}
	window.rlite.waitCKEDITOR(docref);	   
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
	window.rlite.docname = docname;
	window.rlite.document="";
	// empty content div
	var content = document.getElementById("rlite");
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
	      var fragments=eval(doc.definition);
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
							name: frag.name,
							config: config,
							html: '<!-- fragment: '+frag.name+' -->'+frag.html
						}			  	
				  }
			  }
		  }
		  // build the document according to fragment list and user role
	      for(i=0; i<fragments.length; i++){
	      	// fragments are cached in the window.rlite.fragments array
	      	if(window.rlite.fragments[fragments[i]]!=undefined){
				if((window.rlite.fragments[fragments[i]].config.type=='html')
				   ||((window.user==undefined)&&
				      ( window.rlite.fragments[fragments[i]].config.type=='editor'))){
					window.rlite.document = window.rlite.document.concat(
				                             window.rlite.fragments[fragments[i]].html);
					
				} else if((window.user!=undefined)&&
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
		  var content = document.getElementById("rlite");
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
	} else if((window.user!=undefined)&&(frag.config.type=='editor')){
		// load a CKEDITOR section...
		// update the repository information
		frag.config.editor.repository.script = window.root.uri+window.root.adb;
		frag.config.editor.repository.table = 'fragments';
		frag.config.editor.repository.column = 'name';
		frag.config.editor.repository.id = frag.name;
		frag.config.editor.repository.contentcol = 'html';  // list the columns to save
		CKEDITOR.replace( frag.config.name, frag.config.editor );
		CKEDITOR.instances[frag.config.name].on("instanceReady", function(event)
	    {
     		//triggered after the editor is setup  			
     		event.editor.setData(frag.html,{noSnapshot:true});
     		if(window.user.role=='admin'){
				event.editor.setReadOnly(false);
			}
	    });
	    CKEDITOR.instances[frag.config.name].on("dataReady", function(event){
	    	// install the PubSub API
   			CKEDITOR.instances[frag.config.name].window.PubSub=PubSub;
        });
	}
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
		if(window.user==undefined){
			location.href = "#";
	        location.href = "#"+tag;
		} else {
			var editor = CKEDITOR.instances[seditor];
			var f = getEditorFrame(editor);
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
