var mode = "run";
var def = [{ref:0,table:'Customer',select:'IdCustomer',choice:'ContactName',assoc:null},
           {ref:1,table:'Order',select:'IdOrder',choice:'OrderDate',assoc:{ref:0,foreign:'IdCustomer',col:'IdCustomer'}},
           {ref:2,table:'OrderDetail',select:'IdOrder',choice:null,assoc:{ref:1,foreign:'IdOrder',col:'IdOrder'}}];
var id="filter1";
var myFiltre = null;
if(typeof Filtre === 'function'){
	myFiltre = new Filtre(mode,def,id);
	myFiltre.setup();
}
