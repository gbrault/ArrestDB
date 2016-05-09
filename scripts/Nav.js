function Nav(menuid,navactions){
/*
// requires skel.io and css
Input data
Documents schema
cid	name		type	notnull		dflt_value	pk
0	IdDocument	integer	1			NULL		1
1	name		text	1			NULL		0
2	definition	text	1			NULL		0
3	category	text	0			NULL		0
4	role		text	0			NULL		0
list of ordered categories
/Documents?columns=category&distinct&by=category
[
    {
        "category": "rlite"
    },
    {
        "category": "test"
    }
]
user
user.IdUser = database record unique id
user.role = user role (admin,... to be refined)
user.First = first name
user.Last = last name
user.user = user id
script context
root={uri:'/ArrestDB/',adb:'ArrestDB.php/'};
What to produce
<!-- Nav -->
  <nav id="nav">
    <ul class="links" id="leftmenu"> -> this is given
    <!-- generic commands -->
    <li><a href="#top">Top</a></li>
    <!-- for user.role == document.role or document.role == ""-->
    <li><a href="#" onclick='file();'>File</a></li>
    <li><a href="#" onclick='view();'>View</a></li>
    <li><a href="#" onclick='print();'>Print</a></li>
    <li>      
      <div class="select-wrapper">
      	<select name="category1" id="<category1>" onchange="navChange(this);">
      		<option value="0">- <category1> -</option>
      		<option value="1"><name11></option>
      		<option value="2"><name12></option>
      		<option value="3"><name13></option>
      		<option value="4"><name14></option> 
      	</select>
      </div>
    </li>
    <!-- for user.role == document.role or document.role == ""-->
    <li>
      <div class="select-wrapper">
      	<select name="category2" id="<category2>" onchange="navChange(this);">
      		<option value="0">- <category2> -</option>
      		<option value="1"><name21></option>
      		<option value="2"><name22></option>
      		<option value="3"><name23></option>      		
      	</select>
      </div>
    </li>    
    </ul>
    <ul id="navactions" class="actions vertical">
	<li><a id="datamodel" target="_blank" href="#" class="button special fit">DataModel</a></li>
	<li><a id="test" href="#" class="button special fit">Test</a></li>
	<li><a href="https://github.com/gbrault/ArrestDB" class="button fit">Documentation</a></li>
    </ul>
</nav>
*/
// menuid navigation construction
    var i,j,ul,li,a,txt,div,sel,opt;
    this.menuid=menuid;
    ul = document.getElementById(menuid);
    if((ul==undefined)||(ul==null)) return;
    ul.innerHTML="";
    this.baseuri = root.uri+root.adb;
    // ajax declaration
    this.ajax = null;
    if (window.XMLHttpRequest) {
    	ajax = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    	ajax = new ActiveXObject("Microsoft.XMLHTTP");
    }
    // <!-- generic commands -->
    // <li><a href="#top">Top</a></li>    
    li = document.createElement("LI");
    a = document.createElement("a");
    txt = document.createTextNode('Top');
    a.appendChild(txt);
    a.setAttribute('href','#top');
    a.setAttribute('class',"button small fit");
    li.appendChild(a);
    ul.appendChild(li);
    if(!(window.user==undefined)&&(window.user.role=='admin')){
        // <li><a href="#" onclick='save();'>File</a></li>
	    li = document.createElement("LI");
	    a = document.createElement("a");
	    txt = document.createTextNode('File');
	    a.appendChild(txt);
	    a.setAttribute('href','#');
	    a.setAttribute('class',"button small fit");
	    a.onclick=function(){this.File();}.bind(this); 
	    li.appendChild(a);
	    ul.appendChild(li);
	    // add the view button
	    // <li><a href="#" onclick='view();'>View</a></li>
	    li = document.createElement("LI");
	    a = document.createElement("a");
	    txt = document.createTextNode('View');
	    a.appendChild(txt);
	    a.setAttribute('href','#');
	    if( (typeof window.user.view === 'undefined') || !window.user.view ){
			a.setAttribute('class',"button special small fit");
		} else {
			a.setAttribute('class',"button alt small fit");
		}	
	    a.onclick=function(a){this.View(a);}.bind(this,a); 
	    li.appendChild(a);
	    ul.appendChild(li);	
	    // add the print button
	    // <li><a href="#" onclick='print();'>Print</a></li>
	    li = document.createElement("LI");
	    a = document.createElement("a");
	    txt = document.createTextNode('Print');
	    a.appendChild(txt);
	    a.setAttribute('href','#');
	    if( (typeof window.user.print === 'undefined') || !window.user.print ){
			a.setAttribute('class',"button special small fit");
		} else {
			a.setAttribute('class',"button alt small fit");
		}	
	    a.onclick=function(a){this.Print(a);}.bind(this,a); 
	    li.appendChild(a);
	    ul.appendChild(li);		          		
	}    
    // find categories (distinct categories Alphabetic order)
    var uri = this.baseuri+'Documents?columns=category&distinct&by=category';
    ajax.open("GET", uri, false);
    ajax.send(null);
    var categories=[];
    if(ajax.status=== 200){
        var records = JSON.parse(ajax.responseText);
        for(i=0; i<records.length; i++){
            categories.push(records[i].category);
        }
	} else{
		return;
	}
	// iterate through categories	
	for(i=0; i<categories.length; i++){
		// <li> 
		li = document.createElement("LI");
		// <div class="select-wrapper">
		div = document.createElement("DIV");
		div.setAttribute('class','select-wrapper');		
		uri = this.baseuri+'Documents/category/'+categories[i]+'?by=name';
	    ajax.open("GET", uri, false);
	    ajax.send(null);
	    // <select name="category1" id="<category1>" onchange="navChange(this);">
	    sel = document.createElement("SELECT");
	    sel.setAttribute('id',categories[i]);
	    sel.setAttribute('name',categories[i]);
	    sel.onclick=function(event){this.Change(event);}.bind(this);
	    var names=[];
	    if(ajax.status=== 200){
	        var records = JSON.parse(ajax.responseText);
	        // <option value="0">- <category1> -</option>
	        opt=document.createElement("OPTION");
	        opt.setAttribute('value',"0");
	        txt = document.createTextNode("("+categories[i]+")");
	        opt.appendChild(txt);
	        sel.appendChild(opt);
	        for(j=0; j<records.length; j++){
	        	if((!(window.user==undefined)&&(window.user.role==records[j].role))||(records[j].role=="")){
	            	names.push(records[j].name);
	            	// <option value="1"><name21></option>
	            	opt=document.createElement("OPTION");
	            	opt.setAttribute('value',records[j].name);
	            	txt = document.createTextNode(records[j].name);
	            	opt.appendChild(txt);
	            	sel.appendChild(opt);
	            }
	        }
		} else{
			return;
		}
		if(names.length!=0){
			div.appendChild(sel);
			li.appendChild(div);
			ul.appendChild(li);
		}	
	}
// navactions menu construction
    this.navactions=navactions;
    ul = document.getElementById(navactions);
    // <li><a id="datamodel" target="_blank" href="#" class="button special fit">DataModel</a></li>
    if((ul==undefined)||(ul==null)) return;
    ul.innerHTML="";
    if(!(window.user==undefined)&&(window.user.role=='admin')){
	    li = document.createElement("LI");
	    a = document.createElement("a");
	    txt = document.createTextNode('DataModel');
	    a.appendChild(txt);
	    var uri = root.uri+root.adminer;
	    a.setAttribute('href',uri);
	    a.setAttribute('id','datamodel');
	    a.setAttribute('target','_blank');
	    a.setAttribute('class','datamodel');
	    a.setAttribute('class',"button small fit");
	    li.appendChild(a);
	    ul.appendChild(li);
    }
}

Nav.prototype.Print = function(a){
	if(typeof window.user == 'object'){
		if (typeof window.user.print != 'undefined'){
			if(window.user.print){
				window.user.print=false;
				a.setAttribute('class','button special small fit');
			} else {
				window.user.print=true;
				a.setAttribute('class','button alt small fit');
			}
		} else {
			window.user.print=true;
			a.setAttribute('class','button alt small fit');
		}
		if (typeof window.user.view != 'undefined'){
			window.user.view=false;
		}
	}
	PubSub.publish('load',window.rlite.docname);  // reload the document	
}

Nav.prototype.View =function(a){
	if(typeof window.user == 'object'){
		if (typeof window.user.view != 'undefined'){
			if(window.user.view){
				window.user.view=false;
				a.setAttribute('class','button special small fit');
			} else {
				window.user.view=true;
				a.setAttribute('class','button alt small fit');
			}
		} else {
			window.user.view=true;
			a.setAttribute('class','button alt small fit');
		}
		if (typeof window.user.print != 'undefined'){
			window.user.print = false;
		}
	}
	PubSub.publish('load',window.rlite.docname);  // reload the document
}

Nav.prototype.File = function(){
	var dialog = document.getElementById("navdialog");
	var newnav = document.getElementById("newnav");
	var savenav = document.getElementById("savenav");
	var rennav = document.getElementById("rennav");
	var deletenav = document.getElementById("deletenav");
	var cancelnav = document.getElementById("cancelnav");
	var textareanav	= document.getElementById("textareanav");
	if(typeof dialog !='undefined'){
		if(!(typeof dialog.showModal ==='function')){
			dialogPolyfill.registerDialog(dialog);
		}
		if(typeof dialog.editor==='undefined'){
			textareanav.innerText= JSON.stringify(window.rlite.docdef);
			dialog.editor = CodeMirror.fromTextArea(textareanav, {
	        	matchBrackets: true,
	        	autoCloseBrackets: true,
	        	jsonld: true,
	        	mode: "application/ld+json",
	        	lineWrapping: true
	        });
	        cancelnav.addEventListener('click', function(dialog) {
      			dialog.close();
    			}.bind(this,dialog));
	        savenav.addEventListener('click', function(dialog) {
	        	saveDocument();
      			dialog.close();
    			}.bind(this,dialog));
	        rennav.addEventListener('click', function(dialog) {
	        	var docdef = dialog.editor.getValue();
	        	var vdocdef = JSON.parse(docdef); 
	        	dialog.close();
	        	renDocument(docdef);      			
    			}.bind(this,dialog));
	        deletenav.addEventListener('click', function(dialog) {
	        	var docdef = dialog.editor.getValue();
	        	var vdocdef = JSON.parse(docdef); 
	        	dialog.close();
	        	// cannot delete rlite document (root of the site!)
	        	if(vdocdef.name!='rlite'){
					deleteDocument(docdef);
					PubSub.publish('load','rlite');
				}      			      	
    			}.bind(this,dialog));    			    						
	        newnav.addEventListener('click', function(dialog) {
	        	var docdef = dialog.editor.getValue();
	        	var vdocdef = JSON.parse(docdef); 
	        	newDocument(docdef);
      			dialog.close();
      			}.bind(this,dialog));   			    						
		} else {
			dialog.editor.getDoc().setValue(JSON.stringify(window.rlite.docdef));
			dialog.editor.save();
		}
		dialog.showModal();			
        var start = dialog.editor.firstLine(), end = dialog.editor.lastLine();
        dialog.editor.autoFormatRange({line:start,ch:0},{line:end+1,ch:0});   
		// Form cancel button closes the dialog box
   }
}

Nav.prototype.Change = function(event){
	if(event.currentTarget.value=="0") return;
	PubSub.publish('load',event.currentTarget.value);
}