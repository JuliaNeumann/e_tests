<?php
/*************************************************************************************************************************
EDITING DYNAMIC MC TEST
- presents user with a dynamic MC test for editing
*************************************************************************************************************************/
	
	//Page Variables:
	$title = 'Dynamic Multiple-Choice';
	$header_text = 'Edit Dynamic Multiple-Choice Test';
	$section = 'dynmc';
	$action = 'edit';

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	if (isset($_POST['selected_test_id'])) {
		$test_id = $_POST['selected_test_id'];
	} //if
	else {
		dieIncorrectAccess();
	} //else

	$db_con = new Db_Connection();
	$test_data = $db_con->selectEntries(true, 'tests', array("where" => "test_ID = " . $test_id))[0];

	$db_con = new Db_Connection();
	$questions = $db_con->selectEntries(true, 'dynmc_questions', array("order" => "question_text"));

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
	
	require_once INCLUDE_PATH . 'php_page_elements/general_testinfo_form.php'; 
?>
	</form>
	<header id="test_container_header">
		"<span id="test_name_container"><?php echo $test_data['test_name']; ?></span>"
	</header>
	<section id="test_container">
		<div class="instructions">
			If you want to change questions, just click on the text that you want to edit. 
			You can delete questions and incorrect answers by clicking on the 'X' signs that appear when you hover over them.
		</div>
		<div id="questions"><p><em>Loading ...</em></p></div>
		<input type="submit" class="submit_button" name="questions_from_db" id="show_questions_from_db" value="Add Questions from Database...">
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="save_test" id="save_test" value="Save Test">
		</div>
	</section>
		<header class="db_questions hidden">
		Questions in the Database
	</header>
	<section class="db_questions hidden">
<?php 
		if (sizeof($questions) > 0) {

?>
		<select name="select_question_from_db" id="select_question_from_db" size="5">
<?php
		for ($i = 0; $i < sizeof($questions); $i++) { 
?>
			<option value="<?php echo $questions[$i]['question_ID']; ?>"><?php echo $questions[$i]['question_text']; ?> (ID: <?php echo $questions[$i]['question_ID']; ?>, created: <?php echo $questions[$i]['question_created']; ?>)</option>
<?php
		}
?>
		</select>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="add_question_from_db" id="add_question_from_db" value="Add Question to Test" disabled>
		</div>
<?php
		} //if
		else {
?>
			<em>No questions in database.</em>
<?php
		}
?>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>