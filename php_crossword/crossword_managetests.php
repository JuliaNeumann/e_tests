<?php 
/*************************************************************************************************************************
MANAGING CROSSWORD TESTS
- handling the different AJAX requests made by the crossword test pages
*************************************************************************************************************************/

require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

/*************************************************************************************************************************/

//SAVING A NEW OR EDITED CROSSWORD TEST:

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
			//GRID OF NEW TEST:
			if ($_POST['action'] == 'new') {
				$db_con->insertEntry(false, 'crossword_grid', array("grid_test_ID" => $test_id, 
																	"grid_x" => $test_data['grid']['x'],
																	"grid_y" => $test_data['grid']['y']));
			} //if
			//GRID OF EXISTING TEST HAS BEEN CHANGED:
			else if ($test_data['grid']['edited'] == 'true') {
				$db_con->updateEntry(false, 
									'crossword_grid', 
									array("grid_x" => $test_data['grid']['x'], "grid_y" => $test_data['grid']['y']),
									array("where" => "grid_test_ID = " . $test_id));
			} //else if
			for ($i = 0; $i < $test_data['questions']['counter']; $i++) { 
				$question = $test_data['questions']['objects'][$i];
				if ($question['deleted'] == 'false' && $question['number'] != 'null') { //word has not been deleted and has been placed
					//NEW QUESTION:
					if ($question['newly_created'] == 'true') {
						$question_id = $db_con->insertEntry(false, 'crossword_questions', array("question_test_ID" => $test_id, 
																								"question_text" => $question['question_text'],
																								"question_correct_answer" => $question['correct_answer'],
																								"question_position_x" => $question['position']['x'],
																								"question_position_y" => $question['position']['y'],
																								"question_orientation" => $question['position']['orientation'],
																								"question_number" => $question['number']));
					} //if
					//OLD EDITED QUESTION (with only question text edited):
					else if ($question['edited'] == 'true') {
						$db_con->updateEntry(false, 
											'crossword_questions', 
											array("question_text" => $question['question_text'],
												"question_correct_answer" => $question['correct_answer'],
												"question_position_x" => $question['position']['x'],
												"question_position_y" => $question['position']['y'],
												"question_orientation" => $question['position']['orientation'],
												"question_number" => $question['number']),
											array("where" => "question_ID = " . $question['db_id']));
					} //else if
				} //if
				//OLD DELETED QUESTION:
				else if ($question['db_id'] != 'null'){
					$db_con->deleteEntries(false, 'crossword_questions', array("where" => "question_ID = " . $question['db_id']));
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
		$test_data["questions"] = $db_con->selectEntries(false, 'crossword_questions', array("where" => "question_test_ID = " . $_GET['test_id']));
		$test_data["grid"] = $db_con->selectEntries(true, 'crossword_grid', array("where" => "grid_test_ID = " . $_GET['test_id']))[0];
		$test_data["db_error"] .= $db_con->getErrorMessage();
		print json_encode($test_data);
		
	} //else if
?>