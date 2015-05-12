<?php 
/*************************************************************************************************************************
MANAGING DYNAMIC MULTIPLE-CHOICE TESTS
- handling the different AJAX requests made by the dynmc test pages
*************************************************************************************************************************/

require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';
session_start();

/************************************************************************************************************************/

	function insertNewQuestion($my_question, $my_test_id) {
	//inserts a question as a new question belonging to the given test
	//params: $my_question = ass. array, $my_test_id = INT
		global $db_con;

		$question_id = $db_con->insertEntry(false, 'dynmc_questions', array("question_text" => $my_question['question_text'], 
																			"question_correct_answer" => $my_question['correct_answer']));
		$db_con->insertEntry(false, 'dynmc_lookup', array(	"lookup_question_ID" => $question_id,
															"lookup_test_ID" => $my_test_id));
		for ($j = 0; $j < sizeof($my_question['incorrect_answers']); $j++) { 
			$db_con->insertEntry(false, 'dynmc_incorrect', array("incorrect_text" => $my_question['incorrect_answers'][$j],
																"incorrect_question_ID" => $question_id));
		} //for
	} //function insertAsNewQuestion


	function deleteQuestion($my_question_id, $my_test_id) {
	//deletes question from a test, checks if exists in other tests -> if so, only deletes lookup
		global $db_con;

		$question_check = $db_con->selectEntries(false, 'dynmc_lookup', array("where" => "lookup_question_ID = " . $my_question_id,
																							"and" => "lookup_test_ID <> " . $my_test_id));
		if (sizeof($question_check) == 0) { //question only belongs to this test -> delete question (else only lookup)
			$db_con->deleteEntries(false, 'dynmc_questions', array("where" => "question_ID = " . $my_question_id));
			$db_con->deleteEntries(false, 'dynmc_incorrect', array("where" => "incorrect_question_ID = " . $my_question_id));
		} //if
		$db_con->deleteEntries(false, 'dynmc_lookup', array("where" => "lookup_question_ID = " . $my_question_id,
															"and" => "lookup_test_ID = " . $my_test_id));
	} //function deleteQuestion

/************************************************************************************************************************/

//SAVING A NEW OR EDITED DYNMC TEST:
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
			//insert, update etc. the questions:
			for ($i = 0; $i < $test_data['questions']['counter']; $i++) { 
				$question = $test_data['questions']['objects'][$i];
				if ($question['deleted'] == 'false') {
					//NEW QUESTION:
					if ($question['newly_created'] == 'true') {
						insertNewQuestion($question, $test_id);
					} //if
					//QUESTION ADDED FROM DB:
					else if ($question['added_from_db'] == 'true') {
						if ($question['edited'] == 'false') { //question added unchanged -> only lookup necessary
							$db_con->insertEntry(false, 'dynmc_lookup', array(	"lookup_question_ID" => $question['db_id'],
																				"lookup_test_ID" => $test_id));
						} //if
						else { //question has been edited after being added from DB -> insert as a new question
							insertNewQuestion($question, $test_id);
						} //else
					}  //else if
					//EDITED QUESTION:
					else if ($question['edited'] == 'true') {
						$question_check = $db_con->selectEntries(false, 'dynmc_lookup', array("where" => "lookup_question_ID = " . $question['db_id'],
																								"and" => "lookup_test_ID <> " . $test_id));
						if (sizeof($question_check) > 0) { //question also belongs to another test -> delete lookup and insert as new question
							$db_con->deleteEntries(false, 'dynmc_lookup', array("where" => "lookup_question_ID = " . $question['db_id'],
																				"and" => "lookup_test_ID = " . $test_id));
							insertNewQuestion($question, $test_id);
						} //if
						else { //question only belongs to this test -> update
							$db_con->updateEntry(false, 
												'dynmc_questions', 
												array("question_text" => $question['question_text'], "question_correct_answer" => $question['correct_answer']),
												array("where" => "question_ID = " . $question['db_id']));
							$db_con->deleteEntries(false, 'dynmc_incorrect', array("where" => "incorrect_question_ID = " . $question['db_id']));
							for ($j = 0; $j < sizeof($question['incorrect_answers']); $j++) { 
								$db_con->insertEntry(false, 'dynmc_incorrect', array("incorrect_text" => $question['incorrect_answers'][$j],
																					"incorrect_question_ID" => $question['db_id']));
							} //for
						} //else
					} //else if
				} //if (not deleted)
				else { //deleted question
					if ($question['newly_created'] == 'false' && $question['added_from_db'] == 'false') {
						//DELETED QUESTION:
						deleteQuestion($question['db_id'], $test_id);
					} //if
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
		
		$questions = [];
		$timestamp = 'test_' . time(); //used to identify this test's information in the session in run mode (in case several tests are run at the same time)
		$_SESSION[$timestamp] = array();

		//get questions:
		$lookups = $db_con->selectEntries(false, 'dynmc_lookup', array("where" => "lookup_test_ID = " . $_GET['test_id']));
		for ($i = 0; $i < sizeof($lookups); $i++) {
			$question_ID = $lookups[$i]['lookup_question_ID'];
			$questions[$i]['question_ID'] = $question_ID;
			$question_data = $db_con->selectEntries(false, 'dynmc_questions', array("where" => "question_ID = " . $question_ID));
			$questions[$i]['question_text'] = $question_data[0]['question_text'];
			$_SESSION[$timestamp]['options'][$question_ID] = array();
			if ($_GET['solution'] == 'true') {
				$questions[$i]['correct_answer'] = $question_data[0]['question_correct_answer'];
			} //if
			else { //retrieve without solutions (so they are not accessible from browser when test is performed)
				$_SESSION[$timestamp]['options'][$question_ID][] = array(1, $question_data[0]['question_correct_answer']);
			} //else
			$incorrect_answers = $db_con->selectEntries(false, 'dynmc_incorrect', array("where" => "incorrect_question_ID = " . $question_ID));
			foreach ($incorrect_answers as $incorrect) {
				if ($_GET['solution'] == 'true') {
					$questions[$i]['incorrect_answers'][] = $incorrect['incorrect_text'];
				} //if
				else {
					$_SESSION[$timestamp]['options'][$question_ID][] = array(0, $incorrect['incorrect_text']);
				}
			} //foreach
			if ($_GET['solution'] != 'true') {
				shuffle($_SESSION[$timestamp]['options'][$question_ID]);
			} //if
		} //foreach

		if ($_GET['solution'] != 'true') { //randomize all questions for run mode
			shuffle($questions);
			$test_data['timestamp'] = $timestamp;
		} //if

		$test_data["questions"] = $questions;
		$test_data["db_error"] .= $db_con->getErrorMessage();
		print json_encode($test_data);
		$db_con->closeConnection();

	} //else if

/*************************************************************************************************************************/

//RETRIEVING QUESTION FROM DB:
	else if (isset($_GET['question_id'])) {
		$question_ID = $_GET['question_id'];

		$db_con = new Db_Connection();
		$question_data = $db_con->selectEntries(false, 'dynmc_questions', array("where" => "question_ID = " . $question_ID))[0];
		$incorrect_answers = $db_con->selectEntries(true, 'dynmc_incorrect', array("where" => "incorrect_question_ID = " . $question_ID));
		foreach ($incorrect_answers as $incorrect) {
			$question_data['incorrect_answers'][] = $incorrect['incorrect_text'];
		} //foreach
		
		$question_data["db_error"] = $db_con->getErrorMessage();
		print json_encode($question_data);

	} //else if

/*************************************************************************************************************************/

//DELETING TEST DATA:

	else if (isset($_POST['delete_test'])) {
		$test_id = $_POST['selected_test_id'];
		$db_con = new Db_Connection();
		//delete questions:
		$lookups = $db_con->selectEntries(false, 'dynmc_lookup', array("where" => "lookup_test_ID = " . $test_id));
		for ($i = 0; $i < sizeof($lookups); $i++) { 
			deleteQuestion($lookups[$i]['lookup_question_ID'], $test_id);
		} //for

		$db_con->deleteEntries(true, 'tests', array("where" => "test_ID = " . $test_id));

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
	
//GETTING ANSWER OPTION:
	else if (isset($_GET['new_option'])) {
		$timestamp = $_GET['timestamp'];
		if (sizeof($_SESSION[$timestamp]['options'][$_GET['question_ID']]) > 0) {
			$_SESSION[$timestamp]['current_option'] = array_shift($_SESSION[$timestamp]['options'][$_GET['question_ID']]);
			print $_SESSION[$timestamp]['current_option'][1];
		} //if
	} //else if

/*************************************************************************************************************************/
	
//CHECKING SUBMITTED ANSWER OPTION:
	else if (isset($_GET['user_answer'])){
		$timestamp = $_GET['timestamp'];
		$question_ID = $_GET['question_ID'];
		$feedback = array();
		if ($_SESSION[$timestamp]['current_option'][0] == 1) { //current option is the correct answer
			$feedback['answer_option'] = '1';
			$feedback['solved_options'] = $_SESSION[$timestamp]['options'][$question_ID]; //send rest of answer options to display
		} //if
		else {
			$feedback['answer_option'] = '0';
			if ($_GET['user_answer'] == '1') { //user has provided wrong answer
				$feedback['solved_options'] = $_SESSION[$timestamp]['options'][$question_ID]; //send rest of answer options to display
			} //if
		} //else
		print json_encode($feedback);
	} //else if

/*************************************************************************************************************************/

	else {
		dieIncorrectAccess();
	} //else
	
?>