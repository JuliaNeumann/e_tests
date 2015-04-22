<?php
/*************************************************************************************************************************
START PAGE OF APPLICATION
- presents user with possibilities to start creating / editing tests
*************************************************************************************************************************/
	
	//Page Variables:
	$title = 'Home';
	$header_text = 'E-Tests Editor';
	$section = 'index';
	$action = 'index';

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	$db_con = new Db_Connection();
	$test_types = $db_con->selectEntries(false, 'test_types', array("order" => "type_label"));
	$tests = $db_con->selectEntries(true, 'tests, test_types', array("where" => "tests.test_type_ID = test_types.type_ID", "order" => "tests.test_name"));

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
?>

<form name="select_test_form" id="select_test_form" action="<?php echo ROOT_PATH; ?>php_support/manage_tests.php" method="post">
<?php
	if (isset($error) && $error) {
?>
	<header>
		Error
	</header>
	<section>
		<div class="error_msg">
			<?php echo $error_msg; ?>
		</div>
	</section>
<?php
	} //if
	else if (isset($deleted_successfully) && $deleted_successfully) {
?>
	<header>
		Success
	</header>
	<section>
		<div>
			The test has been deleted from the database.
		</div>
	</section>
<?php
	} //if
?>	
	<header>
		Create a new test ...
	</header>
	<section class="section_without_padding">	
		<div id="type_button_container">
<?php
	foreach ($test_types as $type) {
?>
		<button type="submit" name="test_type_button" class="test_type_button border-theme-color bg-color-4" value="<?php echo $type['type_string']; ?>">
			<img src="<?php echo ROOT_PATH . $type['type_icon']; ?>" alt="<?php echo $type['type_label']; ?> Icon" width="80px" height="80px"><br>
			<div class="test_type_label"><?php echo $type['type_label']; ?></div>
		</button>
<?php
	} //foreach
?>
		<button type="submit" name="test_type_button" class="test_type_button border-theme-color bg-color-4" value="new_idea" id="new_idea_button">
			<img src="<?php echo ROOT_PATH; ?>images/contact_icon.png" alt="New Idea" width="80px" height="80px"><br>
			<div class="test_type_label">Idea for new format?</div>
		</button>
		</div>
<?php
	foreach ($test_types as $type) {
?>
		<div class="test_type_description" id="description_<?php echo $type['type_string']?>">
			<?php echo $type['type_description']; ?>
		</div>
<?php
	} //foreach
?>
		<div class="test_type_description" id="description_new_idea">
			You have a great idea for a new test format? This editor is built in a way that makes it easily expandable, so that new tests formats can be added at any time. 
			Click here to contact the author, and you might be able to find your dream format here soon.
		</div>
	</section>
	<header>
		... or work with an existing one:
	</header>
	<section>
		<table id="select_test_table" size="10">
			<col id="test_name_column">
			<col id="test_type_column">
			<col id="test_creation_column">
			<thead id="select_test_tablehead"><tr>
				<th class="header_cell sorted_up" id="test_name_header">Test Name<div id="sort_pic">&nbsp;&nbsp;<img id="arrow_up" src="<?php echo ROOT_PATH; ?>images/arrow_up.png"></div></th>
				<th class="header_cell" id="test_type_header">Type</th>
				<th class="header_cell" id="test_creation_header">Creation Date</th>
			</tr></thead>
			<tbody id="test_row_container">

				
<?php
			if (sizeof($tests) > 0) {
				foreach ($tests as $test) {
?>
					<tr class="test_row" data-test_id="<?php echo $test['test_ID']; ?>" data-type_string="<?php echo $test['type_string']; ?>">
						<td class="test_name"><?php echo $test['test_name']; ?></td>
						<td class="test_type"><?php echo $test['type_label']; ?></td>
						<td class="test_creation_date"><?php echo explode(" ", $test['test_creation_date'])[0]; ?></td>
					</tr>
<?php
				} //foreach
			} //if	
			else {
?>
					<tr>
						<td colspan="3"><em>No tests found in database. Add new tests using the buttons above.</em></td>
					</tr>
<?php
					} //else	
?>
			</tbody>
		</table>
		<div id="select_type_container">
			Show ...<br>
<?php
			foreach ($test_types as $type) {
?>
				<input type="checkbox" class="test_type_checkbox" name="select_test_type[]" id="test_type_checkbox_<?php echo $type['type_string']; ?>" value="<?php echo $type['type_string']; ?>" checked>
				<label for="test_type_checkbox_<?php echo $type['type_string']; ?>"><?php echo $type['type_label']; ?></label><br>
<?php
			} //foreach
?>
		</div>
		<div id="button_container">
			<input type="hidden" name="selected_test_id" id="selected_test_id" value="">
			<input type="hidden" name="selected_type" id="selected_type" value="">
			<input type="submit" class="submit_button" name="edit_test" id="edit_test" value="Edit Test" disabled>
			<input type="submit" class="submit_button" name="view_test" id="view_test" value="View Test" disabled>
			<input type="submit" class="submit_button" name="delete_test" id="delete_test" value="Delete Test" disabled>
			<input type="submit" class="submit_button" name="run_test" id="run_test" value="Run Test" disabled>
		</div>
	</section>
</form>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>