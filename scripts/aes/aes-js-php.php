<?php 
  require 'aes.class.php';     // AES PHP implementation
  require 'aesctr.class.php';  // AES Counter Mode implementation 
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>AES JavaScript+PHP test harness (server-side decrypt)</title>
<script src="aes.js">/* AES JavaScript implementation */</script>
<script src="aes-ctr.js">/* AES Counter Mode implementation */</script>
</head>
<body>
<!-- output the post array received and dectypt the message -->
<pre>$_POST: <?= print_r($_POST, true) ?></pre>
<pre>Plaintext: <?= AesCtr::decrypt($_POST['message'], 'L0ck it up saf3', 256) ?></pre>
<input id='encrypted' type="hidden" value='<?= $_POST["message"]; ?>'>
<script>
 window.addEventListener('load', function() {
	var sencrypted = document.querySelector("#encrypted").value;
	console.log(Aes.Ctr.decrypt(sencrypted, 'L0ck it up saf3', 256));
});
</script>
</body>
</html>