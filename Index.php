<?php
session_start();
require('security.php')
?>

<!DOCTYPE HTML>
<!-- rlite v0.0.1 | (c) gbrault 2016 | MIT licensed -->
<html>
	<head>
		<title>Rlite</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="assets/css/main.css" />
		<link rel="icon" href="favicon.ico" type="image/x-icon">
	</head>
	<body id="top">
	<div id="rlite">
	<!--  Where content will be added -->	
	</div>
	<!-- Hiden Editor hosting the Dialog API -->			
	<div style="display:none;">
		<textarea id="hideneditor" ></textarea>
	</div>
	<!--  Default 'boot' scripts -->
	<script>var root={uri:'/ArrestDB/',adb:'ArrestDB.php/'};</script>
	<script src="ckeditor/pubsub.js"></script>
	<script src="ckeditor/ckeditor.js"></script>
	<script src="scripts/aes/aes.js">/* AES JavaScript implementation */</script>
	<script src="scripts/aes/aes-ctr.js">/* AES Counter Mode implementation */</script>
	<script src="scripts/codemirror-compressed.js"></script>
	<link rel="stylesheet" href="scripts/codemirror.css" />
    <script src='scripts/load.js'></script>
	</body>
</html>
