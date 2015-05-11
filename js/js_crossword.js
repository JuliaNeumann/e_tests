/*************************************************************************************************************************
JS FOR CROSSWORD TESTS
- contains JS necessary for creating & playing crossword tests
*************************************************************************************************************************/

//MODEL:
var crossword_test = { //test object to hold the test data produced / edited here

	init : function() {
		//PROPERTIES:
		this.questions = {counter: 0, objects: {}}; //holds question objects
		this.grid_data = {x: null, y: null, edited: false}; //holds dimenstions of grid (filled when crossword is calculated)
		this.grid = {}; //will hold current grid of the crossword
		this.numbers = {}; //will hold position of numbered fields in the current grid
		this.placed_words = []; //will hold all words that have a position in the current grid
		this.words_edited = false;
		this.current_word = null; //for run mode

		E_Test.call(this, 'crossword'); //make this inherit from E_Test (see js_general.js)
	}, //init

	addQuestionToModel : function(my_question_object) {
	//adds a question to the test object, returns the created object
	//params: my_question_object = obj (with at least properties: question_text, correct_answer)
		var current_id = crossword_test.questions.counter;
		var question_object = new Question(current_id, my_question_object.question_text);

		question_object.correct_answer = (my_question_object.correct_answer) ? my_question_object.correct_answer : my_question_object.question_correct_answer;
		question_object.correct_answer = question_object.correct_answer.toUpperCase();

		if (my_question_object.question_ID) {
			question_object.db_id = my_question_object.question_ID;
		} //if
		else {
			question_object.newly_created = true;
		} //else

		if (my_question_object.question_position_x && my_question_object.question_position_y && my_question_object.question_orientation && my_question_object.question_number) {
			question_object.position = {x : my_question_object.question_position_x, 
										y : my_question_object.question_position_y,
										orientation : my_question_object.question_orientation};
			question_object.number = my_question_object.question_number;
			this.numbers[question_object.position.y + '_' + question_object.position.x] = question_object.number;
		 	this.placed_words.push(question_object);
		} //if

		crossword_test.questions.objects[current_id] = question_object;
		crossword_test.questions.counter++;

		return question_object;
	}, //addQuestionToModel

	calculateGrid : function(my_show_words) {
	//compute and store grid of an existing crossword
	//params: my_show_words = bool (indicating whether solution words should appear in the grid or not)
		this.grid = {};
		for (var i = 0; i <= this.grid_data.y; i++) { //calculate empty grid:
		 	this.grid[i] = {};
		 	for (var j = 0; j <= this.grid_data.x; j++) {
		 		this.grid[i][j] = '//';
		 	} //for
		 }//for
		 for (var i = 0; i < this.placed_words.length; i++) { //fill with words:
		 	var question = this.placed_words[i];
		 	if (question.position != null) {
		 		var current_x = question.position.x;
		 		var current_y = question.position.y;
		 		for (var j = 0; j < question.correct_answer.length; j++) {
		 			this.grid[current_y][current_x] = (my_show_words) ? question.correct_answer.charAt(j) : '&nbsp;';
		 			(question.position.orientation == 0) ? current_x++ : current_y++;
		 		} //for
		 	} //if
		 } //for
	}, //calculateGrid

	resetGrid : function() {
	//resets the variables that are changed when new crossword grid is calculated
		this.grid = {};
		this.placed_words = [];
		this.numbers = {};
	}, //resetGrid

	saveTestData : function() {
	//put all test data into one object literal for easy database submission
		this.test_data = {grid: this.grid_data, questions : this.questions};
	} //saveTestData

} //crossword_test

//class declarations for questions:
function Question(my_current_id, my_question_text) {
//represents one draggable item
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.question_text = my_question_text;
	this.correct_answer = null; //set only if not in run mode
	this.position = null;
	this.number = null;
} //function Question

/*************************************************************************************************************************/
//VIEW:

var view = {

	init : function() {
		//PROPERTIES:
		this.questions_displayed = 0;
		this.questions_container = $('#questions_container');
		this.crossword_container = $('#crossword_container');
		this.question_template = $('script[data-template="question"]').html();
		this.animation_counter = 0;
		this.animation_interval;
		var self = this;

		View.call(this); //make this inherit from View (see js_general.js)

		/*************************************************************/

		//COLORS:
		$('.table_header').addClass('bg-theme-color font-color-4');
		$('#questions_table').addClass('border-theme-color bg-color-4');

		/*************************************************************/

		//EVENT HANDLERS:
		//switching between solved and unsolved view:
		$(document).on('click', '#show_solved', function() {
			$(this).attr('id', 'show_unsolved').val('Show Unsolved Test');
			control.initGrid(true);
		});
		$(document).on('click', '#show_unsolved', function() {
			$(this).attr('id', 'show_solved').val('Show Solved Test');
			control.initGrid(false);
		});

		/*************************************************************/
		//export options in view mode:
		$(document).on('click', '#download_as_png', function(e) {
			e.preventDefault();
			self.createImage(control.getTestName(), $('#crossword_container'), 'png');
		});
		$(document).on('click', '#download_as_jpeg', function(e) {
			e.preventDefault();
			self.createImage(control.getTestName(), $('#crossword_container'), 'jpeg');
		});
		$(document).on('click', '#print_test', function(e) {
			e.preventDefault();
			self.createImage(control.getTestName(), $('#crossword_container'), false);
		});

		/*************************************************************/
		//adding new questions by button click:
		$('#add_question').click(function(e) {
			e.preventDefault();
			var question = $.trim($('#new_question').val());
			var answer = $.trim($('#new_answer').val());

			if (question == '' || answer == '') {
				alert("Please provide a question and an answer in the input fields to add this question!");
				return;
			} //if
			if (!control.checkCorrectAnswer(answer.toUpperCase())) {
				alert("Every answer must consist of one word only and must only contain letters A-Z and numbers!");
				$('#new_answer').focus();
				return;
			} //if

			control.addQuestion({question_text: question, correct_answer: answer});
			$('#new_question').val('').select();
			$('#new_answer').val('');
		});

		/*************************************************************/
		//generate crossword by button click:
		$('#create_crossword').click(function() {
			$('#save_test').hide();
			if (self.questions_displayed < 2) { //at least two questions -> allow crossword creation
				alert("Please add more words to your crossword test!");
				return;
			} //if
			self.disableButtons();
			self.crossword_container.html('<em>Generating your crossword <span id="animation_dots">...</span></em>');
			self.animation_counter = 0;
			self.animation_interval = setInterval(self.generatingAnimation, 350);
			control.initGenerateCrossword();
		});

		/*************************************************************/
		//change text of questions/answers by clicking on them
		$(document).on('blur', '.editable_inputfield', function() {
			var new_text = $.trim($(this).val());
			if (new_text == '') {
				alert('Please enter some text!');
				$(this).focus();
				return;
			} //if
			var obj_id = $(this).closest('.non_editable').data("obj_id");
			if ($(this).closest('.non_editable').hasClass('correct_answer')) {
				new_text = new_text.toUpperCase();
				if (control.checkCorrectAnswer(new_text)) {
					control.changeCorrectAnswer(obj_id, new_text);
				} //if
				else {
					alert("Every answer must consist of one word only and must only contain letters A-Z and numbers!");
					$(this).focus();
					return;
				} //else
			} //if
			else {
				control.changeQuestionText(obj_id, new_text);
			} //else
			$(this).closest('.non_editable').html(new_text).removeClass('non_editable').addClass('editable');
		});
		$(document).on('focus', '.editable_inputfield', function() {
			if ($(this).closest('.non_editable').hasClass('correct_answer')) {
				$(this).attr('maxlength', '25');
			} //if
		});

		/*************************************************************/
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
			if (self.questions_displayed < 3) { //don't allow delete if not at least 2 questions
				alert("Your test must contain at least two questions!");
			} //if
			else if (confirm('Are you sure you want to delete this question?')){
				control.deleteQuestion(obj_id);
				self.questions_displayed--;
				$('#question_row_' + obj_id).remove();
			} //else
		});

		/*************************************************************/
		//save test to database
		$(document).on('click', '#save_test', function(e) {
			e.preventDefault();

			//check submission for completeness & correctness:
			error = false;
			if (!self.checkForm('#general_info_form')) {
				error = true;
			} //if
			if (!control.checkTestName()) {
				error = true;
			} //if

			//check that there are no unplaced words left:
			var unplaced_words = control.checkUnplacedWords();
			if (unplaced_words.length > 0) {
				alert('The following words are not placed in the crossword: ' + unplaced_words.toString() + '. Delete these words, or generate a new crossword.');
				error = true;
			} //if
			else if (control.words_edited) {
				alert('You have edited one or more answers, but not generated a new grid. Please press "Create Crossword" before saving your test.');
				error = true;
			} //

			//submission, if check yielded no errors:
			if (!error) {
				if (confirm("Pressing OK will save your crossword in the state you see displayed. If you do not like the arrangement of the words, or made changes to your answers after creating the crossword, you should create a new crossword before saving.")) {
					self.disableButtons(); //see js_general.js
					$('#test_container').html('<em>Saving...</em>');
					control.saveTest();
				} //if
			} //if
		});
		
		/*************************************************************/
		//enabling user input in run mode
		$(document).on('mouseover', '.crossword_question', function() {
			if (!control.current_input) {
				var question_object = control.getQuestion($(this).data("obj_id"));
				self.focusAnswerFields(question_object, false);
			} //if
		}); 
		$(document).on('mouseleave', '.crossword_question', function() {
			if (!control.current_input) {
				$('.filled_field, .empty_field').css('opacity', '1');
			} //if
		}); 
		$(document).on('click', '.crossword_question', function() {
			control.current_input = true;
			var question_object = control.getQuestion($(this).data("obj_id"));
			control.processInput();
			self.focusAnswerFields(question_object, true);
		});
		$(document).on('keyup', '.letter_input_field', function(e) {
			var x = parseInt($(this).data('x'));
			var y = parseInt($(this).data('y'));
			if (e.which != 8) { //button other than delete button is pressed
				var letter = $(this).val().toUpperCase();
				$(this).val(letter);
				if ($('#input_' + (y + 1) + '_' + x).length) {
					$('#input_' + (y + 1) + '_' + x).select();
				} //if
				else if ($('#input_' + y + '_' + (x + 1)).length) {
					$('#input_' + y + '_' + (x + 1)).select();
				} //else if
				else { //last letter of the word
					control.current_input = false;
					control.processInput();
					$('.filled_field, .empty_field').css('opacity', '1');
				} //else
			} //if
		});
		$('#check_test').click(function(e) {
			e.preventDefault();
			$('.instructions').html('<em>Checking ...</em>');
			$(this).attr('disabled', true);
			$('.crossword_question').removeClass('crossword_question');
			control.checkRunTest();
		});
	}, //init

	addQuestionToView : function(my_question_object) {
	//adds a question to the questions table display
	//params: my_question_object = object
		var map = {"{{id}}" : my_question_object.current_id, "{{question}}": my_question_object.question_text, "{{answer}}": my_question_object.correct_answer};
		var question_html = this.question_template.replace(/{{id}}|{{question}}|{{answer}}/g, function(my_str){ return map[my_str]; });
		this.questions_container.append(question_html);
		this.questions_displayed++;

		if (this.questions_displayed > 1) { //at least two questions -> allow crossword creation
			$('#create_crossword').attr('disabled', false); //enable button
		} //if
	}, //addQuestionToView

	checkCompleted : function() {
	//checks whether all fields are filled with letters, if so: enables Check button
		var incomplete = false;
		$('.letter_container').each(function() {
			if ($(this).html() == "&nbsp;" || $(this).html() == '' || $(this).html() == ' ') {
				incomplete = true;
			} //if
		});
		if (!incomplete) {
			$('#check_test').attr('disabled', false);
		} //if
	}, //checkCompleted

	displayCrossword : function(my_x, my_y, my_grid, my_numbers, my_words) {
	//displays a solved version of the given crossword
	//params: my_x, my_y = INT, my_grid = object (fields and their content), my_numbers = object (numbered fields), my_words = array (placed words)
		var grid_string = '<div id="crossword_grid" class="border-theme-color">';
		for (var i = 0; i <= my_y; i++) {
			grid_string += '<div class="cw_row">';
			for (var j = 0; j <= my_x; j++) {
				if (my_grid[i][j] == '//') {
					grid_string += '<div class="empty_field border-theme-color bg-color-2">&nbsp;</div>';
				} //if
				else {
					grid_string += '<div class="filled_field border-theme-color bg-color-4"  id="field_' + i + '_' + j + '"><div class="number_container font-theme-color">';
					if (typeof my_numbers[i + '_' + j] !== "undefined") { //this is a start field with a number
						grid_string += my_numbers[i + '_' + j];
					}
					grid_string += '</div><div class="letter_container">' + my_grid[i][j] + '</div></div>';
				} //else
			} //for
			grid_string += '</div>';
		} //for
		//add the word list:
		grid_string += '</div><div id="question_list">';
		my_words.sort(function(a,b) { //sort by orientation and number
			if (a.position.orientation != b.position.orientation) {
				return a.position.orientation - b.position.orientation;
			} //if
			else {
				return a.number - b.number;
			} //else
		});
		var across = false;
		var down = false;
		for (var i = 0; i < my_words.length; i++) {
			if (my_words[i].position.orientation == 0 && !across) { //add the headline for vertical words
				grid_string += '<h3 class="font-theme-color">ACROSS</h3>';
				across = true;
			} //if
			else if (my_words[i].position.orientation == 1 && !down) { //add the headline for horizontal words
				grid_string += '<h3 class="font-theme-color">DOWN</h3>';
				down = true;
			} //else if
			grid_string += '<span';
			if (action == "run") {
				grid_string += '  class="crossword_question" title="Click here to enter your answer!" data-obj_id="' + my_words[i].current_id + '"'
			} //if
			grid_string += '>' + my_words[i].number + ': ' + my_words[i].question_text + '</span><br>';
		} //for
		grid_string += '</div>';
		$('#crossword_container').html(grid_string);
		$('#crossword_grid').width(((parseInt(my_x) + 1) * 32) + 'px');

		if (action == 'new' || action == 'edit') {
			$('#save_test').show();
			this.enableButtons();
		} //if
	}, //displayCrossword

	focusAnswerFields : function(my_question_object, my_input_fields) {
	//puts focus on an answer position in the crossword field by decreasing opacity of all other fields
	//params: my_question_object = object (current question in focus), my_input_fields = bool (indicating whether focussed fields should be filled with input fields)
		$('.filled_field, .empty_field').css('opacity', '0.3');
		var current_x = my_question_object.position.x;
 		var current_y = my_question_object.position.y;
 		for (var j = 0; j < my_question_object.correct_answer.length; j++) {
 			$('#field_' + current_y + '_' + current_x).css('opacity', '1');
 			if (my_input_fields) {
 				var current_letter = $('#field_' + current_y + '_' + current_x + ' > .letter_container').html();
	 			$('#field_' + current_y + '_' + current_x + ' > .letter_container').html('<input type="text" maxlength="1" class="letter_input_field" id="input_' + current_y + '_' + current_x + '" data-y="' + current_y + '" data-x="' + current_x + '" value="' + current_letter + '">');
 			} //if
 			(my_question_object.position.orientation == 0) ? current_x++ : current_y++;
 		} //for
 		if (my_input_fields) {
 			$('#input_' + my_question_object.position.y + '_' + my_question_object.position.x).select(); //focus on first letter input field
 		} //if
	}, //focusAnswerFields

	generatingAnimation : function() {
	//initializes display of an animated message while crossword is being generated
		var messages = ['&nbsp;...', '.&nbsp;..', '..&nbsp;.', '...&nbsp;'];
		var self = view; //'this' won't work here, because of calling in interval
		$('#animation_dots').html(messages[self.animation_counter]);
		self.animation_counter++;
		if (self.animation_counter >= messages.length) {
			self.animation_counter = 0;
		} //if
	}, //generatingAnimation

	markFieldAsIncorrect : function(my_field_id) {
	//mark the field with the given ID attribute as incorrect
		$('#' + my_field_id).removeClass('bg-color-4').addClass('font-color-5 bg-color-3').css({'font-weight': 'bold'});
		if ($('#' + my_field_id + '> .letter_container').html() == "&nbsp;" || $('#' + my_field_id + '> .letter_container').html() == '') {
			$('#' + my_field_id + '> .letter_container').html('?');
		} //if
	} //markFieldAsIncorrect

} //view

/*************************************************************************************************************************/
//CONTROL:

var control = {

	init: function(my_test_id) {
	//initialize loading of test and display, according to action
		//PROPERTIES:
		this.words_edited = false; //keeps track of whether answers have been edited since last grid generation
		this.current_input = false; //indicates whether an answer input is currently taking place (in run mode)
		
		Control.call(this); //make this inherit from Control (see js_general.js)

		view.init();
		crossword_test.init();

		switch (action) {
			case 'new':
				this.getTestNamesFromDb(0); //load test names from database for checking, see js_general.js
				break;
			case 'view':
				this.retrieveAndDisplayTest(my_test_id, true);
				break;
			case 'edit':
				this.retrieveAndDisplayTest(my_test_id, true);
				this.getTestNamesFromDb(my_test_id);
				break;
			case 'run':
				this.retrieveAndDisplayTest(my_test_id, false);
				break;
			default:
				break;
		} //switch

		if (typeof(Worker) === "undefined") { //no web worker support
			$.getScript(root_path + "js/crossword_generator.js"); //load the crossword generator code, so it can be called directly by function calls
		} //if

	}, //init

	addQuestion : function(my_question_object) {
	//adds a question to the model and (if appropriate) the view
	//params: my_question_object = obj (with at least properties: question_text, correct_answer)
		var question_object = crossword_test.addQuestionToModel(my_question_object);
		if (action == "edit" || action == "new") {
			view.addQuestionToView(question_object);
		} //if
	}, //addQuestion

	changeCorrectAnswer : function(my_question_id, my_new_text) {
	//if necessary, changes correct answer of given question in model to given text
		if (my_new_text != crossword_test.questions.objects[my_question_id].correct_answer) {
			crossword_test.questions.objects[my_question_id].correct_answer = my_new_text; //update test object
			crossword_test.questions.objects[my_question_id].edited = true;
			this.words_edited = true;
		} //if
	}, //changeCorrectAnswer

	changeQuestionText : function(my_question_id, my_new_text) {
	//if necessary, changes question text of given question in model to given text
		if (my_new_text != crossword_test.questions.objects[my_question_id].question_text) {
			crossword_test.questions.objects[my_question_id].question_text = my_new_text; //update test object
			crossword_test.questions.objects[my_question_id].edited = true;
		} //if
	}, //changeCorrectAnswer

	checkCorrectAnswer : function(my_answer) {
	//checks whether the given answer is a valid correct answer (no special characters etc.), if so returns true
		var regex = new RegExp("^[A-Z0-9]*$"); //only match letters a-z and numbers
    	if(regex.test(my_answer)){
    		return true;
    	} //if
    	return false;
	}, //checkCorrectAnswer

	checkRunTest : function() {
	//submits current solution of the user via AJAX, initializes display of feedback
		$.getJSON(root_path + 'php_crossword/crossword_managetests.php', {check_test_id : crossword_test.db_id, check_test : crossword_test.grid}, function(feedback) {
			view.displayScore(feedback.correct, crossword_test.questions.counter);
			for (var i = 0; i < feedback.wrong_fields.length; i++) {
				view.markFieldAsIncorrect('field_' + feedback.wrong_fields[i]);
			}//for
		});
	}, //checkRunTest

	checkUnplacedWords : function() {
	//checks whether the model contains words that are not placed in the current grid, returns array of unplaced words
		var unplaced_words = [];
		for (var i = 0; i < crossword_test.questions.counter; i++) {
			if ((crossword_test.questions.objects[i].number == null) && !(crossword_test.questions.objects[i].deleted)) { //word is not placed
				unplaced_words.push(crossword_test.questions.objects[i].correct_answer);
			} //if
		} //for
		return unplaced_words;
	}, //checkUnplacedWords

	deleteQuestion : function(my_question_id) {
	//sets question with the given ID to deleted
		crossword_test.questions.objects[my_question_id].deleted = true;
		if (crossword_test.questions.objects[my_question_id].position != null) {
			this.words_edited = true;
		} //if
	}, //deleteQuestion

	getQuestion : function(my_question_id) {
	//returns the question with the given ID from the model
		return crossword_test.questions.objects[my_question_id];
	}, //getQuestion

	getTestName : function(my_item_id) {
	//returns name of the test
		return crossword_test.test_name;
	}, //getTestName

	handleGeneratedCrossword : function(my_crossword_data) {
	//takes care of handling crossword delivered by the crossword generator
		crossword_test.grid_data.x = my_crossword_data.x_stop;
		crossword_test.grid_data.y = my_crossword_data.y_stop;
		crossword_test.grid_data.edited = true;
		this.words_edited = false;
		for (var i = 0; i < my_crossword_data.placed_words.length; i++) {
			var question_object = crossword_test.questions.objects[my_crossword_data.placed_words[i].word_id];
			question_object.position = my_crossword_data.placed_words[i].position;
			question_object.number = my_crossword_data.placed_words[i].number;
			question_object.edited = true;
			crossword_test.numbers[question_object.position.y + '_' + question_object.position.x] = question_object.number;
	 		crossword_test.placed_words.push(question_object);
		} //for
		for (var i = 0; i < my_crossword_data.unplaced_words.length; i++) {
			var question_object = crossword_test.questions.objects[my_crossword_data.unplaced_words[i].word_id];
			question_object.position = null;
			question_object.number = null;
		} //for
		this.initGrid(true);
		var unplaced_words = this.checkUnplacedWords();
		if (unplaced_words.length > 0) {
			alert('The following words could not be placed in the crossword: ' + unplaced_words.toString() + '. Delete or change these words and try generating a new crossword.');
		} //if
	}, //handleGeneratedCrossword

	initGenerateCrossword : function() {
	//initializes generation of crossword, storing and displaying result
		var words = [];
		var self = this;
		for (var i = 0; i < crossword_test.questions.counter; i++) {
			if (!crossword_test.questions.objects[i].deleted) {
				words.push( {word: crossword_test.questions.objects[i].correct_answer,
							question_text: crossword_test.questions.objects[i].question_text,
							word_id: crossword_test.questions.objects[i].current_id});
			} //if
		} //for
		crossword_test.resetGrid();
		if (typeof(Worker) !== "undefined") { //Web Worker supported
			var worker = new Worker(root_path + "js/crossword_generator.js"); //create a web worker to do the calculation
			worker.postMessage(words);
			worker.onmessage = function(event) {
				clearInterval(view.animation_interval);
				self.handleGeneratedCrossword(event.data);
			} //worker.onmessage   
		} //if 
		else { //no web worker support -> use function calls
			alert('Wait a few moments while your crossword is being generated!');
			clearInterval(view.animation_interval); //animation will not work in this case
		    var crossword_result = generateCrossword(words); //see crossword_generator.js
		    self.handleGeneratedCrossword(crossword_result);
		} //else
	}, //initGenerateCrossword

	initGrid : function(my_show_solution) {
	//initializes the calculation and display of the crossword grid
		crossword_test.calculateGrid(my_show_solution);
		view.displayCrossword(crossword_test.grid_data.x, crossword_test.grid_data.y, crossword_test.grid, crossword_test.numbers, crossword_test.placed_words);
	}, //initGrid

	processInput : function() {
	//replaces input fields that are currently in the crossword with their letters, updates the crossword_test grid to reflect the changes
		$('#crossword_grid').find('.letter_input_field').each(function() {
			var x = parseInt($(this).data('x'));
			var y = parseInt($(this).data('y'));
			crossword_test.grid[y][x] = $(this).val();
		}); 
		view.displayCrossword(crossword_test.grid_data.x, crossword_test.grid_data.y, crossword_test.grid, crossword_test.numbers, crossword_test.placed_words);
		view.checkCompleted();
	}, //processInput

	retrieveAndDisplayTest : function(my_test_id, my_solution) {
	//retrieves data of a test from the database, displays it in div test_container
	//params: my_test_id = INT; my_solution = bool (determines whether solution should be retrieved or not)
		crossword_test.db_id = my_test_id;
		var self = this;
		$.getJSON(root_path + 'php_crossword/crossword_managetests.php', {test_id : my_test_id, solution : my_solution}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Test could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				crossword_test.test_name = feedback.test_name;
				crossword_test.grid_data.x = feedback['grid']['grid_x'];
				crossword_test.grid_data.y = feedback['grid']['grid_y'];
				for (var i = 0; i < feedback.questions.length; i++) {
					self.addQuestion(feedback.questions[i]);
				} //for
				if (action == "view" || action == "run") {
					self.initGrid(false);
				} //if
				else {
					self.initGrid(true);
				} //else
			} //else
		});
	}, //retrieveAndDisplayTest

	saveTest : function() {
	//initializes saving of a test
		crossword_test.saveTestData();
		crossword_test.saveTestAndRedirect(action);
	} //saveTest

} //control


$(document).ready(function() {
	control.init(test_id);
});