<?php
session_start();
require('security.php')
?>

<!DOCTYPE HTML>
<!-- rlite v0.0.1 | (c) gbrault 2016 | MIT licensed -->
<!-- http://getskeleton.com/ -->
<html>
	<head>
		<title>Rlite</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="assets/css/main.css" />
		<link rel="stylesheet" href="scripts/hover.css" />
		<link rel="icon" href="favicon.ico" type="image/x-icon">
	</head>
	<body id="top">
	<div id="rlitediv">
	<!--  Where content will be added -->	
	</div>
	<!-- Hiden Editor hosting the Dialog API -->			
	<div style="display:none;">
		<textarea id="hideneditor" ></textarea>
	</div>
	<!--  Default 'boot' scripts -->
	<!-- todo: http://marijnhaverbeke.nl/uglifyjs to compress all those scripts -->
	<script>
		var root={uri:'/ArrestDB/',adb:'ArrestDB.php/',adminer:'adminer.php?sqlite=&username=&db=Northwind.sqlite'};
	</script>
	<script src="ckeditor/pubsub.js"></script>
	<script src="ckeditor/ckeditor.js"></script>
	<script src="scripts/aes/aes.js">/* AES JavaScript implementation */</script>
	<script src="scripts/aes/aes-ctr.js">/* AES Counter Mode implementation */</script>
	<script src="scripts/diff_match_patch.js"></script>
	<script src="scripts/codemirror-compressed.js"></script>
	<script src="scripts/formatting.js"></script>
	<script src="scripts/jsDump.js"></script>
	<link rel="stylesheet" href="scripts/codemirror.css" />
	<script src="scripts/dialog-polyfill/dialog-polyfill.js">/* AES Counter Mode implementation */</script>
	<link rel="stylesheet" href="scripts/dialog-polyfill/dialog-polyfill.css" />
    <script src='scripts/load.js'></script>
	</body>
</html>
