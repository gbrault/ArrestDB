<?php
require '../vendor/autoload.php';
// reference the Dompdf namespace
use Dompdf\Dompdf;

// instantiate and use the dompdf class
$dompdf = new Dompdf();
// $dompdf->loadHtml('hello world');
// $dompdf->loadHtmlFile("http://localhost:8080/ArrestDB/");

$data = file_get_contents('php://input');
$html = json_decode($data);
$dompdf->loadHtml($html->html);

// (Optional) Setup the paper size and orientation
$dompdf->setPaper('A4', 'portrait');

// Render the HTML as PDF
$dompdf->render();

// Output the generated PDF to Browser
echo base64_encode($dompdf->output());
?>