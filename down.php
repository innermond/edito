<?php
  $data = file_get_contents('steps.svg');
  header('Content-type: application/octet-stream');
  header('Content-disposition: attachment;filename=steps.svg');

  echo $data;
