<?php
    session_start();
    session_destroy();
    session_start();
    require('security.php');
    header('Content-Type: application/json');
    echo json_encode(['key' => $_SESSION["after"]]);
?>