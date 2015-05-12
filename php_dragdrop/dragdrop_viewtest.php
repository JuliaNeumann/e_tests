<?php 
/*************************************************************************************************************************
VIEWING A DRAG & DROP TEST
- presents user with solved and unsolved view of a drag&drop test
*************************************************************************************************************************/

	//Page Variables:
	$title = 'Drag &amp; Drop';
	$header_text = 'View Drag &amp; Drop Test';
	$section = 'dragdrop';
	$action = 'view';

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	if (isset($_GET['test_id'])) {
		$test_id = $_GET['test_id'];
	} //if
	else if (isset($_POST['selected_test_id'])) {
		$test_id = $_POST['selected_test_id'];
	} //else if
	else {
		dieIncorrectAccess();
	} //else

	$db_con = new Db_Connection();
	$test_data = $db_con->selectEntries(false, 'tests', array("where" => "test_ID = " . $test_id))[0];
	$test_level = $db_con->selectEntries(true, 'test_levels', array("where" => "level_ID = " . $test_data['test_level_ID']))[0];

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';

	if (isset($_GET['test_id'])) {
?>
		<div class="notification">
			<header>
				Test Saved Successfully!
				<div class="delete_notification_button font-color-4">X</div>
			</header>
			<section>
				Your test has been saved to the database. You see it displayed below.
			</section>
		</div>
<?php
	} //if
?>
	<header>
		"<?php echo $test_data['test_name']; ?>" (Level: <?php echo $test_level['level_label']; ?>)
	</header>
	<section id="test_container">
		<div class="instructions">
			Use the buttons below to change between the unsolved and the solved view of the test, and to print or save images of your test. 
			To try a fully functional version, choose the "Run Test" option on the start page.
		</div><br>
		<div id="dragdrop_container">
			<div id="items_container">
				<em>Loading...</em>
			</div>
			<div class="css_table" id="container_table">
				<div class="css_tr" id="container_row"></div>
			</div>
		</div>
		<div class="right_aligned">
			<input type="submit" id="show_solved" class="submit_button" value="Show Solved Test">
			<input type="submit" id="download_as_png" class="submit_button" value="Download as PNG">
			<input type="submit" id="download_as_jpeg" class="submit_button" value="Download as JPEG">
			<input type="submit" id="print_test" class="submit_button" value="Print Test">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>