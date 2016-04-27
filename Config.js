var myNav = null;
var myNavFunction = function(){
	if(typeof Nav === 'function'){
		myNav = new Nav('leftmenu');
	} else {
		setTimeout(myNavFunction,10);
	}
}
myNavFunction();

