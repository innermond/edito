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

$src = 'data/' . $key . '.js';
$f = fopen($src, 'r');
if ($f) {
	$collect = '';
	while($json = fgets($f)) {
		$json = preg_replace('/\s+/', '', $json);
		$json = str_replace(['\'', "\n"], ['"', ''], $json);
		$collect .= $json;
	}
	$collect = str_replace(',]', ']', $collect);
	$data = json_decode($collect, false, 512, JSON_THROW_ON_ERROR);
	$slice = array_slice($data, $a, $z - $a);
	header('Content-Type: application/json');
	echo json_encode($slice);
	exit;
}
