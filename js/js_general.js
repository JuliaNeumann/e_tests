/*************************************************************************************************************************
JS GENERAL FUNCTIONS
- provides functions needed by all types of tests
*************************************************************************************************************************/

//MODEL:
function E_Test(my_type_string) {
//class declaration for E_Test objects

	this.test_type = my_type_string;
	this.test_data = {};
	this.test_name = '';
	this.test_level = null;
	this.db_id = null;
	this.db_error = '';

	this.loadGeneralInfoFromForm = function() {
	//gets name and level of test from form for general test info (see general_testinfo_form.php)
		this.test_name = $('#test_name').val();
		this.test_level = $('#test_level').val();
	} //loadDataFromForm

	this.saveTestAndRedirect = function(my_action) {
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
	} //saveTestAndRedirect

} //function E_Test

function TestItem(my_current_id) {
//class declaration for test item objects (parts of a test that can be deleted, edited etc. separately)
	this.current_id = my_current_id; //ID under which item is identified in current display of test
	this.db_id = null; //ID under which item is stored in DB
	this.newly_created = false; //to indicate whether the item has been newly created
	this.deleted = false; //to be set when item is deleted from test
	this.edited = false; //to be set when (existing) item is edited
	this.added_from_db = false; //to be set when an existing item is added from DB
} //function TestItem

/*************************************************************************************************************************/

//VIEW:
function View() {
//class declaration View (holds view functionality common to all pages)
	
	this.initGeneralView = function() {
		var self_view = this;

		/*************************************************************/
		//set theme color:
		$('header, th').addClass('bg-theme-color');
		$('table, th').addClass('border-theme-color');

		if((typeof(Storage) !== "undefined") && (typeof(localStorage.getItem("etests_color")) !== "undefined")) { //look for a stored color
	    	self_view.changeThemeColor(localStorage.getItem("etests_color"));
		} //if
		
		$('.color_button').click(function(e) {
			e.preventDefault();
			var color_code = $(this).css('background-color');
			self_view.changeThemeColor(color_code);
		});

		/*************************************************************/
		//upadte test title when input is made:
		$('#test_name').keyup(function() {
			var test_name = $(this).val();
			if (test_name != '') {
				$('#test_name_container').html(test_name);
			} //if
			else {
				$('#test_name_container').html('[TEST NAME]');
			} //else
		});

		/*************************************************************/
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

		/*************************************************************/
		//warn when editing/creating a test is interrupted by click on home link:
		$('#home_link').click(function(e) {
			if (action == "edit" || action =="new") {
				if(!confirm("When leaving this page, your changes will be lost and the test will not be saved. Leave anyway?")) {
					e.preventDefault();
				} //if
			} //if
		});

		/*************************************************************/
		//reset (in run mode -> start test again after a previous submission):
		$('#reset').click(function(e) {
			var url = root_path + 'php_' + section + '/' + section + '_' + action + 'test.php';
			window.location.assign(url + '?selected_test_id=' + test_id);
		});

		/*************************************************************/
		//delete notifications by button click:
		$(document).on('mouseenter', '.notification', function() {
			$(this).find('.delete_notification_button').show();
		}); 
		$(document).on('mouseleave', '.notification', function() {
			$(this).find('.delete_notification_button').hide();
		}); 
		$(document).on('click', '.delete_notification_button', function() {
			$(this).closest('.notification').remove();
		}); 
	} //initGeneralView

	/*************************************************************/
	this.changeThemeColor = function(my_color_code) {
	//sets the theme color to the specified color
	//params: my_color_code = string (code of the required color)
		$('head > #color_settings').remove();
		var style = $('<style id="color_settings">.bg-theme-color { background-color: ' + my_color_code + '; } \
							.border-theme-color { border-color: ' + my_color_code + '; } \
							.font-theme-color { color: ' + my_color_code + '; } \
					</style>');
		$('html > head').append(style);
		if(typeof(Storage) !== "undefined") {
    		localStorage.setItem("etests_color", my_color_code); //remember this color
		} //if
	} //changeThemeColor

	
	/*************************************************************/
	//handle forms:
	this.checkForm = function(my_form_id) {
	//checks input in HTML form for consistency and completeness (by default checks all text input fields, select boxes for values, plus my_fields for specified data types)
	//params: my_form_name = string, my_fields = object literal of field IDs and expected data type
		var errors = false;
		$(my_form_id).find('.error_msg').remove(); //remove existing error messages

		//check all obligatory text input fields for value:
		$(my_form_id).find(':text, textarea').each(function() {
			var field_id = $(this).attr('id');
			$(this).val($.trim($(this).val())); //prepare for test
			if ($(this).val() == '' && !($(this).hasClass('optional'))) { //obligatory text fields should not be empty
				$('<div class="error_msg">&nbsp;Please provide a value!</div>').insertAfter(this);
	            errors = true;
	        } //if
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
	} //checkForm

	/*************************************************************/
	//handle buttons:
	this.disableButtons = function() {
	//disable all buttons on the page (e.g. while saving)
		$("input[type='submit'], button").attr('disabled', true);
	} //disableButtons

	this.enableButtons = function() {
	//enable all buttons on the page
		$("input[type='submit'], button").attr('disabled', false);
	} //enableButtons

	/*************************************************************/
	//functions needed for test display:
	this.setHTMLContent = function(my_element_id, my_content) {
	//sets HTML content of the element with the given HTML ID attribute to the given content
		$('#' + my_element_id).html(my_content);
	} //setHTMLContent

	this.displayScore = function(my_correct, my_all) {
	//display score of the user on page in run mode
		$('.instructions').html('Your score: ' + my_correct + ' out of ' + my_all + ' correct!');
		$('#check_test').hide();
		$('#reset').show().attr('disabled', false);
	} //displayScore

	/*************************************************************/
	this.initGeneralView();

} //function View


/*************************************************************************************************************************/

//CONTROL:
function Control() {
//class declaration Control (holds control functionality common to all pages)
	
	this.test_names = [];

	this.checkTestName = function() {
	//checks whether the current test name is not already taken, returns ok if it is, else displays error message
		if ($.inArray($('#test_name').val(), this.test_names) !== -1) {
			$('<div class="error_msg">&nbsp;A test with this name already exists.</div>').insertAfter($('#test_name'));
	        return false;
		} //if
		return true;
	} //checkTestName

	this.getTestNamesFromDb = function(my_test_id) {
	//gets all test names that exist in the database via an AJAX request, returns them as indexed array, root_path must exist as global variable!
	//params: my_test_id = INT (Database ID of the current test, which should be excluded, 0 for new test)
		var self_control = this;
		$.getJSON(root_path + 'php_support/manage_tests.php', {get_test_names : true, test_ID : my_test_id}, function(feedback) {
			self_control.test_names = feedback;
		});
	} //getTestNamesFromDb

} //function Control