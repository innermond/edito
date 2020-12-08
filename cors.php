<?php
set_error_handler(function($errno, $errstr, $errfile, $errline, $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }

    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

$url = $_GET['url'];
$stdout = fopen('php://stdout', 'w');
try {
	$hh = get_headers($url);
	if (is_array($hh)) {
		foreach($hh as $h) {
			header($h);
		}
		header('Access-Control-Allow-Origin: *');
		echo file_get_contents($url);
	}
} catch (Exception $e) {
	header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
	echo $e->getMessage();
}
