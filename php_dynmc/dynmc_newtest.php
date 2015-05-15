<?php
/*************************************************************************************************************************
CREATING A NEW DYNAMIC MC TEST
- presents user with form for creation of new dynamic MC test
*************************************************************************************************************************/
	
	//Page Variables:
	$title = 'Dynamic Multiple-Choice';
	$header_text = 'New Dynamic Multiple-Choice Test';
	$section = 'dynmc';
	$action = 'new';

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	$db_con = new Db_Connection();
	$questions = $db_con->selectEntries(true, 'dynmc_questions', array("order" => "question_text"));

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
	
	require_once INCLUDE_PATH . 'php_page_elements/general_testinfo_form.php'; 
?>
	<header id="test_container_header">
		"<span id="test_name_container">[NEW TEST]</span>"
	</header>
	<section id="test_container">
		<div class="instructions">
			Add new questions by filling the form fields below, or by selecting them from the database.
			If you want to change questions that you have added already, just click on the text that you want to edit. 
			You can delete questions and incorrect answers by clicking on the 'X' signs that appear when you hover over them.
		</div>
		<div id="questions"></div>
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