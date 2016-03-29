JS Tokenizer 1.0

This small class can easily parse a string, and generate different kind of tokens. It's very simple and straight-forward.
It can perform as a base for other string parsing scripts, like templating engines, custom language interpreters, and many more. 

When called, the script will generate the class, and if jQuery is detected, it will be saved at $.tokenizer.
Otherwise, the class is saved at (window.)Tokenizer.
Note that this script doesn't need jQuery at all, this option is added to ease on jQuery developers. 

The constructor of the class takes 2 arguments, 1 is optional.

	* tokenizers: This is a collection of strings/regexes that match the tokens.
		The Regexes don't need to include back-references, they can though, but the whole match will be considered a token.
		If you use regex, it's important that you DON'T make it global ( /.../g ).
		You can send an array of tokenizers, or just one.
	* build: This is a parsing function, it will get called for each token found, and also for the string between tokens.
		It should return the parsed token, note this doesn't need to be a string, the returned token can be an array, an object, etc. It's up to you.
		If no function is received, the tokens are the matched strings.
		The function receives 3 arguments:
		 1-The string token that was matched.
		 2-Whether it is a matched token, or the string between 2 tokens (true means real token, false, plain string).
		 3-The tokenizer that matched this string, or the one that skipped over this slice in the case of plain strings.
	
As mentioned, build won't just get called for each token found, but also for the strings between tokens.
Use the second argument to know which one it is.

After you create the tokenizer, you call the method .parse() passing the string, and it will return the array of tokens.
You might want to actually do what you need, inside the build method, and just ignore the returned array.

Some Examples:

//Template-------------------------------------------------------------------------------

var values = { name:'Joe', age:32, surname:'Smith' };
var tokenizer = new Tokenizer([ /<% (\w+) %>/, /\$(\w)/ ], function( src, real, re ){
	return src.replace( re, function( all, name ){
		return values[name];
	});
});

var tokens = tokenizer.parse('My name us <% name %> $surname, and I\'m $age years old.');
document.body.innerHTML = tokens.join('');

//CVS parser-------------------------------------------------------------------------------

var rows = [],
	row = rows[0] = [ ];
	
var cvs = new Tokenizer( [',',';'], function( text, isSeparator ){
	if( isSeparator ){
		if( text == ';' ){//new row
			row = [ ];
			rows.push(row);
		}
	}else{			
		row.push(text);
	}
});
cvs.parse('Joe,Smith,32;Jane,Doe,26;Mike,Bowel,54');