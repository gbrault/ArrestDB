<?php
    session_start();
    session_destroy();
    header('Location: /ArrestDB/index.php');
?>