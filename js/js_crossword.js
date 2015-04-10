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
			//$.getScript(root_path + "js/crossword_generator.js"); //load the crossword generator code
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
					words.push(crossword_test.questions.objects[i].correct_answer);
				} //if
			} //for
			var worker = new Worker(root_path + "js/crossword_generator.js"); //create a web worker to do the calculation
			worker.postMessage(words);
			worker.onmessage = function(event) {
				$('#crossword_container').html(event.data);
			}
		} //if
		else {
			alert("Please add more words to your crossword test!");
		} //else
	});

}); //document ready function

/*************************************************************************************************************************/

//class declarations for questions:
function Question(my_current_id, my_question_text) {
//represents one draggable item
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.question_text = my_question_text;
	this.correct_answer = null; //set only if not in run mode
} //function Item