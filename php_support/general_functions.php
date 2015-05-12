<?php
/*************************************************************************************************************************
PHP GENERAL FUNCTIONS
- provides functions needed by all types of tests
*************************************************************************************************************************/

	function createNewTestGeneral($my_test_data) {
	//creates a new entry in the table 'tests', returns test ID on success
	//params: my_test_data = array(); (associative array with keys: test_type_string, test_name, test_level)
		if (isset($my_test_data['test_type_string']) && isset($my_test_data['test_name']) && isset($my_test_data['test_level'])) {
			$db_con = new Db_Connection();
			$test_type = $db_con->selectEntries(false, 'test_types', array("where" => "type_string = '" . $my_test_data['test_type_string'] . "'"));
			$test_id = $db_con->insertEntry(true, 'tests', array("test_name" => $my_test_data['test_name'],
																"test_type_ID" => $test_type[0]['type_ID'],
																"test_level_ID" => $my_test_data['test_level']));
			if ($db_con->getErrorMessage() !== '') { //some error occurred during database queries
				return $db_con->getErrorMessage();
			} //if
			else {
				return $test_id;
			} //else
		} //if
		else {
			return 'The function createNewTestGeneral has not been provided with the correct parameters!';
		} //else
	} //function createNewTestGeneral

/*************************************************************************************************************************/

	function dieIncorrectAccess() {
	//causes script to die, printing message about incorrect access
		die('This page has not been accessed in the correct way! Click <a href="' . ROOT_PATH . 'index.php">here</a> to go to the start page of the E-Test Editor.');
	} //function dieIncorrectAccess

/*************************************************************************************************************************/

	function printAttr($my_attr, $my_value) {
	//if value is set, prints HTML attribute with that value
		if (isset($my_value) && ($my_value != '')) {
			echo ' ' . $my_attr . '="' . $my_value . '"';
		} //if
	} //function printAttr

/*************************************************************************************************************************/
	
	function updateTestGeneral($my_test_data) {
	//updates entry in table 'tests', returns true on success
	//params: my_test_data = array(); (associative array with keys: test_type_string, test_name, test_level, test_ID)
		if (isset($my_test_data['test_type_string']) && isset($my_test_data['test_name']) && isset($my_test_data['test_level']) && isset($my_test_data['test_ID'])) {
			$db_con = new Db_Connection();
			$test_id = $db_con->updateEntry(true, 
											'tests', 
											array("test_name" => $my_test_data['test_name'],
												"test_level_ID" => $my_test_data['test_level']), 
											array("where" => 'test_id = ' . $my_test_data['test_ID']));
			if ($db_con->getErrorMessage() !== '') { //some error occurred during database queries
				return false;
			} //if
			else {
				return true;
			} //else
		} //if
		else {
			return 'The function updateTestGeneral has not been provided with the correct parameters!';
		} //else
	} //function updateTestGeneral

?>