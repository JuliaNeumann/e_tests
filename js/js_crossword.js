/*************************************************************************************************************************
JS FOR CROSSWORD TESTS
- contains JS necessary for creating & playing crossword tests
*************************************************************************************************************************/

$(document).ready(function() {
	/*************************************************************************************************************************/
	//set colors:
	$('.table_header').addClass('bg-theme-color font-color-4');
	$('#questions_table').addClass('border-theme-color bg-color-4');

	/*************************************************************************************************************************/
	crossword_test = new E_Test('crossword'); //test object to hold the test data produced / edited here

	//extend the object with the necessary properties & methods for drag&drop tests:
	crossword_test.questions = {counter: 0, objects: {}, displayed: 0}; //holds question objects
	crossword_test.grid = {x: null, y: null, edited: false}; //holds dimenstions of grid (filled when crossword is calculated)
	crossword_test.words_edited = false;
	crossword_test.current_word = null; //for run mode
	crossword_test.crossword = {};
	crossword_test.saveTestData = function() {
	//put all test data into one object literal for easy database submission
		this.test_data.grid = this.grid;
		this.test_data.questions = this.questions;
	} //saveTestData
	crossword_test.calculateCrosswordObj = function(my_show_words) {
	//compute and stores object of an existing crossword
	//params: my_show_words = bool (indicating whether solution words should be shown in the grid or not)
		var crossword = {};
		crossword.grid = {};
		crossword.numbers = {};
		crossword.placed_words = [];
		crossword.x_stop = this.grid.x;
		crossword.y_stop = this.grid.y;
		//calculate empty grid:
		for (var i = 0; i <= this.grid.y; i++) {
		 	crossword.grid[i] = {};
		 	for (var j = 0; j <= this.grid.x; j++) {
		 		crossword.grid[i][j] = '//';
		 	} //for
		 }//for
		 //fill with words:
		 for (var i = 0; i < this.questions.counter; i++) {
		 	var question = this.questions.objects[i];
		 	if (question.position != null) {
		 		var current_x = question.position.x;
		 		var current_y = question.position.y;
		 		for (var j = 0; j < question.correct_answer.length; j++) {
		 			crossword.grid[current_y][current_x] = (my_show_words) ? question.correct_answer.charAt(j) : '&nbsp;';
		 			(question.position.orientation == 0) ? current_x++ : current_y++;
		 		} //for
		 		crossword.numbers[question.position.y + '_' + question.position.x] = question.number;
		 		crossword.placed_words.push(question);
		 	} //if
		 } //for
		 this.crossword = crossword;
	} //calculateCrosswordObj
	crossword_test.retrieveAndDisplayTest = function(my_test_id, my_solution) {
	//retrieves data of a test from the database, displays it in div test_container
	//params: my_test_id = INT; my_solution = bool (determines whether solution should be retrieved or not)
		this.db_id = my_test_id;
		$.getJSON(root_path + 'php_crossword/crossword_managetests.php', {test_id : my_test_id, solution : my_solution}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Test could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				initCrosswordTest(feedback);
			} //else
		});
	} //retrieveAndDisplayTest

	//set correct test data, according to action:
	switch (action) {
		case 'new':
			$.getScript(root_path + "js/crossword_generator.js"); //load the crossword generator code
			getTestNamesFromDb(0); //load test names from database for checking
			break;
		case 'view':
			crossword_test.retrieveAndDisplayTest(test_id, true);
			break;
		case 'edit':
			crossword_test.retrieveAndDisplayTest(test_id, true);
			getTestNamesFromDb(test_id); //load test names from database for checking
			break;
		case 'run':
			crossword_test.retrieveAndDisplayTest(test_id, false);
			break;
		default:
			break;
	} //switch

	function initCrosswordTest(my_test_data) {
	//updates test object & displays crossword/questions of the current test (in view or edit mode)
	//params: my_test_data = questions -> array of question objects, grid -> grid x and grid y
		crossword_test.grid.x = my_test_data['grid']['grid_x'];
		crossword_test.grid.y = my_test_data['grid']['grid_y'];
		for (var i = 0; i < my_test_data.questions.length; i++) {
			var question_id = addQuestionToObj(my_test_data.questions[i]);
			if (action == "edit") {
				addQuestionToDisplay(question_id);
			} //if
		} //for
		if (action == "view" || action == "run") {
			crossword_test.calculateCrosswordObj(false);
		} //if
		else if (action == "edit") {
			crossword_test.calculateCrosswordObj(true);
		} //
		displayCrossword(crossword_test.crossword);
	} //initCrosswordTest

	/*************************************************************************************************************************/

	//adding questions:

	function addQuestionToObj(my_question_object) {
	//adds a question to the test object
	//params: my_question_object = obj (with at least properties: question_text, correct_answer)
		var current_id = crossword_test.questions.counter;
		var question_object = new Question(current_id, my_question_object.question_text);

		question_object.correct_answer = (my_question_object.correct_answer) ? my_question_object.correct_answer : my_question_object.question_correct_answer;
		question_object.correct_answer = question_object.correct_answer.toUpperCase();
		

		if (my_question_object.question_position_x && my_question_object.question_position_y && my_question_object.question_orientation && my_question_object.question_number) {
			question_object.position = {};
			question_object.position.x = my_question_object.question_position_x;
			question_object.position.y = my_question_object.question_position_y;
			question_object.position.orientation = my_question_object.question_orientation;
			question_object.number = my_question_object.question_number;
		} //if

		if (my_question_object.question_ID) {
			question_object.db_id = my_question_object.question_ID;
		} //if
		else {
			question_object.newly_created = true;
		} //else

		crossword_test.questions.objects[current_id] = question_object;
		crossword_test.questions.counter++;
		crossword_test.questions.displayed++;

		if (crossword_test.questions.displayed > 1) { //at least two questions -> allow crossword creation
			$('#create_crossword').attr('disabled', false); //enable button
		} //if
		return current_id;
	} //function addQuestionToObj

	function addQuestionToDisplay(my_question_id) {
	//adds a question to the questions table display
	//params: my_question_id = INT (ID under which question object is found in crossword_test)
		var question_object = crossword_test.questions.objects[my_question_id];
		$('#new_question_row').before('<div class="css_tr question_row" id="question_row_' + my_question_id + '"> \
											<div class="css_td"><div class="editable question_text" data-obj_id="' + my_question_id + '">' + question_object.question_text + '</div></div> \
											<div class="css_td"><div class="editable correct_answer" data-obj_id="' + my_question_id + '">' + question_object.correct_answer + '</div><div class="delete_question_button font-color-4" data-obj_id="' + my_question_id + '">X</div></div> \
										</div>');
		crossword_test.questions.displayed++;
	} //function addQuestionToDisplay

	$('#add_question').click(function(e) {
		e.preventDefault();
		var question = $.trim($('#new_question').val());
		var answer = $.trim($('#new_answer').val());

		if (question == '' || question == "New Question..." || answer == '' || answer == "New Answer...") {
			alert("Please provide a question and answer in the input fields to add this question!");
			return;
		} //if
		if (answer.split(" ").length > 1) {
			alert("Every answer must consist of one word only!");
			$('#new_answer').focus();
			return;
		} //if

		var obj_id = addQuestionToObj({question_text: question, correct_answer: answer});
		addQuestionToDisplay(obj_id);
		$('#new_question').val('New Question...').select();
		$('#new_answer').val('New Answer...');
	});

	/*************************************************************************************************************************/

	//generate crossword:
	$('#create_crossword').click(function() {
		$('#save_test').hide();
		if (crossword_test.questions.displayed > 1) { //at least two questions -> allow crossword creation
			$('#crossword_container').html('<em>Generating your crossword...</em>');
			var words = [];
			for (var i = 0; i < crossword_test.questions.counter; i++) {
				if (!crossword_test.questions.objects[i].deleted) {
					words.push( {word: crossword_test.questions.objects[i].correct_answer,
								question_text: crossword_test.questions.objects[i].question_text,
								word_id: crossword_test.questions.objects[i].current_id});
				} //if
			} //for
			var worker = new Worker(root_path + "js/crossword_generator.js"); //create a web worker to do the calculation
			worker.postMessage(words);
			worker.onmessage = function(event) {
				var crossword = event.data;
				displayCrossword(crossword);
				storeCrosswordToTestObj(crossword);
				$('#save_test').show();
			}
		} //if
		else {
			alert("Please add more words to your crossword test!");
		} //else
	});

	/*************************************************************************************************************************/

	//display crossword:
	function displayCrossword(my_crossword_obj) {
	//displays a solved version of the given crossword
	//params: my_crossword_obj = object delivered by crossword_generator.js
		var grid_string = '<div id="crossword_grid" class="border-theme-color">';
		for (var i = 0; i <= my_crossword_obj.y_stop; i++) {
			grid_string += '<div class="cw_row">';
			for (var j = 0; j <= my_crossword_obj.x_stop; j++) {
				if (my_crossword_obj.grid[i][j] == '//') {
					grid_string += '<div class="empty_field border-theme-color bg-color-2">&nbsp;</div>';
				} //if
				else {
					grid_string += '<div class="filled_field border-theme-color bg-color-4"  id="field_' + i + '_' + j + '"><div class="number_container font-theme-color">';
					if (typeof my_crossword_obj.numbers[i + '_' + j] !== "undefined") { //this is a start field with a number
						grid_string += my_crossword_obj.numbers[i + '_' + j];
					}
					grid_string += '</div><div class="letter_container">' + my_crossword_obj.grid[i][j] + '</div></div>';
				} //else
			} //for
			grid_string += '</div>';
		} //for
		//add the word list:
		grid_string += '</div><div id="question_list">';
		my_crossword_obj.placed_words.sort(function(a,b) { //sort by orientation and number
			if (a.position.orientation != b.position.orientation) {
				return a.position.orientation - b.position.orientation;
			} //if
			else {
				return a.number - b.number;
			} //else
		});
		var across = false;
		var down = false;
		for (var i = 0; i < my_crossword_obj.placed_words.length; i++) {
			if (my_crossword_obj.placed_words[i].position.orientation == 0 && !across) { //add the headline for vertical words
				grid_string += '<h3 class="font-theme-color">ACROSS</h3>';
				across = true;
			} //if
			else if (my_crossword_obj.placed_words[i].position.orientation == 1 && !down) { //add the headline for horizontal words
				grid_string += '<h3 class="font-theme-color">DOWN</h3>';
				down = true;
			} //else if
			grid_string += '<span';
			if (action == "run") {
				grid_string += '  class="crossword_question" data-obj_id="' + my_crossword_obj.placed_words[i].current_id + '"'
			} //if
			grid_string += '>' + my_crossword_obj.placed_words[i].number + ': ' + my_crossword_obj.placed_words[i].question_text + '</span><br>';
		} //for
		grid_string += '</div>';
		$('#crossword_container').html(grid_string);
		$('#crossword_grid').width(((parseInt(my_crossword_obj.x_stop) + 1) * 32) + 'px');
	} //displayCrossword

	/*************************************************************************************************************************/

	//store crossword:
	function storeCrosswordToTestObj(my_crossword_obj) {
	//store the relevant data of the given crossword to the test object
	//params: my_crossword_obj = object delivered by crossword_generator.js
		crossword_test.grid.x = my_crossword_obj.x_stop;
		crossword_test.grid.y = my_crossword_obj.y_stop;
		crossword_test.grid.edited = true;
		crossword_test.words_edited = false;
		for (var i = 0; i < my_crossword_obj.placed_words.length; i++) {
			var question_object = crossword_test.questions.objects[my_crossword_obj.placed_words[i].word_id];
			question_object.position = my_crossword_obj.placed_words[i].position;
			question_object.number = my_crossword_obj.placed_words[i].number;
			question_object.edited = true;
		} //for
		for (var i = 0; i < my_crossword_obj.unplaced_words.length; i++) {
			var question_object = crossword_test.questions.objects[my_crossword_obj.unplaced_words[i].word_id];
			question_object.position = null;
			question_object.number = null;
		} //for
	} //storeCrosswordToTestobj

	/*************************************************************************************************************************/
	
	//save test to database
	$(document).on('click', '#save_test', function(e) {
		e.preventDefault();

		//check submission for completeness & correctness:
		error = false;
		if (!checkForm('#general_info_form', {})) {
			error = true;
		} //if
		if ($.inArray($('#test_name').val(), test_names) !== -1) {
			$('<div class="error_msg">&nbsp;A test with this name already exists.</div>').insertAfter($('#test_name'));
            error = true;
		} //if

		//check that there are no unplaced words left:
		var unplaced_words = [];
		for (var i = 0; i < crossword_test.questions.counter; i++) {
			if ((crossword_test.questions.objects[i].number == null) && !(crossword_test.questions.objects[i].deleted)) { //word is not placed
				unplaced_words.push(crossword_test.questions.objects[i].correct_answer);
			} //if
		} //for
		if (unplaced_words.length > 0) {
			alert('The following words are not placed in the crossword: ' + unplaced_words.toString() + '. Delete these words, or generate a new crossword.');
			error = true;
		} //if
		else if (crossword_test.words_edited) {
			alert('You have edited one or more answers, but not generated a new grid. Please press "Create Crossword" before saving your test.');
			error = true;
		} //

		//submission, if check yielded no errors:
		if (!error) {
			if (confirm("Pressing OK will save your crossword in the state you see displayed. If you do not like the arrangement of the words, or made changes to your answers after creating the crossword, you should create a new crossword before saving.")) {
				$('#test_container').html('<em>Saving...</em>');
				crossword_test.saveTestData();
				crossword_test.saveTestAndRedirect(action);
			} //if
		} //if
	});

	/*************************************************************************************************************************/
	
	//switching between solved and unsolved view:
	$(document).on('click', '#show_solved', function() {
		$(this).attr('id', 'show_unsolved').val('Show Unsolved Test');
		crossword_test.calculateCrosswordObj(true);
		displayCrossword(crossword_test.crossword);
	});

	$(document).on('click', '#show_unsolved', function() {
		$(this).attr('id', 'show_solved').val('Show Solved Test');
		crossword_test.calculateCrosswordObj(false);
		displayCrossword(crossword_test.crossword);
	});

	/*************************************************************************************************************************/
	
	//change text of items/containers by clicking on them
	$(document).on('blur', '.editable_inputfield', function() {
		var new_text = $.trim($(this).val());
		if (new_text == '') {
			alert('Please enter some text!');
			$(this).focus();
			return;
		} //if
		var bool_container = false;
		var obj_id = $(this).closest('.non_editable').data("obj_id");
		if ($(this).closest('.non_editable').hasClass('correct_answer')) {
			new_text = new_text.toUpperCase();
			if (new_text != crossword_test.questions.objects[obj_id].correct_answer) {
				crossword_test.questions.objects[obj_id].correct_answer = new_text; //update test object
				crossword_test.questions.objects[obj_id].edited = true;
				crossword_test.words_edited = true;
			} //if
		} //if
		else if (new_text != crossword_test.questions.objects[obj_id].question_text) {
			crossword_test.questions.objects[obj_id].question_text = new_text; //update test object
			crossword_test.questions.objects[obj_id].edited = true;
		} //else
		$(this).closest('.non_editable').html(new_text).removeClass('non_editable').addClass('editable');
	});

	$(document).on('focus', '.editable_inputfield', function() {
		if ($(this).closest('.non_editable').hasClass('correct_answer')) {
			$(this).attr('maxlength', '25');
		} //if
	});

	/*************************************************************************************************************************/
	 
	//delete questions:
	$(document).on('mouseover', '.question_row', function() {
		$(this).find('.delete_question_button').css('display', 'inline');
		$(this).removeClass('bg-color-4').addClass('bg-color-2 font-color-4');
	});

	$(document).on('mouseleave', '.question_row', function() {
		$(this).find('.delete_question_button').css('display', 'none');
		$(this).removeClass('bg-color-2 font-color-4').addClass('bg-color-4');
	});

	$(document).on('click', '.delete_question_button', function() {
		var obj_id = $(this).data('obj_id');
		if (crossword_test.questions.displayed < 3) { //don't allow delete if not at least 2 questions
			alert("Your test must contain at least two questions!");
		} //if
		else if (confirm('Are you sure you want to delete this question?')){
			crossword_test.questions.objects[obj_id].deleted = true;
			crossword_test.questions.displayed--;
			if (crossword_test.questions.objects[obj_id].position != null) {
				crossword_test.words_edited = true;
			} //if
			$('#question_row_' + obj_id).remove();
		} //else
	});

	/*************************************************************************************************************************/
	
	//run crossword test:
	var current_input = false; //indicates whether an answer input is currently taking place

	function focusAnswerFields(my_question_id) {
	//puts focus on an answer position in the crossword field by decreasing opacity of all other fields
	//params: my_question_id = INT (current ID of question in focus)
		$('.filled_field, .empty_field').css('opacity', '0.3');
		var question = crossword_test.questions.objects[my_question_id];
		var current_x = question.position.x;
 		var current_y = question.position.y;
 		for (var j = 0; j < question.correct_answer.length; j++) {
 			$('#field_' + current_y + '_' + current_x).css('opacity', '1');
 			(question.position.orientation == 0) ? current_x++ : current_y++;
 		} //for
	} //focusAnswerFields

	$(document).on('mouseover', '.crossword_question', function() {
		if (!current_input) {
			focusAnswerFields($(this).data("obj_id"));
		} //if
	}); 

	$(document).on('mouseleave', '.crossword_question', function() {
		if (!current_input) {
			$('.filled_field, .empty_field').css('opacity', '1');
		} //if
	}); 

	$(document).on('click', '.crossword_question', function() {
		current_input = true;
		clearInputFields();
		focusAnswerFields($(this).data("obj_id"));
		var question = crossword_test.questions.objects[$(this).data("obj_id")];
		crossword_test.current_word = question;
		var current_x = question.position.x;
 		var current_y = question.position.y;
 		for (var j = 0; j < question.correct_answer.length; j++) {
 			var current_letter = $('#field_' + current_y + '_' + current_x + ' > .letter_container').html();
 			$('#field_' + current_y + '_' + current_x + ' > .letter_container').html('<input type="text" maxlength="1" class="letter_input_field" id="input_' + current_y + '_' + current_x + '" data-y="' + current_y + '" data-x="' + current_x + '" value="' + current_letter + '">');
 			(question.position.orientation == 0) ? current_x++ : current_y++;
 		} //for
 		$('#input_' + question.position.y + '_' + question.position.x).select(); //focus on first letter input field
	});

	$(document).on('keyup', '.letter_input_field', function(e) {
		var x = parseInt($(this).data('x'));
		var y = parseInt($(this).data('y'));
		if (e.which != 8) { //button other than delete button is pressed
			$('#field_' + y + '_' + x).removeClass('font-color-5 bg-color-3').addClass('bg-color-4').css({'font-weight': 'normal'});
			var letter = $(this).val().toUpperCase();
			$(this).val(letter);
			if ($('#input_' + (y + 1) + '_' + x).length) {
				$('#input_' + (y + 1) + '_' + x).select();
			} //if
			else if ($('#input_' + y + '_' + (x + 1)).length) {
				$('#input_' + y + '_' + (x + 1)).select();
			} //else if
			else { //last letter of the word
				current_input = false;
				clearInputFields();
				$('.filled_field, .empty_field').css('opacity', '1');
			} //else
		} //if
	});

	function clearInputFields() {
	//replaces input fields that are currently in the crossword with their letters, updates the crossword_test grid to reflect the changes
		$('#crossword_grid').find('.letter_input_field').each(function() {
			var x = parseInt($(this).data('x'));
			var y = parseInt($(this).data('y'));
			crossword_test.crossword.grid[y][x] = $(this).val();
		}); 
		displayCrossword(crossword_test.crossword);
	} //clearInputFields

	$('#check_test').click(function(e) {
		e.preventDefault();
		$.getJSON(root_path + 'php_crossword/crossword_managetests.php', {check_test_id : crossword_test.db_id, check_test : crossword_test.crossword.grid}, function(feedback) {
			$('#instructions').html('Your score: ' + feedback.correct + ' out of ' + crossword_test.questions.counter + ' correct!');
			for (var i = 0; i < feedback.wrong_fields.length; i++) {
				$('#field_' + feedback.wrong_fields[i]).removeClass('bg-color-4').addClass('font-color-5 bg-color-3').css({'font-weight': 'bold'});
				if ($('#field_' + feedback.wrong_fields[i] + '> .letter_container').html() == "&nbsp;" || $('#field_' + feedback.wrong_fields[i] + '> .letter_container').html() == '') {
					$('#field_' + feedback.wrong_fields[i] + '> .letter_container').html('?');
				} //if
			}//for
		});
	});

}); //document ready function

/*************************************************************************************************************************/

//class declarations for questions:
function Question(my_current_id, my_question_text) {
//represents one draggable item
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.question_text = my_question_text;
	this.correct_answer = null; //set only if not in run mode
	this.position = null;
	this.number = null;
} //function Item