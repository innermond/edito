<?php
$hh = get_headers($_GET['url']);
foreach($hh as $h) {
	header($h);
}
header('Access-Control-Allow-Origin: *');
echo file_get_contents($_GET['url']);
