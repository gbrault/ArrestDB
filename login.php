<?php
session_start();
require('security.php');
require('WebClient.php');
require 'scripts/aes/aes.class.php';     // AES PHP implementation
require 'scripts/aes/aesctr.class.php';  // AES Counter Mode implementation 
/*
* Get request action=getuser,user=<encrypted>, password=<encrypted>
* http://<server>/login.php?action=getuser&user=abqrz05?3o=&password=lu89ezqr6=
* $_SESSION["after"]= encoding aes password
*/
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'GET') === 0){
	if($_GET['action']=='getuser'){
		$user = AesCtr::decrypt($_GET['user'], $_SESSION["after"], 256);
		$password = AesCtr::decrypt($_GET['password'], $_SESSION["after"], 256);
		$webClient = new WebClient();
		$serverURL = 'http';
 		if ((array_key_exists("HTTPS",$_SERVER)) && ($_SERVER["HTTPS"] == "on")) {$pageURL .= "s";}
 		$serverURL .= "://";
 		if ($_SERVER["SERVER_PORT"] != "80") {
  			$serverURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"];
 		} else {
  			$serverURL .= $_SERVER["SERVER_NAME"];
 		}
 		$serverURL .= "/ArrestDB/ArrestDB.php/users/user/$user";
		$result=json_decode($webClient->Navigate($serverURL ));
		if(!isset($result[0]->error)){
			$dpassword = AesCtr::decrypt($result[0]->password, $password, 256);
			if(strcasecmp($dpassword,$password)===0){
				header('Content-Type: application/json');
				unset($result[0]->password);
				// save it in the session
				$_SESSION['user']=$result[0];
				$result = json_encode($result[0]);
				echo $result;
				return;					
			} else {
				header('Content-Type: application/json');
				$result = json_encode(['error' => 'UNKNOWN USER or Password']);
				echo $result;
				return;					
			}
	
		}
	}
}
header('Content-Type: application/json');
$result = json_encode(['error' => 'UNKNOWN']);
echo $result;
?>