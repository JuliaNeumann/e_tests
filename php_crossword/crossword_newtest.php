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
		<div id="instructions">
			Enter your questions and answers (one word each!) below. Click on added questions and answers to edit them.<br>
			When you have entered all questions and answers, press the button and they will be arranged into a crossword puzzle for you.
		</div>
		<div class="css_table" id="questions_table">
			<div class="css_tr table_header">
				<div class="css_td" id="header_question">Question</div>
				<div class="css_td" id="header_answer">Answer</div>
			</div>
			<div class="css_tr" id="new_question_row">
				<div class="css_td"><input type="text" class="table_inputfield" name="new_question" id="new_question" value="New Question..."></div>
				<div class="css_td"><input type="text" class="table_inputfield" name="new_answer" id="new_answer" value="New Answer..."></div>
			</div>
			<div class="css_tr">
				<div class="css_td"><input type="submit" class="submit_button" name="add_question" id="add_question" value="Add Question"></div>
			</div>
		</div>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="create_crossword" id="create_crossword" value="Create Crossword" disabled>
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>
