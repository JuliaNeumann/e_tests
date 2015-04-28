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

	if (isset($_POST['selected_test_id'])) {
		$test_id = $_POST['selected_test_id'];
	} //else if
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
		<p class="instructions"></p>
		<div id="questions">
			<em>Loading...</em>
		</div>
		<div class="right_aligned">
			<input type="submit" id="ready_button" class="submit_button" value="Check" disabled>
			<input type="submit" id="next_question" class="submit_button hidden" value="Next Question">
			<input type="submit" id="show_result" class="submit_button hidden" value="Show Result">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>