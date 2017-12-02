<?php
session_start();
require('security.php');
require ('Call_ArrestDB.php');

if(!isset($_SESSION['user'])){
	// if not logged in the only requests allowed are from Documents and Fragments Table
	// except if caller is local
	$ok = false;
	$pathinfo = $_SERVER['PATH_INFO'];
	if((!$ok) && ((strpos($pathinfo,"/Documents")===0) || (strpos($pathinfo,"/Fragments")===0))){
			$ok=true;
	}
	if(isset($_SERVER['REMOTE_ADDR']) && 
			(($_SERVER['REMOTE_ADDR']=='::1')||($_SERVER['REMOTE_ADDR']=='127.0.0.1'))){
		    $ok=true;
	}
	/*
	if (!$ok){
		exit(ArrestDB::Reply(ArrestDB::$HTTP[302]));	
	}
	*/
}

$result = Call_ArrestDB();
echo $result;