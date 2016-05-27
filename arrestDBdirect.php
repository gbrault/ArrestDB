<?php
session_start();
require('security.php');
require ('Call_ArrestDB.php');

if(!isset($_SESSION['user'])){
	// if not logged exits
	// except if caller is local
	$ok = false;
	
	if(isset($_SERVER['REMOTE_ADDR']) && 
			(($_SERVER['REMOTE_ADDR']=='::1')||($_SERVER['REMOTE_ADDR']=='127.0.0.1'))){
		    $ok=true;
	}
	if (!$ok){
		exit(ArrestDB::Reply(ArrestDB::$HTTP[302]));	
	}
}

$dsn = 'sqlite://C:/Users/gbrau/git/ArrestDB/Northwind.sqlite';
$clients = [];

if (ArrestDB::Query($dsn) === false)
{
	exit(ArrestDB::Reply(ArrestDB::$HTTP[503]));
}

$json = file_get_contents('php://input');
if ((!isset($json))|| is_null($json) ){
	$result = ArrestDB::$HTTP[204];
	exit(ArrestDB::Reply($result));
}
$query = json_decode($json);
if ((!isset($query))|| is_null($query) || ($query=="") ){
	$result = ArrestDB::$HTTP[204];
	exit(ArrestDB::Reply($result));
}

$result = ArrestDB::Query($query);

if ($result === false)
{
	$result = ArrestDB::$HTTP[404];
}

else if (empty($result) === true)
{
	$result = ArrestDB::$HTTP[204];
}

$count = count($result);

if ($count==1){
	if(!isset($result['error'])){
		$colcount = count($result[0]);
	    if($colcount==1){
			foreach($result[0] as $key => $value){
				echo $value;
			} 
		} else {
			echo ArrestDB::Reply($result);
		}
	} else {
		echo ArrestDB::Reply($result);
	}
} else if($count>1){
	echo ArrestDB::Reply($result);
} else {
	echo "{}";
}



?>