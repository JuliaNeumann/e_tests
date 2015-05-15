<?php
/*************************************************************************************************************************
CREATING A NEW CROSSWORD TEST
- presents user with form for creation of new crossword test
*************************************************************************************************************************/
	
	//Page Variables:
	$title = 'Crossword';
	$header_text = 'New Crossword Test';
	$section = 'crossword';
	$action = 'new';

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
	
	require_once INCLUDE_PATH . 'php_page_elements/general_testinfo_form.php'; 
?>
	<header id="test_container_header">
		"<span id="test_name_container">[NEW TEST]</span>"
	</header>
	<section id="test_container">
		<div class="instructions">
			Enter your questions and answers (one word) below. Click on added questions and answers to edit them.<br>
			When you have entered all questions and answers, press 'Create Crossword'. Then click 'Save Test' to store the test in the database.
		</div>
		<table id="questions_table">
			<thead>
				<th id="header_question">Question</th>
				<th id="header_answer">Answer</th>
			</thead>
			<tbody id="questions_container">
				<tr><!-- force Firefox to display correctly -->
					<td colspan="2"></td>
				</tr>
			</tbody>
			<tbody id="new_question_tbody">
				<tr id="new_question_row">
					<td><input type="text" class="table_inputfield" name="new_question" id="new_question" placeholder="New Question..."></td>
					<td><input type="text" class="table_inputfield" name="new_answer" id="new_answer" placeholder="New Answer..." maxlength="25"></td>
				</tr>
				<tr>
					<td colspan="2"><input type="submit" class="submit_button" name="add_question" id="add_question" value="Add this Question"></td>
				</tr>
			</tbody>
		</table>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="create_crossword" id="create_crossword" value="Create Crossword" disabled>
			<input type="submit" class="submit_button hidden" name="save_test" id="save_test" value="Save Test">
		</div>
		<div id="crossword_container"></div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>
