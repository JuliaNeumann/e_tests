<?php
/*************************************************************************************************************************
EDITING A CROSSWORD TEST
- presents user with form for modification of an existing crossword test
*************************************************************************************************************************/
	//Page Variables:
	$title = 'Crossword';
	$header_text = 'Edit Crossword Test';
	$section = 'crossword';
	$action = 'edit';

	if (isset($_POST['selected_test_id'])) {
		$test_id = $_POST['selected_test_id'];
	} //if
	else {
		die('This page has not been accessed in the correct way!');
	} //else
	
	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	$db_con = new Db_Connection();
	$test_data = $db_con->selectEntries(true, 'tests', array("where" => "test_ID = " . $test_id))[0];

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
	
	require_once INCLUDE_PATH . 'php_page_elements/general_testinfo_form.php'; 
?>
	<header>
		"<span id="test_name_container"><?php echo $test_data['test_name']; ?></span>"
	</header>
	<section id="test_container">
		<div class="instructions">
			Click on questions and answers to edit them.<br> 
			When you have entered all questions and answers, press 'Create Crossword'.
		</div>
		<table id="questions_table">
			<thead>
				<th id="header_question">Question</th>
				<th id="header_answer">Answer</th>
			</thead>
			<tbody id="questions_container"></tbody>
			<tbody id="new_question_tbody">
				<tr id="new_question_row">
					<td><input type="text" class="table_inputfield" name="new_question" id="new_question" value="New Question..."></td>
					<td><input type="text" class="table_inputfield" name="new_answer" id="new_answer" value="New Answer..." maxlength="25"></td>
				</tr>
				<tr>
					<td colspan="2"><input type="submit" class="submit_button" name="add_question" id="add_question" value="Add this Question"></td>
				</tr>
			</tbody>
		</table>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="create_crossword" id="create_crossword" value="Create Crossword" disabled>
		</div>
		<div id="crossword_container"></div>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="save_test" id="save_test" value="Save Test">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>