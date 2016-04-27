function Nav(menuid){
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
    <li><a href="#" onclick='save();'>Save</a></li>
    <!-- for user.role == document.role or document.role == ""-->
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
    <ul class="actions vertical">
	<li><a id="test" href="#" class="button special fit">Test</a></li>
	<li><a href="https://github.com/gbrault/ArrestDB" class="button fit">Documentation</a></li>
    </ul>
</nav>
*/
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
        // <li><a href="#" onclick='save();'>Save</a></li>
	    li = document.createElement("LI");
	    a = document.createElement("a");
	    txt = document.createTextNode('Save');
	    a.appendChild(txt);
	    a.setAttribute('href','#');
	    a.setAttribute('class',"button small fit");
	    a.onclick=function(){this.Save()}.bind(this); 
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
	    sel.onclick=function(event){this.Change(event)}.bind(this);
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
}

Nav.prototype.Save = function(){
}

Nav.prototype.Change = function(event){
	if(event.currentTarget.value=="0") return;
	PubSub.publish('load',event.currentTarget.value);
}