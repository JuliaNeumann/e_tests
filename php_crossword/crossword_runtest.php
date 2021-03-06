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

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	if (isset($_POST['selected_test_id'])) {
		$test_id = $_POST['selected_test_id'];
	} //if
	else if (isset($_GET['selected_test_id'])) {
		$test_id = $_GET['selected_test_id'];
	} //else if
	else {
		dieIncorrectAccess();
	} //else

	$db_con = new Db_Connection();
	$test_data = $db_con->selectEntries(false, 'tests', array("where" => "test_ID = " . $test_id))[0];
	$test_level = $db_con->selectEntries(true, 'test_levels', array("where" => "level_ID = " . $test_data['test_level_ID']))[0];

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
?>
	<header>
		"<?php echo $test_data['test_name']; ?>" (Level: <?php echo $test_level['level_label']; ?>)
	</header>
	<section id="test_container">
		<div class="instructions">
			Click on the questions below (in the 'ACROSS' and 'DOWN' lists) to enter their solutions into the crossword! After filling in all the words, click "Check" to see if you were right.
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