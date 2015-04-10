<?php
/*************************************************************************************************************************
CONFIGURATION FILE
- sets constants & classes needed by files
*************************************************************************************************************************/
	
	//CONSTANTS:
	define('ROOT_PATH', 'http://localhost/e_tests/');
	define('INCLUDE_PATH', $_SERVER['DOCUMENT_ROOT'] . '/e_tests/');

	//CLASS DECLARATIONS & LIBRARIES:
	require_once INCLUDE_PATH . 'php_support/class_db_connection.php';
	require_once INCLUDE_PATH . 'php_support/general_functions.php';

	//SESSION HANDLING (add at the end of development!!):
?>