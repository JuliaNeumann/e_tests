/*************************************************************************************************************************
JS GENERAL FUNCTIONS
- provides functions needed by all types of tests
*************************************************************************************************************************/

$(document).ready(function() {
	//set theme color:
	$('header, footer, th').addClass('bg-theme-color');
	$('table, th').addClass('border-theme-color');

	//upadte test title:
	$('#test_name').keyup(function() {
		var test_name = $(this).val();
		if (test_name != '') {
			$('#test_name_container').html(test_name);
		} //if
		else {
			$('#test_name_container').html('[TEST NAME]');
		} //else
	});

	//change elements with class 'editable' to input fields, when clicked
	$(document).on('click', '.editable', function() {
		var item_text = $(this).html();
		$(this).html('<input type="text" class="editable_inputfield" value="' + item_text + '">').removeClass('editable').addClass('non_editable');
		$('.editable_inputfield').select();
	});

	$(document).on('keyup', '.editable_inputfield', function(e) {
		if (e.which == 13) { //enter is pressed
			$(this).blur();
		} //if
	});

});


function checkForm(my_form_id, my_fields) {
//checks input in HTML form for consistency and completeness (by default checks all text input fields, select boxes for values, plus my_fields for specified data types)
//params: my_form_name = string, my_fields = object literal of field IDs and expected data type
	var errors = false;
	$(my_form_id).find('.error_msg').remove(); //remove existing error messages

	//check all obligatory text input fields for value:
	$(my_form_id).find(':text').each(function() {
		var field_id = $(this).attr('id');
		$(this).val($.trim($(this).val())); //prepare for test
		if ($(this).val() == '' && !($(this).hasClass('optional'))) { //obligatory text fields should not be empty
			$('<div class="error_msg">&nbsp;Please provide a value!</div>').insertAfter(this);
            errors = true;
        } //if
        else if ($.inArray(field_id, Object.keys(my_fields)) !== -1) { //field is given in my_fields
        	switch (my_fields[field_id]) {
        		case 'number_greater_one': //value must be a number greater than 1; NOT NEEDED FOR NOW!!
        			if (isNaN($('#' + field_id).val()) || (parseInt($('#' + field_id).val()) <= 1)) {
        				$('<div class="error_msg">&nbsp;Please provide a valid number (greater than 1)!</div>').insertAfter(this);
            			errors = true;
        			}
        			break;
        		default:
        			break;
        	} //switch
        } //else
	});

	$(my_form_id).find('select').each(function() {
		if ($(this).val() == '' && !($(this).hasClass('optional'))) { //obligatory select boxes should not be unselected
			$('<div class="error_msg">&nbsp;Please select a value!</div>').insertAfter(this);
            errors = true;
		} //if
	});

	if (errors) {
		return false;
	} //if
	return true;
} //function checkForm

/*************************************************************************************************************************/

function clearForm(my_form_id) {
//clear input fields of the specified form
	$(my_form_id).find(':text').each(function() { 
		$(this).val('');
	});
} //function clearForm

/*************************************************************************************************************************/

function E_Test(my_type_string) {
//class declaration for general Test objects
	this.test_type = my_type_string;
	this.test_data = {};
	this.test_name = '';
	this.test_level = null;
	this.db_id = null;
	this.db_error = '';
} //function E_Test

E_Test.prototype.loadGeneralInfoFromForm = function() {
//gets name and level of test from form for general test info (see general_testinfo_form.php)
	this.test_name = $('#test_name').val();
	this.test_level = $('#test_level').val();
} //loadDataFromForm()

E_Test.prototype.saveTestAndRedirect = function(my_action) {
//saves test as new entry in database table 'tests'
//params: my_action = 'string' (possible values: 'edit' or 'new')
	this.loadGeneralInfoFromForm();
	var submission_data = {'test_name' : this.test_name, 'test_type_string' : this.test_type, 'test_level' : this.test_level, 'test_ID' : this.db_id};
	var current_test_type = this.test_type;
	$.post(root_path + 'php_' + this.test_type + '/' + this.test_type + '_managetests.php', {save_test : submission_data, test_data: this.test_data, action: my_action}, function(feedback) {
		if (isNaN(feedback)) {
			alert('An error occurred while saving your test: ' + feedback + ' Please check the table of tests to see which data has been stored incorrectly.');
			window.location.href = root_path + 'index.php';
		} //if
		else {
			window.location.href = root_path +'php_' + current_test_type + '/' + current_test_type + '_viewtest.php?test_id=' + feedback; //redirect to view page, with ID of new test as GET value
		} //else
	});
} //saveTestAndRedirect()

/*************************************************************************************************************************/

function TestItem(my_current_id) {
//class declaration for general Test item objects (parts of a test that can be deleted, edited etc. separately)
	this.current_id = my_current_id; //ID under which item is identified in current display of test
	this.db_id = null; //ID under which item is stored in DB
	this.newly_created = false; //to indicate whether the item has been newly created
	this.deleted = false; //to be set when item is deleted from test
	this.edited = false; //to be set when (existing) item is edited
	this.added_from_db = false; //to be set when an existing item is added from DB
} //function TestItem

/*************************************************************************************************************************/

function getTestNamesFromDb(my_test_id) {
//gets all test names that exist in the database via an AJAX request, returns them as indexed array, root_path must exist as global variable!
//params: my_test_id = INT (Database ID of the current test, which should be excluded, 0 for new test)
	$.getJSON(root_path + 'php_support/manage_tests.php', {get_test_names : true, test_ID : my_test_id}, function(feedback) {
		test_names = feedback;
	});
} //function getTestNamesFromDb