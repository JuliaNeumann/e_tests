<?php
/*************************************************************************************************************************
RUN A CROSSWORD TEST
- presents an existing crossword test for doing the test
*************************************************************************************************************************/
	//Page Variables:
	$title = 'Crossword';
	$header_text = 'Run Crossword Test';
	$section = 'crossword';
	$action = 'run';

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
?>
	<header>
		"<?php echo $test_data['test_name']; ?>"
	</header>
	<section id="test_container">
		<div class="instructions">
			Click on the questions below to enter their solutions into the crossword! After filling in all the words, click "Check" to see if you were right.
		</div>
		<p id="crossword_container"><em>Loading...</em></p>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="check_test" id="check_test" value="Check" disabled>
			<input type="submit" id="reset" class="submit_button hidden" value="Reset">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>