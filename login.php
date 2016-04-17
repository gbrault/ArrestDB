<?php
session_start();
require('security.php');
require ('scripts/aes/aes.class.php');     // AES PHP implementation
require ('scripts/aes/aesctr.class.php');  // AES Counter Mode implementation 
require ('Call_ArrestDB.php');
/*
* Get request action=getuser,user=<encrypted>, password=<encrypted>
* http://<server>/login.php?action=getuser&user=abqrz05?3o=&password=lu89ezqr6=
* $_SESSION["after"]= encoding aes password
*/
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'GET') === 0){
	if( (isset($_GET['action'])) && ($_GET['action']=='getuser')){
		$user = AesCtr::decrypt($_GET['user'], $_SESSION["after"], 256);
		$password = AesCtr::decrypt($_GET['password'], $_SESSION["after"], 256);
		$_SERVER['PHP_SELF']=$_SERVER['SCRIPT_NAME'].'/users/user/'.$user;
		$result = Call_ArrestDB(); 
		$result=json_decode($result);
		if(!isset($result->error)){
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
	
		} else {
				header('Content-Type: application/json');
				$result = json_encode(['error' => 'Database Error']);
				echo $result;
				return;					
		}
	}
}

header('Content-Type: application/json');
$result = json_encode(['error' => 'UNKNOWN']);
echo $result;
?>