/*************************************************************************************************************************
JS FOR DRAG&DROP TESTS
- contains JS necessary for creating & playing drag & drop tests
*************************************************************************************************************************/
var error = false;
var dynmc_test;
var user_score = 0;
var options_counter = 0; //needed to create unique names for options in run mode

$(document).ready(function() {

	/*************************************************************************************************************************/
	dynmc_test = new E_Test('dynmc'); //test object to hold the test data produced / edited here

	//extend the object with the necessary properties & methods for dynmc tests:
	dynmc_test.questions = {counter: 0, objects: {}, displayed: 0}; //holds question objects
	dynmc_test.current_question = 0; //pointer to which is the currently handled question (needed in run mode)
	dynmc_test.current_option = null; //keeps track of currently handled answer option (needed in run mode)

	dynmc_test.saveTestData = function() {
	//puts all test data into one object literal for easy database submission
		delete Question.prototype.randomizeAnswers; //delete method, for database submission
		this.test_data.questions = this.questions;
	} //saveTestData
	dynmc_test.retrieveAndDisplayTest = function(my_test_id, my_solution) {
	//retrieves data of a test from the database, displays it in div test_container
	//params: my_test_id = INT; my_solution = bool (determines whether solution should be retrieved or not)
		this.db_id = my_test_id;
		$.getJSON(root_path + 'php_dynmc/dynmc_managetests.php', {test_id : my_test_id, solution : my_solution}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Test could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				if (my_solution) { //display whole test for edit/view
					initDynmcTest(feedback.questions);
				} //if
				else {
					initRunningDynmcTest(feedback.questions);
				} //else
			} //else
		});
	} //retrieveAndDisplayTest

	//set correct test data, according to action:
	switch (action) {
		case 'new':
			generateDefaultQuestion(); //start with one default question
			$('#label_box_0').find('.show_pic').removeClass('show_pic').addClass('hide_pic').attr('src', root_path + 'images/arrow_down.png');
			$('#box_0').slideDown("slow");
			getTestNamesFromDb(0); //load test names from database for checking
			break;
		case 'view':
			dynmc_test.retrieveAndDisplayTest(test_id, true);
			break;
		case 'edit':
			dynmc_test.retrieveAndDisplayTest(test_id, true);
			getTestNamesFromDb(test_id); //load test names from database for checking
			break;
		case 'run':
			dynmc_test.retrieveAndDisplayTest(test_id, false);
			break;
		default:
			break;
	} //switch

	function initDynmcTest(my_question_objects) {
	//updates test object & displays all questions of the current test (in view or edit mode)
	//params: my_question_objects = array of question objects (each with question_ID, question_text, correct_answer, incorrect_answer)
		$('#questions').html('');
		for (i = 0; i < my_question_objects.length; i++) {
			var question_ID = addQuestionToObj(my_question_objects[i]);
			if (action == 'edit') {
				addSolvedQuestion(question_ID);
			} //if
			else {
				addUnsolvedQuestion(question_ID);
			} //else 
		} //for
	} //function displayDynmcTest

	function initRunningDynmcTest(my_question_objects) {
	//updates test object and initializes showing of single questions (in run mode)
	//params: my_question_objects = array of question objects (in random order, each with question_ID, question_text, answers)
		for (i = 0; i < my_question_objects.length; i++) {
			addQuestionToObj(my_question_objects[i]);
		} //for
		runQuestion(); //start running with first question
	} //function

	/*************************************************************************************************************************/
	
	//generate a default question:
	function generateDefaultQuestion() {
	//adds a question filled with default texts to the test (in edit/new mode)
		var question_obj = {question_text : '[QUESTION ' + (dynmc_test.questions.displayed + 1) + ']',
							correct_answer: '[CORRECT ANSWER]',
							incorrect_answers: ['[INCORRECT ANSWER 1]']};
		var question_ID = addQuestionToObj(question_obj);
		addSolvedQuestion(question_ID);
		$('#label_box_' + question_ID).find('.show_pic').click(); //slide this question down
	} //function generateDefaultQuestion

	$('#add_question').click(function(e) { //adds a new question on button click
		e.preventDefault();
		$('.hide_pic').click(); //slide all existing questions up
		generateDefaultQuestion();
	}); 

	/*************************************************************************************************************************/
	
	//add question to test object:
	function addQuestionToObj(my_question_object) {
	//adds a question to the test object, returns ID under which created question object is found
	//params: my_question_object = object (must have at least property: question_text)
		var current_id = dynmc_test.questions.counter;
		var question_object = new Question(current_id, my_question_object.question_text);
		if (action == "run") {
			question_object.answers = my_question_object.answers;
		} //if
		else {
			question_object.correct_answer = (my_question_object.correct_answer) ? my_question_object.correct_answer : my_question_object.question_correct_answer;
			question_object.incorrect_answers = my_question_object.incorrect_answers;
		} //else
		dynmc_test.questions.objects[current_id] = question_object;
		dynmc_test.questions.counter++;
		dynmc_test.questions.displayed++;
		if (my_question_object.question_ID) {
			dynmc_test.questions.objects[current_id].db_id = my_question_object.question_ID;
		} //if
		else {
			dynmc_test.questions.objects[current_id].newly_created = true;
		} //else
		return current_id;
	} //function addQuestionToObj

	/*************************************************************************************************************************/
	
	//add questions to display:
	function addSolvedQuestion(my_question_id) {
	//adds a solved version of a question to the display
	//params: my_question_id = INT (ID under which question object is found in dynmc_test)
		var question_object = dynmc_test.questions.objects[my_question_id];
		$('#questions').append('<div class="question border-theme-color" id="question_' + my_question_id + '" data-obj_id="' + my_question_id + '"> \
									<div class="label_box  bg-theme-color font-color-4" id="label_box_' + my_question_id + '"><div class="question_label" data-obj_id="' + my_question_id + '" id="label_' + my_question_id + '">' + question_object.question_text + '</div></div> \
									<div class="question_box bg-color-4" id="box_' + my_question_id + '" data-obj_id="' + my_question_id + '"> \
										<div class="css_table question_table" id="question_table_' + my_question_id + '"> \
											<div class="css_tr"> \
												<div class="css_td small_cell right_aligned"> \
													<img src="' + root_path + 'images/correct.png" class="pic_correct"> \
												</div> \
												<div class="css_td"> \
													<div class="correct_answer" id="correct_' + my_question_id + '" data-obj_id="' + my_question_id + '">' + question_object.correct_answer + '</div> \
												</div> \
												<div class="css_td small_cell"></div> \
											</div> \
										</div> \
									</div> \
								</div>');
		for (var i = 0; i < question_object.incorrect_answers.length; i++) {
			addIncorrectAnswerToDisplay(my_question_id, question_object.incorrect_answers[i], i);
		} //for
		if (action == 'new' || action == 'edit') { //make editing possible, if necessary
			$('#label_box_' + my_question_id).append('<div class="delete_question_button font-color-1" data-obj_id="' + my_question_id + '">X</div>');
			$('#box_' + my_question_id).append('<input type="submit" class="submit_button add_incorrect" id="add_incorrect_' + my_question_id + '" data-obj_id="' + my_question_id + '" value="Add Incorrect Answer">').hide();
			$('#label_' + my_question_id + ', #correct_' + my_question_id + ', .incorrect_answer_' + my_question_id).addClass('editable');
			$('#label_' + my_question_id).before('<img class="show_pic" data-obj_id="' + my_question_id + '" src="' + root_path + '/images/arrow_right.png">&nbsp;&nbsp;');
		} //if
	} //function addSolvedQuestion

	function addUnsolvedQuestion(my_question_id) {
	//adds an unsolved version of a question to the display
	//params: my_question_id = INT (ID under which question object is found in dynmc_test)
		var question_object = dynmc_test.questions.objects[my_question_id];
		question_object.randomizeAnswers();
		$('#questions').append('<div class="question border-theme-color" id="question_' + my_question_id + '" data-obj_id="' + my_question_id + '"> \
									<div class="label_box bg-theme-color font-color-4" id="label_box_' + my_question_id + '"><div class="question_label" data-obj_id="' + my_question_id + '" id="label_' + my_question_id + '">' + question_object.question_text + '</div></div> \
									<div class="question_box bg-color-4" id="box_' + my_question_id + '" data-obj_id="' + my_question_id + '"> \
										<ul class="answers_unsolved" id="answers_unsolved_' + my_question_id + '"></ul> \
									</div> \
								</div>');
		for (var i = 0; i < question_object.answers.length; i++) {
			$('#answers_unsolved_' + my_question_id).append('<li class="answer_option">' + question_object.answers[i] + '</li>');
		} //for
	} //function addUnsolvedQuestion

	/*************************************************************************************************************************/
	 
	//add incorrect answer options:
	function addIncorrectAnswerToDisplay(my_question_id, my_answer, my_answer_index) {
	//adds incorrect answer option to a question display
	//params: my_question_id = INT or 'new', my_answer = 'string', my_answer_index = INT, my_input_field = bool (indicating whether to add as input field or text)
		var incorrect_answer = '<div class="css_tr incorrect_row" id="incorrect_row_' + my_question_id + '_' + my_answer_index + '"> \
									<div class="css_td  right_aligned"> \
										<img src="' + root_path + 'images/incorrect.png" class="pic_incorrect"> \
									</div> \
									<div class="css_td "> \
										<div class="incorrect_answer incorrect_answer_' + my_question_id + '" id="incorrect_' + my_question_id + '_' + my_answer_index + '" data-obj_id="' + my_question_id + '" data-answer_id="' + my_answer_index + '">' + my_answer + '</div> \
									</div>';
		if (action == 'new' || action == 'edit') { //incorrect answer options can be deleted
			incorrect_answer += '<div class="css_td small_cell"><div class="delete_answer_button font-color-4" data-obj_id="' + my_question_id + '" data-answer_id="' + my_answer_index + '">X</div>';
		} //if
		else {
			incorrect_answer += '<div class="css_td small_cell"></div>';
		}
		incorrect_answer += '</div>';
		$('#question_table_' + my_question_id).append(incorrect_answer);
		if (action == 'new' || action == 'edit') {
			$('#incorrect_' + my_question_id + '_' + my_answer_index).addClass('editable');
		} //if
	} //function addIncorrectAnswer

	$(document).on('click', '.add_incorrect', function() { //click on plus sign -> add input field for new incorrect answer option
	 	var obj_id = $(this).data('obj_id');
	 	var incorrect_index = dynmc_test.questions.objects[obj_id].incorrect_answers.length;
	 	addIncorrectAnswerToDisplay(obj_id, '[INCORRECT ANSWER ' + (incorrect_index + 1) + ']', incorrect_index);
	 	dynmc_test.questions.objects[obj_id].incorrect_answers.push('[INCORRECT ANSWER ' + (incorrect_index + 1) + ']');
	 	$('#incorrect_' + obj_id + '_' + incorrect_index).click(); //trigger change to input field
	});

	/*************************************************************************************************************************/
	 
	//delete incorrect answer options:
	$(document).on('mouseover', '.label_box', function() {
		$(this).find('.delete_question_button').css('display', 'inline');
	});

	$(document).on('mouseleave', '.label_box', function() {
		$(this).find('.delete_question_button').css('display', 'none');
	});

	$(document).on('click', '.delete_answer_button', function() {
		var obj_id = $(this).data('obj_id');
		var incorrect_index = $(this).data('answer_id');
		if (dynmc_test.questions.objects[obj_id].incorrect_answers.length == 1) { //don't allow delete if only one incorrect answer
			alert("Every question must have at least one incorrect answer!");
		} //if
		else if (confirm('Are you sure you want to delete this answer option?')){
			dynmc_test.questions.objects[obj_id].incorrect_answers.splice(incorrect_index, 1); //remove from object
			dynmc_test.questions.objects[obj_id].edited = true;
			$('#question_table_' + obj_id + ' > .incorrect_row').remove(); //refresh display of incorrect answers
			for (var i = 0; i < dynmc_test.questions.objects[obj_id].incorrect_answers.length; i++) {
				addIncorrectAnswerToDisplay(obj_id, dynmc_test.questions.objects[obj_id].incorrect_answers[i], i);
			};
		} //else
	});

	/*************************************************************************************************************************/
	 
	//delete questions:
	$(document).on('mouseover', '.incorrect_row', function() {
		$(this).find('.delete_answer_button').css('display', 'inline');
		$(this).removeClass('bg-color-4').addClass('bg-color-2').addClass('font-color-4');
	});

	$(document).on('mouseleave', '.incorrect_row', function() {
		$(this).find('.delete_answer_button').css('display', 'none');
		$(this).removeClass('font-color-4').removeClass('bg-color-2').addClass('bg-color-4');
	});

	$(document).on('click', '.delete_question_button', function() {
		var obj_id = $(this).data('obj_id');
		if (dynmc_test.questions.displayed < 2) { //don't allow delete if only one question
			alert("Your test must contain at least one question!");
		} //if
		else if (confirm('Are you sure you want to delete this question?')){
			dynmc_test.questions.objects[obj_id].deleted = true;
			dynmc_test.questions.displayed--;
			$('#question_' + obj_id).remove(); //refresh display of incorrect answers
		} //else
	});

	/*************************************************************************************************************************/
	 
	//inline editing of questions and answer options:
	$(document).on('blur', '.editable_inputfield', function() {
		var new_text = $.trim($(this).val());
		if (new_text == '') {
			alert('Please enter some text!');
			$(this).focus();
			return;
		} //if
		var obj_id = $(this).closest('.non_editable').data("obj_id");
		if ($(this).parent().hasClass('question_label')) { //question text is edited
			dynmc_test.questions.objects[obj_id].question_text = new_text; //update test object
			dynmc_test.questions.objects[obj_id].edited = true;
		} //if
		else if ($(this).parent().hasClass('correct_answer')) {
			for (var i = 0; i < dynmc_test.questions.objects[obj_id].incorrect_answers.length; i++) {
				if (dynmc_test.questions.objects[obj_id].incorrect_answers[i] == new_text) { //another answer option with this text exists
					alert('You already have this answer option in your question. Choose another answer option!');
					$(this).focus();
					return;
				} //if
			} //for
			dynmc_test.questions.objects[obj_id].correct_answer = new_text; //update test object
			dynmc_test.questions.objects[obj_id].edited = true;
		} //else if
		else if ($(this).parent().hasClass('incorrect_answer')){
			var incorrect_index = $(this).parent().data("answer_id");
			for (var i = 0; i < dynmc_test.questions.objects[obj_id].incorrect_answers.length; i++) {
				if ((dynmc_test.questions.objects[obj_id].incorrect_answers[i] == new_text) && (i != incorrect_index)) { //another answer option with this text exists
					alert('You already have this answer option in your question. Choose another answer option!');
					$(this).focus();
					return;
				} //if
			} //for
			if (dynmc_test.questions.objects[obj_id].correct_answer == new_text) {
				alert('You already have this answer option in your question. Choose another answer option!');
				$(this).focus();
				return;
			} //if
			dynmc_test.questions.objects[obj_id].incorrect_answers[incorrect_index] = new_text; //update test object
			dynmc_test.questions.objects[obj_id].edited = true;
		} //else if
		$(this).closest('.non_editable').html(new_text).removeClass('non_editable').addClass('editable');
	});
	
	/*************************************************************************************************************************/
	
	//sliding answer options up and down:
	$(document).on('click', '.show_pic', function() {
		$(this).removeClass('show_pic').addClass('hide_pic').attr('src', root_path + 'images/arrow_down.png');
		var obj_id = $(this).data('obj_id');
		$('#box_' + obj_id).slideDown("slow");
	});

	$(document).on('click', '.hide_pic', function() {
		$(this).removeClass('hide_pic').addClass('show_pic').attr('src', root_path + 'images/arrow_right.png');
		var obj_id = $(this).data('obj_id');
		$('#box_' + obj_id).slideUp("slow");
	});
	
	/*************************************************************************************************************************/
	
	//add questions from database:
	$(document).on('click', '#show_questions_from_db', function() {
		$(this).attr('id', 'hide_questions_from_db').val('Hide Questions from Database');
		$('.db_questions').slideDown("slow");
	});

	$(document).on('click', '#hide_questions_from_db', function() {
		$(this).attr('id', 'show_questions_from_db').val('Add Questions from Database...');
		$('.db_questions').slideUp("slow");
	});

	$('#select_question_from_db').change(function() {
		$('#add_question_from_db').attr('disabled', false);
	});
	
	$('#add_question_from_db').click(function(e) {
		e.preventDefault();
		if (!$('#select_question_from_db').val()) {
			alert('Please select a question from the box!');
			return;
		} //if
		$(this).after('<em id="adding_msg">Adding Question...</em>');
		$(this).hide();
		$.getJSON(root_path + 'php_dynmc/dynmc_managetests.php', {question_id : $('#select_question_from_db').val()}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Question could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				var question_ID = addQuestionToObj(feedback);
				dynmc_test.questions.objects[question_ID].added_from_db = true;
				$('.hide_pic').click(); //slide all existing questions up
				addSolvedQuestion(question_ID);
				$('#label_box_' + question_ID).find('.show_pic').click(); //slide this question down
				$('#adding_msg').remove();
				$('#add_question_from_db').show();
			} //else
		});
	});

	/*************************************************************************************************************************/
	
	//switching between solved and unsolved view:
	$(document).on('click', '#show_solved', function() {
		$(this).attr('id', 'show_unsolved').val('Show Unsolved Test');
		$('#questions').html('');
		for (i = 0; i < dynmc_test.questions.counter; i++) {
			addSolvedQuestion(i); 
		} //for
	});

	$(document).on('click', '#show_unsolved', function() {
		$(this).attr('id', 'show_solved').val('Show Solved Test');
		$('#questions').html('');
		for (i = 0; i < dynmc_test.questions.counter; i++) {
			addUnsolvedQuestion(i); 
		} //for
	});

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
		if ($('#questions > .question').length < 1) { //at least one question
			alert('Your test must contain at least one question!');
			error = true;
		} //if

		//submission, if check yielded no errors:
		if (!error) {
			$('#test_container').html('<em>Saving...</em>');
			$('.db_questions').hide();
			dynmc_test.saveTestData();
			dynmc_test.saveTestAndRedirect(action);
		} //if
	});
	
	/*************************************************************************************************************************/
	
	//running Questions:
	function runQuestion() {
	//displays the current question of the test (see test object) in the run mode
		options_counter = 0;
		$('#questions').html('');
		var question_object = dynmc_test.questions.objects[dynmc_test.current_question];
		$('.intro_text').html("Decide whether this answer option is correct or incorrect.");
		$('#questions').append('<div class="question border-theme-color" id="current_question"> \
									<div class="label_box bg-theme-color font-color-4"> \
										<div class="question_label">' + question_object.question_text + '</div> \
									</div> \
									<div class="question_box bg-color-4"> \
										<div class="css_table question_table" id="current_question_table"> \
										</div> \
									</div> \
								</div>');
		getNewAnswerOption(); //show first answer option
	} //function runQuestion

	function getNewAnswerOption() {
	//retrieves next answer option from database, initialises displaying it
		var question_object = dynmc_test.questions.objects[dynmc_test.current_question];
		$.get(root_path + 'php_dynmc/dynmc_managetests.php', {new_option : true, question_ID : question_object.db_id}, function(feedback) { 
			if (feedback) {
				showAnswerOption(feedback, false);
			} //if
		});
	} //function getNewAnswerOption

	function showAnswerOption(my_text, my_solution) {
	//displays a answer option of the currently displayed question
	//params: my_text = string, my_solution = false (if no solution is shown) or 1||0
		$('.current_option').removeClass('current_option');
		$('.current_option_row').removeClass('current_option_row');			
		$('.user_answer').attr('disabled', true).attr('name', 'answer_' + options_counter).removeClass('user_answer'); //disable previous answer options
		options_counter++;
		
		$('#current_question_table').append('<div class="css_tr current_option_row"> \
												<div class="css_td medium_cell"> \
													<div class="radio_correct"><input type="radio" value="1" name="user_answer" class="user_answer"><img src="' + root_path + 'images/correct.png" class="pic_correct"></div> \
													<div class="radio_incorrect"><input type="radio" value="0" name="user_answer" class="user_answer radio_incorrect"><img src="' + root_path + 'images/incorrect.png" class="pic_incorrect"></div> \
												</div> \
												<div class="css_td small_cell"> \
												| \
												</div> \
												<div class="css_td" class="current_option"> \
													' + my_text + ' \
												</div> \
											</div>');
		if (my_solution !== false) {
			$("input[name='user_answer'][value='" + my_solution + "']").attr("checked","checked");
		} //false
	} //function showAnswerOption

	function endQuestion(my_answer_options) {
	//displays solved version of question
	//params: my_answer_options = array
		for (var i = 0; i < my_answer_options.length; i++) {
			showAnswerOption(my_answer_options[i][1], my_answer_options[i][0]);
		} //for
		$('.user_answer').attr('disabled', true);
		$('#ready_button').hide();
		dynmc_test.current_question++;
		if (dynmc_test.current_question < dynmc_test.questions.counter) { //questions left to display
			$('#next_question').show();
		} //if
		else {
			$('#show_result').show();
		} //else
	} //function endQuestion

	$('#ready_button').click(function(e) {
		e.preventDefault();
		if (!$("input[name='user_answer']:checked").val()) { //no answer selected
			alert('Please select an answer!');
			return;
		} //if
		var question_object = dynmc_test.questions.objects[dynmc_test.current_question];
		$.getJSON(root_path + 'php_dynmc/dynmc_managetests.php', {option: dynmc_test.current_option, user_answer : $("input[name='user_answer']:checked").val(), question_ID : question_object.db_id}, function(feedback) {
			if (feedback.answer_option == '0') { //incorrect answer has been hit
				if ($("input[name='user_answer']:checked").val() == '0') { //user was right -> show next answer option
					$('.current_option_row').find('.pic_incorrect').attr('src', root_path + 'images/incorrect_green.png');
					$('.intro_text').html('Well done!');
					getNewAnswerOption();
				} //if
				else {
					$('.intro_text').html("Sorry! You have not solved this question correctly!");
					$('.current_option_row').find('.pic_correct').attr('src', root_path + 'images/correct_red.png');
					endQuestion(feedback.solved_options);
				} //else
			} //if
			else { //correct answer has been hit
				if ($("input[name='user_answer']:checked").val() == '1') { //user was right
					$('.current_option_row').find('.pic_correct').attr('src', root_path + 'images/correct_green.png');
					$('.intro_text').html("Congrats! You have solved this question correctly!");
					user_score++;
				} //if
				else {
					$('.current_option_row').find('.pic_incorrect').attr('src', root_path + 'images/incorrect_red.png');
					$('.intro_text').html("Sorry! You have not solved this question correctly!");
				} //else
				endQuestion(feedback.solved_options);
			} //else
		});
	});

	$('#next_question').click(function(e) {
		e.preventDefault();
		$(this).hide();
		$('#ready_button').show();
		runQuestion();
	});

	$('#show_result').click(function(e) {
		e.preventDefault();
		$(this).hide();
		$('#test_container').html('Your score: ' + user_score + ' out of ' + dynmc_test.questions.counter + ' correct!');
	});
	
}); //document ready function

/*************************************************************************************************************************/

//class declarations for questions:
function Question(my_current_id, my_question_text) {
//represents one question
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.question_text = my_question_text;
	this.answers = []; //holds all answer options (for run mode)
	this.correct_answer = null; //set only if not in run mode
	this.incorrect_answers = []; //set only if not in run mode
	this.added_from_db = false; //to be set for questions from DB that are added as new question to test
} //function Item

Question.prototype.randomizeAnswers = function() {
//stores a randomized array of all answer options in the property
	this.answers = []; //remove previous randomized version

	var all_answers = this.incorrect_answers.slice(); //slice() to make a shallow copy of the array
	all_answers.push(this.correct_answer);
	var counter = all_answers.length;

	for (var i = counter; i > 0; i--){
		var my_random = Math.random();
		var my_index = Math.round(my_random * (i - 1)); 
		this.answers.push(all_answers.splice(my_index, 1)[0]); 
	} //for
} //randomizeAnswers()