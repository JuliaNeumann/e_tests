/*************************************************************************************************************************
JS FOR INDEX.PHP
- JavaScript code for handling the dynamic interface of index.php
*************************************************************************************************************************/

var hover_counter = 0;
var hover_interval;
var current_hover;

$(document).ready(function() {

	/*************************************************************************************************************************/
	
	//show test type descriptions, when long hover over button is detected:
	$(document).on('mouseenter', '.test_type_button', function() {
		hover_counter = 0;
		current_hover = $(this).val();
		hover_interval = setInterval(hoverUpdate,500); 
	});
	$(document).on('mouseleave', '.test_type_button', function() {
		hover_counter = 0;
		clearInterval(hover_interval); 
		$('.test_type_description').slideUp("slow");
		$('.test_type_button').css('opacity', '1');
	});
	$(document).on('click', '.test_type_button', function() {
		clearInterval(hover_interval); //prevent sliding down when click has happened already
	});

	function hoverUpdate () {
		hover_counter += 1;
		if (hover_counter == 2) {
			$('#description_' + current_hover).slideDown("slow");
		} //if
		else if (hover_counter == 3) {
			$('.test_type_button').each(function() {
				if ($(this).val() != current_hover) {
					$(this).css('opacity', '0.4');
				} //if
			});
		} //else if
	} //function hoverUpdate

	/*************************************************************************************************************************/
	
	//show tests of selected test type(s):
	$(document).on('change', '.test_type_checkbox', function() {
		var type_string = $(this).val();
		$('#no_test_tr').remove();
		if ($(this).is(':checked')) {
			$('.test_row').each(function() {
				if ($(this).data('type_string') == type_string) {
					$(this).show();
					if ($(this).hasClass('selected_test')) {
						$('.submit_button').attr('disabled', false); //enable buttons
					} //if
				} //if
			});
		} //if
		else {
			$('.test_row').each(function() {
				if ($(this).data('type_string') == type_string) {
					$(this).hide();
					if ($(this).hasClass('selected_test')) {
						$('.submit_button').attr('disabled', true); //disable buttons
					} //if
				} //if
			});
			if ($('.test_row:visible').length == 0) { //no tests are shown anymore
				$('#select_test_table').append('<tr id="no_test_tr"><td colspan="3"><em>There are no tests matching your selection.</em></td></tr>');
			}
		}
	});

	/*************************************************************************************************************************/
	
	//selection of a test:
	$(document).on('click', '.test_row', function() {
		$('.test_row').removeClass('selected_test').removeClass('bg-color-2').removeClass('font-color-4'); //only one test should be selected at a time -> remove previous selections
		$(this).addClass('selected_test').addClass('bg-color-2').addClass('font-color-4');
		$('#selected_test_id').val($(this).data('test_id')); //add values to form, so they can be submitted
		$('#selected_type').val($(this).data('type_string'));
		$('.submit_button').attr('disabled', false); //enable buttons
	});

	/*************************************************************************************************************************/

	//sorting of test list:
	$(document).on('click', '.header_cell', function() {
		if ($(this).hasClass('sorted_up')) {
			$('#sort_pic').remove();
			$(this).removeClass('sorted_up').addClass('sorted_down').append('<div id="sort_pic">&nbsp;&nbsp;<img id="arrow_down" src="' + root_path + 'images/arrow_down.png"></div>');
			sortTable('down', $(this).attr('id'));
		} //if
		else if ($(this).hasClass('sorted_down')) {
			$('#sort_pic').remove();
			$(this).removeClass('sorted_down').addClass('sorted_up').append('<div id="sort_pic">&nbsp;&nbsp;<img id="arrow_up" src="' + root_path + 'images/arrow_up.png"></div>');
			sortTable('up', $(this).attr('id'));
		} //else if
		else { //sorted by other criterion before -> set to default sorting (up for name & type, down for creation date)
			$('#sort_pic').remove();
			if ($(this).attr('id') == 'test_creation_header') {
				$(this).addClass('sorted_down').append('<div id="sort_pic">&nbsp;&nbsp;<img id="arrow_down" src="' + root_path + 'images/arrow_down.png"></div>');
				sortTable('down', $(this).attr('id'));
			} //if
			else {
				$(this).addClass('sorted_up').append('<div id="sort_pic">&nbsp;&nbsp;<img id="arrow_up" src="' + root_path + 'images/arrow_up.png"></div>');
				sortTable('up', $(this).attr('id'));
			} //else
		} //else
	});

	function sortTable(my_order, my_element_id) {
	//sorts the tests table according to selected criterion
	//params: my_order = 'up'|'down', my_element_id = 'string' (name of order criterion)
		if ($('.test_row').length > 0) { //only try sorting if there is something to sort
			var all_rows = $('.test_row').get();
			all_rows.sort(function(a, b) {
				switch(my_element_id) {
					case 'test_name_header': 
						var comp_a = $(a).children('.test_name').text().toUpperCase(); //sort by text inside first child with class 'test_name'
			   			var comp_b = $(b).children('.test_name').text().toUpperCase();
						break;
					case 'test_type_header': 
						var comp_a = $(a).children('.test_type').text().toUpperCase(); //sort by text inside first child with class 'test_type'
						var comp_b = $(b).children('.test_type').text().toUpperCase();
						break;
					case 'test_creation_header': 
						var comp_a = $(a).children('.test_creation_date').text().toUpperCase(); //sort by text inside first child with class 'test_creation_date'
						var comp_b = $(b).children('.test_creation_date').text().toUpperCase();
						break;
					default:
						var comp_a = 0;
						var comp_b = 1;
						break;
				}
			   	return (comp_a < comp_b) ? -1 : (comp_a > comp_b) ? 1 : 0;
			});
			if (my_order == 'down') {
				all_rows.reverse(); //reverse for descending order
			} //if
			$.each(all_rows, function(my_index, my_row) { //append items of sorted array to table
				$('#test_row_container').append(my_row); 
			});
		} //if
	} //function sortTable

	/*************************************************************************************************************************/
	
	//confirm deletion
	$('#delete_test').click(function(e) {
		if (!confirm('Are you sure you want to delete this test? This will remove the test and all its content permanently from the database!')) {
			e.preventDefault();
		} //if
	});
});