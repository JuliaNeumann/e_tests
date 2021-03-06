<?php
/*************************************************************************************************************************
GENERAL MANAGE PAGE FOR INTERACTION WITH INTERFACE FORMS
- receives posted values, re-directs to correct pages
*************************************************************************************************************************/

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';
	$error = false;
	$error_msg = '';

/*************************************************************************************************************************/

//REDIRECTION FROM INDEX PAGE:
	if (isset($_POST['test_type_button'])) {
		switch ($_POST['test_type_button']) {
			case 'new_idea':
				include INCLUDE_PATH . 'php_support/contact_form.php';
				break;
			default:
				include INCLUDE_PATH . 'php_' . $_POST['test_type_button'] . '/' . $_POST['test_type_button'] . '_newtest.php';
				break;
		} //switch
		die();
	} //if

	else if (isset($_POST['edit_test'])) {
		if (isset($_POST['selected_type']) && isset($_POST['selected_test_id'])) {
			include INCLUDE_PATH . 'php_' . $_POST['selected_type'] . '/' . $_POST['selected_type'] . '_edittest.php';
		} //if
		else {
			$error = true; 
			$error_msg = 'Please select the test you want to edit!';
			include INCLUDE_PATH . 'index.php';
		} //else
		die();
	} //else if

	else if (isset($_POST['delete_test'])) {
		if (isset($_POST['selected_type']) && isset($_POST['selected_test_id'])) {
			include INCLUDE_PATH . 'php_' . $_POST['selected_type'] . '/' . $_POST['selected_type'] . '_managetests.php';
		} //if
		else {
			$error = true; 
			$error_msg = 'Please select the test you want to delete!';
			include INCLUDE_PATH . 'index.php';
		} //else
		die();
	} //else if

	else if (isset($_POST['view_test'])) {
		if (isset($_POST['selected_type']) && isset($_POST['selected_test_id'])) {
			include INCLUDE_PATH . 'php_' . $_POST['selected_type'] . '/' . $_POST['selected_type'] . '_viewtest.php';
		} //if
		else {
			$error = true; 
			$error_msg = 'Please select the test you want to view!';
			include INCLUDE_PATH . 'index.php';
		} //else
		die();
	} //else if

	else if (isset($_POST['run_test'])) {
		if (isset($_POST['selected_type']) && isset($_POST['selected_test_id'])) {
			include INCLUDE_PATH . 'php_' . $_POST['selected_type'] . '/' . $_POST['selected_type'] . '_runtest.php';
		} //if
		else {
			$error = true; 
			$error_msg = 'Please select the test you want to run!';
			include INCLUDE_PATH . 'index.php';
		} //else
		die();
	} //else if

/*************************************************************************************************************************/

//AJAX REQUEST FOR CHECKING TEST NAME:
	else if (isset($_GET['get_test_names'])) {
		$db_con = new Db_Connection();
		$test_types = array('dynmc' => 1, 'dragdrop' => 2, 'crossword' => 3);
		//get all names of tests of same type and different ID (so that no two tests of same type with same name will exist)
		$tests = $db_con->selectEntries(true, 'tests', array("select" => "test_name", 
															"where" => "test_ID <> " . $_GET['test_ID'],
															"and" => "test_type_ID = " . $test_types[$_GET['test_type']]));
		foreach ($tests as $test) {
			$test_names[] = html_entity_decode($test['test_name'], ENT_NOQUOTES|ENT_HTML5, "UTF-8"); //decode HTML entities (for making comparison to input in JS possible)
		} //foreach
		print json_encode($test_names);
	} //else if

/*************************************************************************************************************************/

	else {
		dieIncorrectAccess();
	} //else
	
?>