var myNav = null;
var myNavFunction = function(){
	if(typeof Nav === 'function'){
		myNav = new Nav('leftmenu','navactions');
	} else {
		setTimeout(myNavFunction,10);
	}
}
myNavFunction();

