<?php 
session_start();
require_once('lib/Sprockets/Sprocket.php');

$filePath = preg_replace('/\?.*/', '', $_SERVER['REQUEST_URI']);
$sprocket = new Sprockets_Sprocket($filePath, array(
	'baseUri' => 'lib/Sprockets',
	'debugMode' => true
)); 

// change base folder based on extension
switch ($sprocket->fileExt) 
{
	case 'css':
		$sprocket->setContentType('text/css')->setBaseFolder('/css');
		break;
	
	default: case 'js':
		$sprocket->setBaseFolder($_SERVER['DOCUMENT_ROOT'] . '/js');
		break;
}
$sprocket->render();
?>