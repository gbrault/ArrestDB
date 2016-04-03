<?php
session_start();
require('security.php');
header('Content-Type: application/json');
$result = json_encode(['status' => 'OK','key'=>$_SESSION["after"]]);
echo $result;
?>