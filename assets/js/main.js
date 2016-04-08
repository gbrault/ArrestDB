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
	      /*
	        if(($login.innerText=="Logout")||(key==undefined)){
				window.location.href ="/ArrestDB/logout.php";
				$login.innerText="Login";
			}
	  	    if(localStorage.getItem('arrestdb_GUID')){
	  	    	// save the encoding key value
	  	    	// GUID is stored
	  	    	// 'log'' the user
	  	    	$login.innerText="Logout";
	  	    } else {
	  	    	// Need to set GUID
	  	    	window.location.href ="/ArrestDB/logout.php";
	  	    }
	  	    */
	  	  if((key==undefined)||(key==null)){
		  	var jkey = CKEDITOR.restajax.load("/ArrestDB/logout.php");
		  	var res = JSON.parse(jkey);
		  	key = res.key;
		  }
	  	  var editor = CKEDITOR.instances.hideneditor;
	  	  // editor.ui.get('loginButton').click(editor);
	  	  if((editor.DialogPending==undefined)||(editor.DialogPending==false)){
          		editor.DialogPending = true;
	  	  		editor.openDialog('login', editor.waitDialog);		  	
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
		/*	
		editor.addCommand( 'loginCmd',
					new CKEDITOR.dialogCommand( 'login' ));
		editor.ui.add( 'loginButton', CKEDITOR.UI_BUTTON, {
					label: 'loginCmd',
					command: 'loginCmd'
		});
		*/
		
	  }
  }
 }
})();

// aes session key
var key;
function setSessionKey(){
	var $key=document.querySelector("#key");  	  
	if($key.value!="after"){ 
   		key = $key.value; 		
	}	
}
setSessionKey();

