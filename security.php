<?php
function make_seed()
{
  list($usec, $sec) = explode(' ', microtime());
  return (float) $sec + ((float) $usec * 100000);
}

if(!isset($_SESSION["key"])){
	srand(make_seed());
	$randval = rand();
	$randval = $randval . rand();
	$randval = $randval . rand();
	$randval = $randval . rand();
	$randval = substr($randval,0,16);
	$_SESSION["key"]=$randval;
	$_SESSION["after"]=$randval;	
} else {
	if(!($_SESSION["key"]=="after")){
		// the key is only set when the session starts which minimize the possiblity for outsider to learn the key
		$_SESSION["key"]="after";	
	}
}
?>