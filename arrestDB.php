<?php
session_start();
require('security.php');
require ('Call_ArrestDB.php');

if(!isset($_SESSION['user'])){
	// if not log the only requests allowed are from Documents and Fragments Table
	$ok = false;
	$pathinfo = $_SERVER['PATH_INFO'];
	if((!$ok) && ((strpos($pathinfo,"/Documents")===0) || (strpos($pathinfo,"/Fragments")===0))){
			$ok=true;
	}
	if (!$ok){
		exit(ArrestDB::Reply(ArrestDB::$HTTP[302]));	
	}
}

$result = Call_ArrestDB();
echo $result;