/* skel-baseline v3.0.1 | (c) n33 | skel.io | MIT licensed */

(function() {

	"use strict";

	// Methods/polyfills.

		// addEventsListener
			var addEventsListener=function(o,t,e){var n,i=t.split(" ");for(n in i)o.addEventListener(i[n],e)}

		// classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
			!function(){function t(t){this.el=t;for(var n=t.className.replace(/^\s+|\s+$/g,"").split(/\s+/),i=0;i<n.length;i++)e.call(this,n[i])}function n(t,n,i){Object.defineProperty?Object.defineProperty(t,n,{get:i}):t.__defineGetter__(n,i)}if(!("undefined"==typeof window.Element||"classList"in document.documentElement)){var i=Array.prototype,e=i.push,s=i.splice,o=i.join;t.prototype={add:function(t){this.contains(t)||(e.call(this,t),this.el.className=this.toString())},contains:function(t){return-1!=this.el.className.indexOf(t)},item:function(t){return this[t]||null},remove:function(t){if(this.contains(t)){for(var n=0;n<this.length&&this[n]!=t;n++);s.call(this,n,1),this.el.className=this.toString()}},toString:function(){return o.call(this," ")},toggle:function(t){return this.contains(t)?this.remove(t):this.add(t),this.contains(t)}},window.DOMTokenList=t,n(Element.prototype,"classList",function(){return new t(this)})}}();

	// Vars.
		var	$body = document.querySelector('body');

	// Breakpoints.
		skel.breakpoints({
			xlarge:	'(max-width: 1680px)',
			large:	'(max-width: 1280px)',
			medium:	'(max-width: 980px)',
			small:	'(max-width: 736px)',
			xsmall:	'(max-width: 480px)'
		});

	// Disable animations/transitions until everything's loaded.
		$body.classList.add('is-loading');

		window.addEventListener('load', function() {
			$body.classList.remove('is-loading');
		});

	// Nav.
		var	$nav = document.querySelector('#nav'),
			$navToggle = document.querySelector('a[href="#nav"]'),
			$navClose;

		// Event: Prevent clicks/taps inside the nav from bubbling.
			addEventsListener($nav, 'click touchend', function(event) {
				event.stopPropagation();
			});

		// Event: Hide nav on body click/tap.
			addEventsListener($body, 'click touchend', function(event) {
				$nav.classList.remove('visible');
			});

		// Toggle.

			// Event: Toggle nav on click.
				$navToggle.addEventListener('click', function(event) {

					event.preventDefault();
					event.stopPropagation();

					$nav.classList.toggle('visible');

				});

		// Close.

			// Create element.
				$navClose = document.createElement('a');
					$navClose.href = '#';
					$navClose.className = 'close';
					$navClose.tabIndex = 0;
					$nav.appendChild($navClose);

			// Event: Hide on ESC.
				window.addEventListener('keydown', function(event) {

					if (event.keyCode == 27)
						$nav.classList.remove('visible');

				});

			// Event: Hide nav on click.
				$navClose.addEventListener('click', function(event) {

					event.preventDefault();
					event.stopPropagation();

					$nav.classList.remove('visible');

				});

	  var	$login = document.querySelector('#login');
	  $login.addEventListener('click',function(event){
	      console.log('login');
	  	  var logout = ($login.innerText=="Logout");
	  	  if(($login.innerText=="Logout")||(window.key==undefined)||(window.key==null)){
		  	var jkey = CKEDITOR.restajax.load("/ArrestDB/logout.php");
		  	var res = JSON.parse(jkey);
		  	window.key = res.key;
		  	$login.innerText="Login";
		  	if (window.user) delete window.user;
		  }
		  if(!logout){
		    var editor = CKEDITOR.instances.hideneditor;
	  	  	// editor.ui.get('loginButton').click(editor);
	  	  	if((editor.DialogPending==undefined)||(editor.DialogPending==false)){
          		editor.DialogPending = true;
	  	  		editor.openDialog('login', editor.waitDialog);		  	
		  	}
		  	PubSub.subscribe('user', function(msg,data){                    		  	
				this.innerText="Logout";
			}.bind(login));		  	
		  }
	  });
	  
	  var $test = document.querySelector('#test');
	  $test.addEventListener('click',function(event){
	       if(CKEDITOR){
		   	  if(CKEDITOR.restajax==undefined){
			  	CKEDITOR.plugins.load('restajax', function(){
			  		var $value = CKEDITOR.restajax.getjson('/ArrestDB/test.php');
			  		console.log($value);
			  	});
			  } else {
			  	var $value = CKEDITOR.restajax.getjson('/ArrestDB/test.php');
			  	console.log($value);
			  }
		   }		   
	  });
	  
 document.onreadystatechange = function () {
  if (document.readyState == "complete") {	  
	CKEDITOR.replace( 'editor1', {
		    readOnly: true,
		    toolbarCanCollapse: true,
		    toolbarStartupExpanded: false,
		    allowedContent: true,
			repository: {script: '/ArrestDB/ArrestDB.php/', table:'Pages', column:'name'},
			// Load the cksqlite plugin.
			extraPlugins: 'ArrestDBcmd,preview',

			// Besides editor's main stylesheet load also cksqlite styles.
			// In the usual case they can be added to the main stylesheet.
			contentsCss: [
				'assets/css/main.css'
			],

			// Set height to make more content visible.
			height: Math.trunc(window.innerHeight/2),
			// Rearrange toolbar groups and remove unnecessary plugins.
			toolbarGroups: [
				{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
				{ name: 'links' },
				{ name: 'insert' },
				{ name: 'document',	   groups: [ 'mode' ] },
				// '/',
				{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
				{ name: 'paragraph',   groups: [ 'list', 'indent' ] },
				{ name: 'styles' },
				{ name: 'about' }
			],
			removePlugins: 'pastetext,pastefromword'		
		} );

	CKEDITOR.instances.editor1.on("instanceReady", function(event)
	{
     		//triggered after the editor is setup
     		var docref = window.location.search.substring(1);
     		var bloadpage = loadpage.bind(event.editor);
     		bloadpage(docref);    			
	});

	CKEDITOR.instances.editor1.on("focus", function(event){       
    });
    	
    CKEDITOR.instances.editor1.on("dataReady", function(event){
       		CKEDITOR.instances.editor1.window.PubSub=PubSub;
    });

    CKEDITOR.instances.editor1.on("instanceReady", function(event){
    		
    });
    	
    CKEDITOR.instances.editor1.on("configLoaded", function(event){
    		
    });

    CKEDITOR.instances.editor1.on("loaded", function(event){
    		
    });

    CKEDITOR.instances.editor1.on("contentDom", function(event){    
    		
    });
  }
 }
})();

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
	var editor = CKEDITOR.instances[seditor];
	var f = getEditorFrame(editor);
	f.contentWindow.scrollTo(0,f.contentDocument.getElementById(tag).offsetTop);
}

function Leftmenu(editor){
	// get a List of all Site Pages = content of Pages table
	var uri=editor.config.repository.script+'Pages?columns="id,name';
	var list = CKEDITOR.restajax.getjson(uri);
	if((list)&&(!list.error)){
		var html="";
		if(window.loader==undefined) window.loader={};
		window.loader[editor.name] = loadpage.bind(editor);
		for(var i=0; i<list.length; i++){
			html += '<li><a href="#" onclick="loader.'+editor.name+'('+
			        "'"+list[i].name+"'"+');">'+list[i].name+'</a></li>';
		}
		var	$leftmenu = document.querySelector('#leftmenu');
		$leftmenu.innerHTML=html;
	}
}

function loadpage(docref){
    if(!docref){
 			  docref="main";  // default document...
 	}   	
	// get the content
	var editor = this;
	var uri=editor.config.repository.script+
			editor.config.repository.table+"/"+
			editor.config.repository.column+"/"+
			docref;
	var doc = CKEDITOR.restajax.getjson(uri);
	if(!doc.hasOwnProperty("error")){
		editor.cksqlite = JSON.parse(doc[0].blob);  			
		editor.setData(doc[0].content,{noSnapshot:true});
		var banner=document.querySelector('#banner');
		if((banner)&&(doc[0].banner.length!=0)){
				banner.innerHTML=doc[0].banner;
				banner.style.display='inherit';
			}
			setTimeout(function(){
				   window.scrollTo(0,
						window.document.getElementById("top").offsetTop);
				   Leftmenu(editor);		
				}.bind(editor)
			,1000);
				
	} else {
		if (window.confirm(docref+" Does not exist; Do you want to create it?")){
		// code 204 = no content with this name => create it!
		    var uri = editor.config.repository.script+
			editor.config.repository.table+"/";
			doc = CKEDITOR.restajax.postjson(uri,
											{name:docref,content:"",blob:"{}",banner:""});
		    editor.cksqlite ={};
		    editor.setData("",{noSnapshot:true});
		}
	}
}

