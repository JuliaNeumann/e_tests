<?php
/*************************************************************************************************************************
EDITING A DRAG & DROP TEST
- presents user with form for modification of an existing drag & drop test
*************************************************************************************************************************/
	//Page Variables:
	$title = 'Drag &amp; Drop';
	$header_text = 'Edit Drag &amp; Drop Test';
	$section = 'dragdrop';
	$action = 'edit';

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
	
	require_once INCLUDE_PATH . 'php_page_elements/general_testinfo_form.php'; 
?>
	<header>
		"<span id="test_name_container"><?php echo $test_data['test_name']; ?></span>"
	</header>
	<section id="test_container">
		<div id="instructions">
			<em>Click on the text inside the containers and items to edit them. Drag the items into the correct containers.</em>
			<div class="right_aligned">
				<input type="submit" class="submit_button" id="add_item" value="Add Item">
				<input type="submit" class="submit_button" id="add_container" value="Add Container">
			</div>
		</div>
		<div id="items_container"></div>
		<div class="css_table" id="container_table">
			<div class="css_tr" id="container_row"></div>
		</div>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="save_test" id="save_test" value="Save Test">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>