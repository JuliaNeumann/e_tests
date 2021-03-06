<?php
/*************************************************************************************************************************
RUN A DRAG & DROP TEST
- presents an existing drag & drop test for doing the test
*************************************************************************************************************************/
	//Page Variables:
	$title = 'Drag &amp; Drop';
	$header_text = 'Run Drag &amp; Drop Test';
	$section = 'dragdrop';
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
	<section id="choose_option">
		<div class="instructions">
			Choose how you want to run the test:
		</div>
		<div class="centered">
			<button class="submit_button" id="option_one">One item at a time</button>
			<button class="submit_button" id="option_all">All items at once</button>
		</div>
	</section>
	<section class="hidden" id="test_container">
		<div class="instructions">
			Drag the item(s) into the containers below and then click "Check" to see if you were right.
		</div><br>
		<p id="items_container">
			<em>Loading...</em>
		</p>
		<div id="containers_container"></div>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="check_test" id="check_test" value="Check" disabled>
			<input type="submit" id="continue_button" name="continue_button" class="submit_button hidden" value="Continue">
			<input type="submit" id="reset" name="reset" class="submit_button hidden" value="Reset">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>