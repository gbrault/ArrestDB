<?php
require '../vendor/autoload.php';
// reference the namespace
use mikehaertl\wkhtmlto\Pdf;

// instantiate and use the Pdf class
$pdf = new Pdf;

$data = file_get_contents('php://input');
$html = json_decode($data);
$pdf->addPage($html->html);


// Output the generated PDF to Browser
echo base64_encode($pdf->toString());
?>