/*************************************************************************************************************************
JS FOR CROSSWORD TESTS
- contains JS necessary for creating & playing crossword tests
*************************************************************************************************************************/

$(document).ready(function() {
	/*************************************************************************************************************************/
	crossword_test = new E_Test('crossword'); //test object to hold the test data produced / edited here

	//extend the object with the necessary properties & methods for drag&drop tests:
	crossword_test.questions = {counter: 0, objects: {}, displayed: 0}; //holds question objects
	crossword_test.grid = {x: null, y: null, edited: false}; //holds dimenstions of grid (filled when crossword is calculated)
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
			crossword_test.retrieveAndDisplayTest(test_id, true, false);
			break;
		case 'edit':
			getTestNamesFromDb(test_id); //load test names from database for checking
			break;
		case 'run':
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
			addQuestionToObj(my_test_data.questions[i]);
		} //for
		if (action == "view") {
			crossword_test.calculateCrosswordObj(false);
			displayCrossword(crossword_test.crossword);
		} //if
	} //initCrosswordTest

	/*************************************************************************************************************************/

	//adding questions:

	function addQuestionToObj(my_question_object) {
	//adds a question to the test object
	//params: my_question_object = obj (with at least properties: question_text, correct_answer)
		var current_id = crossword_test.questions.counter;
		var question_object = new Question(current_id, my_question_object.question_text);

		if (action == 'new' || action == "edit" || action == "view") {
			question_object.correct_answer = (my_question_object.correct_answer) ? my_question_object.correct_answer : my_question_object.question_correct_answer;
			question_object.correct_answer = question_object.correct_answer.toUpperCase();
		} //if

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
		$('#new_question_row').before('<div class="css_tr" id="question_row_' + my_question_id + '"> \
											<div class="css_td">' + question_object.question_text + '</div> \
											<div class="css_td">' + question_object.correct_answer + '</div> \
										</div>');
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
		var grid_string = '<div id="crossword_grid">';
		for (var i = 0; i <= my_crossword_obj.y_stop; i++) {
			grid_string += '<div class="cw_row">';
			for (var j = 0; j <= my_crossword_obj.x_stop; j++) {
				if (my_crossword_obj.grid[i][j] == '//') {
					grid_string += '<div class="empty_field">&nbsp;</div>';
				} //if
				else {
					grid_string += '<div class="filled_field"><div class="number_container">';
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
				grid_string += '<h3>ACROSS</h3>';
				across = true;
			} //if
			else if (my_crossword_obj.placed_words[i].position.orientation == 1 && !down) { //add the headline for horizontal words
				grid_string += '<h3>DOWN</h3>';
				down = true;
			} //else if
			grid_string += my_crossword_obj.placed_words[i].number + ': ' + my_crossword_obj.placed_words[i].question_text + '<br>';
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
		for (var i = 0; i < crossword_test.questions.counter; i++) {
			if ((crossword_test.questions.objects[i].number == null) && !(crossword_test.questions.objects[i].deleted)) { //word is not placed
				alert('One or more words are not placed in the crossword. Delete these words, or change them and generate a new crossword.');
				error = true;
			} //if
		} //for

		//submission, if check yielded no errors:
		if (!error) {
			$('#test_container').html('<em>Saving...</em>');
			crossword_test.saveTestData();
			crossword_test.saveTestAndRedirect(action);
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