<?php
/*************************************************************************************************************************
CREATING A NEW DRAG & DROP TEST
- presents user with form for creation of new drag & drop test
*************************************************************************************************************************/
	
	//Page Variables:
	$title = 'Drag &amp; Drop';
	$header_text = 'New Drag &amp; Drop Test';
	$section = 'dragdrop';
	$action = 'new';

	require_once $_SERVER['DOCUMENT_ROOT'] . '/e_tests/php_support/config.php';

	require_once INCLUDE_PATH . 'php_page_elements/page_header.php';
	
	require_once INCLUDE_PATH . 'php_page_elements/general_testinfo_form.php'; 
?>
	<header id="test_container_header">
		"<span id="test_name_container">[NEW TEST]</span>"
	</header>
	<section id="test_container">
		<div class="instructions">
			Click on the text inside the containers and items to edit them. Drag the items into the correct containers.
			<div class="right_aligned">
				<input type="submit" class="submit_button" id="add_item" value="Add Item">
				<input type="submit" class="submit_button" id="add_container" value="Add Container">
			</div>
		</div>
		<div id="items_container"></div>
		<div id="containers_container"></div>
		<div class="right_aligned">
			<input type="submit" class="submit_button" name="save_test" id="save_test" value="Save Test">
		</div>
	</section>
<?php 
	include_once INCLUDE_PATH . 'php_page_elements/page_footer.php'; 
?>
