/*************************************************************************************************************************
JS FOR CROSSWORD TESTS
- contains JS necessary for creating & playing crossword tests
*************************************************************************************************************************/

$(document).ready(function() {
	/*************************************************************************************************************************/
	crossword_test = new E_Test('crossword'); //test object to hold the test data produced / edited here

	//extend the object with the necessary properties & methods for drag&drop tests:
	crossword_test.questions = {counter: 0, objects: {}, displayed: 0}; //holds question objects
	crossword_test.grid = {x: null, y: null}; //holds dimenstions of grid (filled when crossword is calculated)

	//set correct test data, according to action:
	switch (action) {
		case 'new':
			$.getScript(root_path + "js/crossword_generator.js"); //load the crossword generator code
			getTestNamesFromDb(0); //load test names from database for checking
			break;
		case 'view':
			break;
		case 'edit':
			getTestNamesFromDb(test_id); //load test names from database for checking
			break;
		case 'run':
			break;
		default:
			break;
	} //switch

	/*************************************************************************************************************************/

	//adding questions:

	function addQuestionToObj(my_question_object) {
	//adds a question to the test object
	//params: my_question_object = obj (with at least properties: question_text, correct_answer)
		var current_id = crossword_test.questions.counter;
		var question_object = new Question(current_id, my_question_object.question_text);

		if (action == 'new' || action == "edit") {
			question_object.correct_answer = (my_question_object.correct_answer) ? my_question_object.correct_answer : my_question_object.question_correct_answer;
		} //if

		crossword_test.questions.objects[current_id] = question_object;
		crossword_test.questions.counter++;
		crossword_test.questions.displayed++;
		if (my_question_object.question_ID) {
			crossword_test.questions.objects[current_id].db_id = my_question_object.question_ID;
		} //if
		else {
			crossword_test.questions.objects[current_id].newly_created = true;
		} //else

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
		if (crossword_test.questions.displayed > 1) { //at least two questions -> allow crossword creation
			$('#crossword_container').html('<em>Generating your crossword...</em>');
			var words = [];
			for (var i = 0; i < crossword_test.questions.counter; i++) {
				if (!crossword_test.questions.objects[i].deleted) {
					words.push( {word: crossword_test.questions.objects[i].correct_answer,
								question: crossword_test.questions.objects[i].question_text,
								word_id: crossword_test.questions.objects[i].current_id});
				} //if
			} //for
			var worker = new Worker(root_path + "js/crossword_generator.js"); //create a web worker to do the calculation
			worker.postMessage(words);
			worker.onmessage = function(event) {
				var crossword = event.data;
				displaySolvedCrossword(crossword);
				//storeCrosswordToTestObj(crossword);
			}
		} //if
		else {
			alert("Please add more words to your crossword test!");
		} //else
	});

	/*************************************************************************************************************************/

	//display crossword:
	function displaySolvedCrossword(my_crossword_obj) {
	//displays a solved version of the given crossword
	//params: my_crossword_obj = object delivered by crossword_generator.js
		var grid_string = '<div id="crossword_grid">';
		for (var i = my_crossword_obj.y_start; i <= my_crossword_obj.y_stop; i++) {
			grid_string += '<div class="cw_row">';
			for (var j = my_crossword_obj.x_start; j <= my_crossword_obj.x_stop; j++) {
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
			grid_string += my_crossword_obj.placed_words[i].number + ': ' + my_crossword_obj.placed_words[i].question + '<br>';
		} //for
		grid_string += '</div>';
		$('#crossword_container').html(grid_string);
		$('#crossword_grid').width(((my_crossword_obj.x_stop + 1) * 32) + 'px');
	} //displaySolvedCrossword

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