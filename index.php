<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<title></title>
	<meta name="author" content="">
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link rel="stylesheet" href="/css/edito.css">
</head>

<body>

<div id="editor">
<div id="canvas" style="opacity:0">
<?php 
$src = $_GET['model'] ?? 'blanc.svg';
if ($src) include($src); 
?>
</div>
</div>

<! //-- <script type="module" src="app/index.js"></script> //-->
<script type="module" src="./app.pak.js"></script>

</body>

</html>
