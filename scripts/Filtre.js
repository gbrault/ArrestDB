function Filtre(mode,config,id,type){
	this.type=type;     // =='nc' follow naming convention
    this.mode = mode;   // =='run' or 'edit'
    this.def = config;  // filter configuration structure
    /* full blown def (what is kept in memory)
    def:[{ref:0,table:'Customer',select:'IdCustomer',choice:'ContactName',assoc:null},
        {ref:1,table:'Order',select:'IdOrder',choice:'OrderDate',
                    assoc:{ref:0,foreign:'IdCustomer',col:'IdCustomer'}},
        {ref:2,table:'OrderDetail',select:'IdOrder',choice:null,assoc:{ref:1,foreign:'IdOrder',col:'IdOrder'}}]
       if type=='nc' same edited def is
        [{ref:0,table:'Customer',choice:'ContactName',assoc:null},
         {ref:1,table:'Order',choice:'OrderDate',assoc:{ref:0}},
         {ref:2,table:'OrderDetail',select:'IdOrder',choice:null,assoc:{ref:1}}]
         ref:0 
               - select not specificed then record id is Id<Table name> (first char upper case)
         ref:1
               - select not specified so is IdOrder
               - assoc, no foreign keys nor col so they are IdCustomer (default id of ref1)
         ref:2
               - select is specified (IdOrder) instead of the default select (IdOrderDetail)
               - assoc, no foreign keys not column specified so it's IdOrder (default select for Order)
    */
    this.id = id;       // division id where the Filtre lies
    this.ajax = null;   // communication with the server
    this.myAutoCompletes={};
    if (window.XMLHttpRequest) {
    ajax = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    ajax = new ActiveXObject("Microsoft.XMLHTTP");
    }
}

Filtre.prototype.getRunUI = function(div){
    // return HTML string for Run Time (i.e: filter user interface)
    var ul = document.createElement("UL");
    ul.setAttribute('class','actions small');
    for(var i=0; i<this.def.length; i++){
      var li_input = document.createElement("LI");
      var li_caption = document.createElement("LI");
      var defrow = this.def[i];
      if(defrow.choice!=null){
        var input = document.createElement("INPUT");
        input.setAttribute('name',"c_"+this.id+"_"+defrow.ref);
        input.setAttribute('type','text');
        input.setAttribute('placeholder','Input '+defrow.choice+"...");
        if(defrow.value!=undefined){
			input.value=defrow.value;
		}
        var caption = document.createTextNode(defrow.table+":");
        li_caption.appendChild(caption);
        li_input.appendChild(input);
        ul.appendChild(li_caption);
        ul.appendChild(li_input);
      }       
    }
    div.appendChild(ul);
    var edit = document.createElement("a");
    var caption = document.createTextNode("Edit");
    edit.appendChild(caption);
    edit.setAttribute('class','button alt small');
    edit.onclick = function(){this.edit();}.bind(this);
    div.appendChild(edit);
    var publish = document.createElement("a");
    caption = document.createTextNode("Publish");
    publish.appendChild(caption);
    publish.setAttribute('class','button alt small');
    publish.onclick = function(){this.publish();}.bind(this);
    div.appendChild(publish);
}

Filtre.prototype.run = function(){
    this.mode='run';
    var textarea = document.getElementById("t_"+this.id);
    // if nc (name convention)type need to add default value if not present...
    var def=[];
    var simpledef=JSON.parse(textarea.value);
        for(var i=0; i<simpledef.length; i++){
        	var defrow=simpledef[i];
			var ncSelect = IdColName(defrow.table);
			var entry,assoc;
			if(typeof defrow.select!='undefined'){
				entry = {ref:defrow.ref,table:defrow.table,select:defrow.select,choice:defrow.choice};
			} else {
				entry = {ref:defrow.ref,table:defrow.table,select:ncSelect,choice:defrow.choice};
			}
			if(defrow.assoc!=null){
				var key = IdColName(simpledef[defrow.assoc.ref].table);
				if((typeof defrow.assoc.foreign !='undefined')&&(defrow.assoc.foreign != key)){					
					assoc = {ref:defrow.assoc.ref, foreign:defrow.assoc.foreign, col:defrow.assoc.col  };
				} else {
					assoc = {ref:defrow.assoc.ref, foreign:key, col:key};
				}
			} else {
				assoc = null;
			}
			entry.assoc=assoc;
			def.push(entry);
		}
    this.def = def;
    this.setup();
}

Filtre.prototype.edit= function(){
    this.mode='edit';
    this.setup();
}

Filtre.prototype.publish = function(){
    // data = [{wid:"widgetid",table:"table",col:"colname",id:"idvalue"},{...},...]
    var data = [];
    for(var i=0; i<this.def.length; i++){
        var defrow = this.def[i];
        var wid = defrow.ref;
        var table = defrow.table;
        var col = defrow.select;
        var id = null
        if(defrow.key!=null){
            id = defrow.key;
        }
        if(id==null){
            // look the association
            var fref = defrow.assoc.ref
            for(var j=0; j<this.def.length; j++){
                if(this.def[j].ref==fref){
                    id = this.def[j].key;
                }
            }
        }
        data.push({wid:wid,table:table,col:col,id:id});
    }
    console.log(data);
    if(window.PubSub){
		PubSub.publish('datasetselect',data);
	}
}

Filtre.prototype.setup = function(){
    // 'class' variables: mode,def,id,type
    var div= document.getElementById(this.id);
    if((div==undefined)||(div==null)) return;
    if(this.mode=='edit'){
        for(var key in this.myAutoCompletes){
            this.myAutoCompletes[key].destroy();
            delete this.myAutoCompletes[key];
        }
        div.innerHTML="";
        var textarea = document.createElement("TEXTAREA");
        textarea.setAttribute('rows',5);
        textarea.setAttribute('cols',100);
        textarea.setAttribute('id',"t_"+this.id);
        // simplify the def structure (to avoid complexity and verbosity) if nc (name convention) type
        var simpledef=[];
        for(var i=0; i<this.def.length; i++){
        	var defrow=this.def[i];
			var ncSelect = IdColName(defrow.table);
			var entry,assoc;
			if(defrow.select!=ncSelect){
				entry = {ref:defrow.ref,table:defrow.table, select:defrow.select,choice:defrow.choice};
			} else {
				entry = {ref:defrow.ref,table:defrow.table,choice:defrow.choice};
			}
			if(defrow.assoc!=null){
				if(defrow.assoc.foreign != IdColName(this.def[defrow.assoc.ref].table)){					
					assoc = {ref:defrow.assoc.ref, foreign:defrow.assoc.foreign, col:defrow.assoc.col  };
				} else {
					assoc = {ref:defrow.assoc.ref};
				}
			} else {
				assoc = null;
			}
			entry.assoc=assoc;
			simpledef.push(entry);
		}
        textarea.innerText= JSON.stringify(simpledef);  // simplified this.def
        div.appendChild(textarea);
        var run = document.createElement("BUTTON");
        var caption = document.createTextNode("Run");
        run.appendChild(caption);
        run.onclick = function(){this.run();}.bind(this);
        div.appendChild(run);
        var editor = CodeMirror.fromTextArea(textarea, {
        	matchBrackets: true,
        	autoCloseBrackets: true,
        	mode: "application/ld+json",
        	lineWrapping: true
        });
        div.style.textAlign="left";
    } 
    else if(this.mode=='run'){
        div.innerHTML="";
        div.style.textAlign="center";
        this.getRunUI(div);
        setTimeout(function(){
                for(var i=0; i<this.def.length; i++){
                  var defrow = this.def[i];
                  if(defrow.choice!=null){                   
                    this.myAutoCompletes[defrow.ref] = new autoComplete({
                    	cache: false,
                        selector: "input[name=c_"+this.id+"_"+defrow.ref+"]",
                        source: function(term, response){
                            if(this.assoc==null){
                                var uri = this.baseuri+this.table+"/"+this.choice+"/%25"+term+"%25?limit=20";
                                ajax.open("GET", uri, false);
                                ajax.send(null);
                                var choices=[];
                                if(ajax.status=== 200){
                                    var records = JSON.parse(ajax.responseText);
                                    for(var i=0; i<records.length; i++){
                                        choices.push([records[i][this.choice],records[i][this.select],this.ref]);
                                    }
                                }    
                                response(choices);
                            } else {                               
                                var input = document.querySelector("input[name=c_"+this.divid+"_"+this.ref+"]");
                                var choices=[];
                                for(var i=0; i< this.def.length; i++){
                                    if(this.def[i].ref==this.assoc.ref){
                                        if(this.def[i].key!=undefined){
                                            var uri = this.baseuri+this.table+"/"+this.assoc.col+"/"+this.def[i].key;
                                            ajax.open("GET", uri, false);
                                            ajax.send(null);                                            
                                            if(ajax.status=== 200){
                                                var records = JSON.parse(ajax.responseText);
                                                for(var i=0; i<records.length; i++){
                                                    if(records[i][this.choice].indexOf(term)>=0){
                                                        choices.push([records[i][this.choice],records[i][this.select],this.ref]);
                                                    }
                                                }
                                            }                                             
                                        }
                                    }
                                }
                                response(choices);                                
                            }         
                         }.bind({   def:this.def,
                                    divid:this.id,
                                    ref:defrow.ref,
                                    select: defrow.select,
                                    baseuri: "/arrestDB/ArrestDB.php/",
                                    table: defrow.table,
                                    choice: defrow.choice,
                                    assoc: defrow.assoc}),
                         renderItem: function (item, search){
                                search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                                var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                                return '<div class="autocomplete-suggestion" data-val="' + 
                                            item[0] + '" data-select="' + 
                                            item[1]+ '" data-ref="' + 
                                            item[2] + '">' + 
                                            item[0].replace(re, "<b>$1</b>") + '</div>';
                         },
                         onSelect: function(e, term, item){
                                    // console.log(e);
                                    // console.log(item);
                                    var ref = item.getAttribute('data-ref');
                                    var select = item.getAttribute('data-select');
                                    var value = item.getAttribute('data-val');
                                    for(var i=0; i< this.def.length; i++){
                                        if(this.def[i].ref==ref) {
                                            this.def[i].key=select;
                                             this.def[i].value=value;  
                                        }                                 
                                    }
                                    
                         }.bind(this)
                    });
                  }                  
                }
        }.bind(this),0);
    }
}
