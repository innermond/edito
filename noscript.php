<?php
$body = trim(file_get_contents('php://input'));
$post = json_decode($body, true);
$a = $post['a'] ?? 0;
$z = $post['z'] ?? 5;
if ($z < $a) {
	list($z, $a) = [$a, $z];
}
$z *= 1;
$a *= 1;

$f = fopen('data.js', 'r');
if ($f) {
	fgets($f);
	$json = fgets($f);
	$eq = strpos($json, '=');
	$str = str_replace('\'', '"', substr($json, ++$eq));
	$data = json_decode($str);
	$slice = array_slice($data, $a, $z - $a);
	header('Content-Type: application/json');
	echo json_encode($slice);
	exit;
}
