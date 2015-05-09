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
		"<?php echo $test_data['test_name']; ?>"
	</header>
	<section id="test_container">
		<div class="instructions">
			Use the button below to change between the unsolved and the solved view of the test. 
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
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>