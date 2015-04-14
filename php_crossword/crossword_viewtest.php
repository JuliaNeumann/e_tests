<?php 
/*************************************************************************************************************************
VIEWING A CROSSWORD TEST
- presents user with solved and unsolved view of a crossword test
*************************************************************************************************************************/

	//Page Variables:
	$title = 'Crossword';
	$header_text = 'View Crossword Test';
	$section = 'crossword';
	$action = 'view';

	if (isset($_GET['test_id'])) {
		$test_id = $_GET['test_id'];
	} //if
	else if (isset($_POST['selected_test_id'])) {
		$test_id = $_POST['selected_test_id'];
	} //else if
	else {
		die('This page has not been accessed in the correct way!');
	} //else

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	$db_con = new Db_Connection();
	$test_data = $db_con->selectEntries(true, 'tests', array("where" => "test_ID = " . $test_id))[0];

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';

	if (isset($_GET['test_id'])) {
?>
		<header>
			Test Saved Successfully!
		</header>
		<section>
			Your test has been saved to the database. You see it displayed below.
		</section>
<?php
	} //if
?>
	<header>
		"<?php echo $test_data['test_name']; ?>"
	</header>
	<section id="test_container">
		<div class="right_aligned">
			<input type="submit" id="show_solved" class="submit_button" value="Show Solved Test">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>