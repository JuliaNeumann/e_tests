<?php 
/*************************************************************************************************************************
MANAGING DRAG & DROP TESTS
- handling the different AJAX requests made by the drag&drop test pages
*************************************************************************************************************************/

require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

/*************************************************************************************************************************/

//SAVING A NEW OR EDITED DRAG&DROP TEST:

	if (isset($_POST['save_test'])) { //AJAX request for saving a new test

		//prepare general test info:
		if ($_POST['action'] == 'new') {
			$test_id = createNewTestGeneral($_POST['save_test']);
		} //if
		else {
			$test_id = $_POST['save_test']['test_ID'];
			updateTestGeneral($_POST['save_test']);
		} //else
		
		$db_con = new Db_Connection();
		$test_data = $_POST['test_data'];
		$error = '';

		if (is_numeric($test_id)) { //test has been created successfully, or test ID for update is there
			//insert containers:
			$db_containers = array(); //will hold mapping of object ID to database ID (needed for insertion of solutions)
			for ($i = 0; $i < $test_data['containers']['counter']; $i++) { 
				$container = $test_data['containers']['objects'][$i];
				$db_containers[$i] = $container['db_id']; //mapping to current ID (will hold null if new container, updated below)
				if ($container['deleted'] == 'false') {
					//NEW CONTAINER:
					if ($container['newly_created'] == 'true') {
						$container_id = $db_con->insertEntry(false, 'dragdrop_containers', array("container_test_ID" => $test_id, 
																							"container_text" => $container['container_text']));
						$db_containers[$i] = $container_id;
					} //if
					//OLD EDITED CONTAINER:
					else if ($container['edited'] == 'true') {
						$db_con->updateEntry(false, 
											'dragdrop_containers', 
											array("container_text" => $container['container_text']),
											array("where" => "container_ID = " . $container['db_id']));
					} //else if
				} //if
				//OLD DELETED CONTAINER:
				else if ($container['newly_created'] == 'false'){
					$db_con->deleteEntries(false, 'dragdrop_containers', array("where" => "container_ID = " . $container['db_id']));
				} //else
			} //for
			//insert items:
			for ($i = 0; $i < $test_data['items']['counter']; $i++) { 
				$item = $test_data['items']['objects'][$i];
				if ($item['deleted'] == 'false') {
					$container_obj_id = $test_data['solutions'][$i];
					//NEW ITEM:
					if ($item['newly_created'] == 'true') {
						$db_con->insertEntry(false, 'dragdrop_items', array("item_test_ID" => $test_id, 
																		"item_text" => $item['item_text'],
																		"item_container_ID" => $db_containers[$container_obj_id]));
					} //if
					else if ($item['edited'] == 'true') {
						$db_con->updateEntry(false, 
											'dragdrop_items', 
											array("item_text" => $item['item_text'], 
												"item_container_ID" => $db_containers[$container_obj_id]),
											array("where" => "item_ID = " . $item['db_id']));
					} //else if
				} //if (item not deleted)
				//OLD DELETED ITEM:
				else if ($item['newly_created'] == 'false'){
					$db_con->deleteEntries(false, 'dragdrop_items', array("where" => "item_ID = " . $item['db_id']));
				} //else
			} //for
			$error = $db_con->getErrorMessage();
		} //if
		else {
			$error = $test_id;
		} //else
	
		if ($error !== '') { //some error occurred during database queries
			print $error;
		} //if
		else {
			print $test_id;
		}
		$db_con->closeConnection();
	} //if

/*************************************************************************************************************************/

//RETRIEVING EXISTING TEST DATA:

	else if (isset($_GET['test_id'])) {

		$db_con = new Db_Connection();
		$test_data = array("db_error" => '');
		$test_data["test_name"] = $db_con->selectEntries(false, 'tests', array("where" => "test_ID = " . $_GET['test_id']))[0]['test_name'];
		//get items & containers:
		if ($_GET['solution'] == 'true') {
			$test_data["items"] = $db_con->selectEntries(false, 'dragdrop_items', array("where" => "item_test_ID = " . $_GET['test_id']));
		} //if
		else { //retrieve without solutions (so they are not accessible from browser when test is performed)
			$test_data["items"] = $db_con->selectEntries(false, 'dragdrop_items', array("select" => "item_ID, item_text", "where" => "item_test_ID = " . $_GET['test_id']));
		} //else 

		shuffle($test_data["items"]); //items should be in random order
		$test_data["containers"] = $db_con->selectEntries(true, 'dragdrop_containers', array("where" => "container_test_ID = " . $_GET['test_id']));
		$test_data["db_error"] .= $db_con->getErrorMessage();

		print json_encode($test_data);

	} //else if

/*************************************************************************************************************************/

//DELETING TEST DATA:

	else if (isset($_POST['delete_test'])) {
		$test_id = $_POST['selected_test_id'];
		$db_con = new Db_Connection();
		$db_con->deleteEntries(false, 'tests', array("where" => "test_ID = " . $test_id));
		$db_con->deleteEntries(false, 'dragdrop_items', array("where" => "item_test_ID = " . $test_id));
		$db_con->deleteEntries(true, 'dragdrop_containers', array("where" => "container_test_ID = " . $test_id));
		if ($db_con->getErrorMessage() !== '') {
			$error = true;
			$error_msg = 'The following error has occurred while deleting the test: ' . $db_con->getErrorMessage();
		} //if
		else {
			$deleted_successfully = true;
		} //else
		include INCLUDE_PATH . 'index.php';
	} //else if

/*************************************************************************************************************************/

//CHECK TEST SUBMISSION:

	else if (isset($_GET['check_test'])) {
		$temp_solution = $_GET['check_test'];
		$db_con = new Db_Connection();
		
		$test_items = $db_con->selectEntries(false, 'dragdrop_items', array("where" => "item_test_ID = " . $_GET['check_test_id']));

		$checked_items = array("correct" => 0);
		foreach ($test_items as $item) {
			if (isset($temp_solution[$item['item_ID']]) && ($item['item_container_ID'] == $temp_solution[$item['item_ID']])) {
				$checked_items[$item['item_ID']] = 1;
				$checked_items["correct"]++;
			}
			else {
				$checked_items[$item['item_ID']] = 0;
			}
		} //foreach

		print json_encode($checked_items);

	} //else if 
?>