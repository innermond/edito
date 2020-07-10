<?php
$body = trim(file_get_contents('php://input'));
$post = json_decode($body, true);
$key = $post['q'];
$a = $post['a'] ?? 0;
$z = $post['z'] ?? 5;
if ($z < $a) {
	list($z, $a) = [$a, $z];
}
$z *= 1;
$a *= 1;

$src = 'app/data/' . $key . '.js';
$f = fopen($src, 'r');
if ($f) {
	$json = fgets($f);
	$str = str_replace('\'', '"', $json);
	$data = json_decode($str);
	$slice = array_slice($data, $a, $z - $a);
	header('Content-Type: application/json');
	echo json_encode($slice);
	exit;
}
