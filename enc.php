<?php
function strToHex($string){
    $hex = '';
    for ($i=0; $i<strlen($string); $i++){
        $ord = ord($string[$i]);
        $hexCode = dechex($ord);
        $hex .= substr('0'.$hexCode, -2);
    }
    return strToUpper($hex);
}
  $string = "secretsecretsecret";
  $hpassword = '5e884898da28047151d0e56f8dc62927';  // 16,24 or 32
  $hiv='6bbda7892ad344e06c31e64564a69a9a'; //openssl_random_pseudo_bytes(16);
  $password = pack("H*",$hpassword);
  $iv = pack("H*",$hiv);
  $method = "aes-128-cbc";
  
  $encrypted = openssl_encrypt($string, $method, $password,0,$iv);
  
  echo "$string => $encrypted";
  // Outputs: This is a readable string. => OeOiTWcgIPC1xIZaDJ3XTEaY/D4m1sQmxgPbzjxxlRA=
  
  $decrypted = openssl_decrypt($encrypted, $method, $password,0,$iv);
  echo "$encrypted => $decrypted";
  // Outputs: OeOiTWcgIPC1xIZaDJ3XTEaY/D4m1sQmxgPbzjxxlRA= => This is a readable string.
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Testing Encoding</title>
		<script src="../bower_components/forge/js/forge.js"></script>
	</head>
	<body>
	    <input id='plaintext' type="hidden" value=<?php echo $string; ?>>
		<input id="password" type="hidden" value=<?php echo $hpassword; ?>>
		<input id="iv" type="hidden" value=<?php echo $hiv; ?>>
		<input id="encrypted" type="hidden" value=<?php echo $encrypted; ?>>
		<span id="decrypted"></span>
	</body>
<script>
	window.addEventListener('load', function() {
	    
		var skey = document.querySelector("#password").value;
		var siv = document.querySelector("#iv").value;
		var sencrypted =  document.querySelector("#encrypted").value;
		var splaintext = document.querySelector("#plaintext").value;
		
		var key = forge.util.hexToBytes(skey);
		var iv = forge.util.hexToBytes(siv);
		var plaintext = forge.util.hexToBytes(splaintext);
		
		var cipher = forge.cipher.createCipher('AES-CBC', key);
		cipher.start({iv: iv});
		cipher.update(forge.util.createBuffer(plaintext));
		cipher.finish();
		var encrypted = cipher.output;
		
		if(encrypted==sencrypted){
			console.log("OK");
		} else {
			console.log("NOK");
		}

	});
	
function hex2bin(hex)
{
    var bytes = [], str;

    for(var i=0; i< hex.length-1; i+=2)
        bytes.push(parseInt(hex.substr(i, 2), 16));

    return bytes;    
}
function getBytes(s) {
  var bytes = [];
  for (var i = 0; i < s.length; ++i) {
    bytes.push(s.charCodeAt(i));
  }
  return bytes;
};
</script>	
</html>