<?php
$url = $_GET['url'];
$stdout = fopen('php://stdout', 'w');
fwrite($stdout, 'hello' . "\n");
fwrite($stdout, var_export($url, true) . "\n");
$hh = get_headers($url);
fwrite($stdout, var_export($hh, true));
foreach($hh as $h) {
	header($h);
}
header('Access-Control-Allow-Origin: *');
echo file_get_contents($url);
