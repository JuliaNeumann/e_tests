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
		
		$(document).on('click', '.color_button', function(e) {
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
	//creating and downloading images of displayed tests:
	this.createImage = function(my_test_name, my_html_element, my_extension) {
	//creates svg containing the given test name (string) and html element (jQuery object)
	//draws image to a canvas and initializes download as file with my_extension or starts printing
		if ((typeof SVGForeignObjectElement !== 'undefined') && (!!document.createElement('canvas').getContext)) { //test for support of foreign object (currently not supported in IE!) and canvas
			var self = this;
			var svg_width = my_html_element.width() + 20;
			var svg_height = my_html_element.height() + 120;

			//get all CSS rules that apply to the elements in my_html_element
			var css = '';
		    var style_sheets = document.styleSheets;
		    for (var i = 0; i < style_sheets.length; i++) { //loop through all rules in all stylesheets
				var rules = style_sheets[i].cssRules;
				if (rules != null) {
					for (var j = 0; j < rules.length; j++) {
						var rule = rules[j];
						if (typeof(rule.style) != "undefined") {
							if (my_html_element.find(rule.selectorText).length > 0) { //rule applies to some elements inside my_html_element
								css += rule.selectorText + " { " + rule.style.cssText + " }\n";
							} //if
						} //if
					} //for
				} //if
		    } //for

		    //generate SVG element + URL:
			var svg_element = $('<svg xmlns="http://www.w3.org/2000/svg" id="img_svg" width="' + svg_width + '" height="' + svg_height + '"> \
			           			<style type="text/css"><![CDATA[\n' + css + '\n]]></style> \
			           			<foreignObject width="100%" height="100%"> \
			           				<div xmlns="http://www.w3.org/1999/xhtml" id="svg_img_container" style="font-family:Calibri;font-size:12pt;padding:10px"> \
			             				<h3>' + my_test_name + '</h3><br />'
			             				+ my_html_element.html() +
			             				'<p style="font-size:10pt;text-align:right;color:#848484">This image was created using the E-Test Editor by Julia Neumann, 2015</p> \
			           				</div> \
			           			</foreignObject> \
			           		  </svg>');

	        var svg_data = new XMLSerializer().serializeToString(svg_element[0]); 
	        var blob = new Blob([svg_data], { type: "image/svg+xml;charset=utf-8" }); //create blob from the SVG data

	        var dom_url = window.URL || window.webkitURL || window;
	        var blob_url = dom_url.createObjectURL(blob); //get the blob URL

	        //draw image to canvas and, if required, initialize download as image file
	    	$('body').append('<canvas id="img_canvas" class="hidden"></canvas>');
	    	var canvas = document.getElementById('img_canvas');
	        canvas.width = svg_width;
	        canvas.height = svg_height;
	        var ctx = canvas.getContext('2d');

	        if (my_extension == 'jpeg') { //set background of canvas to white for jpeg (transparent will get black otherwise)
	        	ctx.fillStyle = '#fff';
	            ctx.fillRect(0, 0, svg_width, svg_height);
	        } //if

	        var img = new Image(); //create image object from the blob URL
	        img.crossOrigin = "anonymous";

			img.onload = function () {
				
				ctx.drawImage(img, 0, 0); //throws an error in IE
				dom_url.revokeObjectURL(blob_url);
				if (my_extension !== false) {
					self.downloadImage(my_extension);
				} //if
				else {
					var original_page_content = $('body').html();
					var original_color = $('body').css('background-color');
					$('body').css('background-color', 'white');
					$('#content').replaceWith($('#img_canvas').show()); //replace all content with the canvas
					window.print(); //trigger printing
					$('body').css('background-color', original_color);
					$('body').html(original_page_content); //restore original page content
					$('#img_canvas').remove();
				} //else
				$('#img_canvas').hide();
			} //img.onload

			img.src = blob_url;
		} //if
		else {
			alert('Your browser does not support exporting tests. Try a different browser (the newest version of Firefox, for example).');
		} //else

	} //createImage

	this.downloadImage = function(my_extension) {
	//initializes download of image file with given extenstion, if possible
		var canvas = document.getElementById('img_canvas');
		try {
			var my_image_code = canvas.toDataURL('image/' + my_extension);
			$('body').append('<a id="download_' + my_extension + '_link" href="' + my_image_code + '" download="etest_image"><button type="button" id="download_button">Download as ' + my_extension + '</button></a>');
			$('#download_button').click();
			$('#download_' + my_extension + '_link').remove();
			$('#img_canvas').remove();
		} //try
		catch (error) {
			console.log(error.message);
			$('#img_canvas').remove();
			alert('Your browser does not support exporting tests as images. Try a different browser (the newest version of Firefox, for example), or choose the \'Print Test\' option instead.');
		} //catch
	} //downloadImage

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

	this.decodeHTMLEntities = function(my_string) {
	//returns a version of my_string with HTML entities decoded (needed for checks for double questions)
		return $('<textarea />').html(my_string).text();
	} //decodeHTMLEntities

	this.getTestNamesFromDb = function(my_test_id) {
	//gets all test names that exist in the database via an AJAX request, returns them as indexed array, root_path must exist as global variable!
	//params: my_test_id = INT (Database ID of the current test, which should be excluded, 0 for new test)
		var self_control = this;
		$.getJSON(root_path + 'php_support/manage_tests.php', {get_test_names : true, test_ID : my_test_id, test_type : section}, function(feedback) {
			self_control.test_names = feedback;
		});
	} //getTestNamesFromDb

} //function Control