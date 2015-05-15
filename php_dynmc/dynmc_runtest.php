<?php 
/*************************************************************************************************************************
RUNNING A DYNAMIC MULTIPLE-CHOICE TEST
- presents user with dynamic multiple-choice test for solving
*************************************************************************************************************************/

	//Page Variables:
	$title = 'Dynamic Multiple-Choice';
	$header_text = 'Run Dynamic Multiple-Choice Test';
	$section = 'dynmc';
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
	<section>
		<div class="instructions"></div>
		<div id="questions">
			<em>Loading...</em>
		</div>
		<div class="right_aligned">
			<input type="submit" id="ready_button" class="submit_button" value="Check" disabled>
			<input type="submit" id="next_question" class="submit_button hidden" value="Next Question">
			<input type="submit" id="show_result" class="submit_button hidden" value="Show Result">
			<input type="submit" id="reset" class="submit_button hidden" value="Reset">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>