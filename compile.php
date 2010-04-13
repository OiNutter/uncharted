<?php 
session_start();
require_once('lib/Sprockets/Sprocket.php');

$filePath = "js/uncharted.js";
$sprocket = new Sprockets_Sprocket($filePath, array(
	'baseUri' => 'lib/Sprockets',
	'debugMode' => true
)); 
file_put_contents('js/uncharted.full.js',$sprocket->render(true));
echo "Compiled";
?>

