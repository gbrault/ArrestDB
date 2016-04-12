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
		<!-- Header -->
			<header id="header">
				<h1><a href="#">Rlite</a></h1>
				<a id="login" href="#">Login</a>
				<a href="#nav">Menu</a>
			</header>
		<!-- Nav -->
			<nav id="nav">
				<ul class="links">
					<li><a href="#top">Top</a></li>
				</ul>
				<ul id="leftmenu" class="links">				
					<li><a href="#content">Content</a></li>
					<li><a href="#elements">Elements</a></li>
					<li><a href="#grid">Grid System</a></li>
				</ul>
				<ul class="actions vertical">
					<li><a id="test" href="#" class="button special fit">Test</a></li>
					<li><a href="https://github.com/gbrault/ArrestDB" class="button fit">
					Documentation</a></li>
				</ul>
			</nav>

		<!-- Banner -->
			<section id="banner" style="display:none;">
				<!-- loaded with the document (todo: banner editor)-->
			</section>

		<!-- Main -->
	<textarea id="editor1"></textarea>	

		<!-- Footer -->
			<footer id="footer">
				<div class="container">
					<div class="row double">
						<div class="6u 12u$(medium)">
							<h2>Aliquam Interdum</h2>
							<p>Ornare interdum nascetur enim lobortis nunc amet placerat pellentesque nascetur in adipiscing. Interdum amet accumsan placerat commodo ut amet aliquam blandit nunc tempor lobortis nunc non. Mi accumsan. Justo aliquet massa adipiscing cubilia eu accumsan id. Arcu accumsan faucibus vis ultricies adipiscing ornare ut. Mi accumsan. Justo aliquet massa adipiscing cubilia eu accumsan id lorem ipsum dolor.</p>
						</div>
						<div class="3u 6u(medium) 12u$(small)">
							<h3>Accumsan</h3>
							<ul class="alt">
								<li>Nascetur nunc varius commodo.</li>
								<li>Vis id faucibus montes tempor</li>
								<li>massa amet lobortis vel.</li>
								<li>Nascetur nunc varius commodo.</li>
							</ul>
						</div>
						<div class="3u$ 6u$(medium) 12u$(small)">
							<h3>Faucibus</h3>
							<ul class="alt">
								<li>Nascetur nunc varius commodo.</li>
								<li>Vis id faucibus montes tempor</li>
								<li>massa amet lobortis vel.</li>
								<li>Nascetur nunc varius commodo.</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="copyright">
					&copy; Untitled. All rights reserved.
				</div>
			</footer>
			
	


		<!-- Scripts -->
	<script src="assets/js/skel.min.js"></script>
	<script src="assets/js/main.js"></script>
	<script src="ckeditor/ckeditor.js"></script>
	<script src="scripts/aes/aes.js">/* AES JavaScript implementation */</script>
	<script src="scripts/aes/aes-ctr.js">/* AES Counter Mode implementation */</script>
	<script src="ckeditor/pubsub.js"></script>
	<script src="ckeditor/tokenizer-min.js"></script>
	<link href="ckeditor/samples/css/samples.css" rel="stylesheet">

<!-- Hiden Editor hosting the Dialog API -->			
<div style="display:none;">
<textarea id="hideneditor" ></textarea>
</div>

	</body>
</html>
