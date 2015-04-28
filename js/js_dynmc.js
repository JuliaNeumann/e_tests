/*************************************************************************************************************************
JS FOR DYNMC TESTS
- contains JS necessary for creating & playing dynamic multiple choice tests
*************************************************************************************************************************/

//MODEL:

var dynmc_test = {

	init : function() {
		//PROPERTIES:
		this.questions = {counter: 0, objects: {}}; //holds question objects

		E_Test.call(this, 'dynmc'); //make this inherit from E_Test (see js_general.js)
	}, //init

	setTestData : function() {
	//puts all test data into one object literal for easy database submission
		delete Question.prototype.randomizeAnswers; //delete method, for database submission
		this.test_data.questions = this.questions;
	}, //setTestData

	addQuestionToModel : function(my_question_object) {
	//adds a question to the test object, returns created question object
	//params: my_question_object = object (must have at least property: question_text)
		var question_object = new Question(this.questions.counter, my_question_object.question_text);
		if (action == "run") {
			question_object.answers = my_question_object.answers;
		} //if
		else {
			question_object.correct_answer = (my_question_object.correct_answer) ? my_question_object.correct_answer : my_question_object.question_correct_answer;
			question_object.incorrect_answers = my_question_object.incorrect_answers;
		} //else
		if (my_question_object.question_ID) {
			question_object.db_id = my_question_object.question_ID;
		} //if
		else {
			question_object.newly_created = true;
		} //else

		this.questions.objects[this.questions.counter] = question_object;
		this.questions.counter++;
		
		return question_object;
	} //function addQuestionToObj

} //dynmc_test

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

/*************************************************************************************************************************/
//VIEW:

var view = {

	init : function() {
		//PROPERTIES:
		this.questions_displayed = 0;
		this.questions_container = $('#questions');
		this.instructions_container = $('.instructions');
		this.question_template = $('script[data-template="question"]').html();
		this.answer_solved_template = $('script[data-template="answer_solved"]').html();
		this.answer_unsolved_template = $('script[data-template="answer_unsolved"]').html();
		this.new_incorrect_answer_template = $('script[data-template="new_incorrect_answer"]').html();
		this.add_question_template = $('script[data-template="add_question"]').html();
		this.answer_run_template = $('script[data-template="answer_run"]').html();

		View.call(this); //make this inherit from View (see js_general.js)

		var self = this;

		/*************************************************************/

		//EVENT HANDLERS:
		//switching between solved and unsolved view:
		$(document).on('click', '#show_solved', function() {
			$(this).attr('id', 'show_unsolved').val('Show Unsolved Test');
			self.toggleSolution(true);
		});
		$(document).on('click', '#show_unsolved', function() {
			$(this).attr('id', 'show_solved').val('Show Solved Test');
			self.toggleSolution(false);
		});

		/*************************************************************/
		//adding new questions:
		$(document).on('click', '#add_question', function(e) {
			e.preventDefault();
			var question_text = $.trim($('#new_question_text').val());
			var error = '';
			if (question_text == '' || question_text == 'New Question...') {
				error += "Please provide a question text! ";
			} //if
			var correct_answer = $.trim($('#new_correct_answer').val());
			if (correct_answer == '' || correct_answer == 'New Correct Answer...') {
				error += "Please provide a correct answer! "
			} //if
			var incorrect_answers = [];
			var duplicate = false;
			var counter = 0;
			for (var i = 0; i <= control.current_option; i++) {
				if (!($('#new_incorrect_row_' + i).hasClass('deleted'))) { //has not been deleted from display
					counter++;
					var answer = $.trim($('#new_incorrect_answer_' + i).val());
					if (answer == '' || answer == 'New Incorrect Answer...') {
						error += "Please provide incorrect answer number " + counter + "! ";
					} //if
					if ((($.inArray(answer, incorrect_answers) !== -1) || (answer == correct_answer)) && !duplicate) {
						duplicate = true;
						error += "Some answer options appear more than once in this question. ";
					} //if
					incorrect_answers.push(answer);
				} //if
			} //for
			if (error != '') {
				alert(error);
				return;1	
			} //if
			control.addQuestion({'question_text' : question_text, 'correct_answer' : correct_answer, 'incorrect_answers' : incorrect_answers});
			control.current_option = 0;
			$('#new_question_text').val('New Question...').select();
			$('#new_correct_answer').val('New Correct Answer...');
			$('.new_incorrect_answer').val('New Incorrect Answer...');
			$('.new_incorrect_row').remove();
		});
		$(document).on('click', '#add_new_incorrect', function(e) {
			e.preventDefault();
			control.current_option++;
			var incorrect_html = self.new_incorrect_answer_template.replace(/{{index}}/g, control.current_option);
			$('#new_question_table').append(incorrect_html);
			$('.new_incorrect_answer').last().select();
		});
		$(document).on('click', '.delete_new_answer_button', function(e) {
			if (confirm('Are you sure you want to delete this answer option?')) {	
				var index = $(this).data("index");
				$('#new_incorrect_row_' + index).hide().addClass('deleted');
			} //if
		});

		/*************************************************************/
		//delete question and incorrect answer options:
		$(document).on('mouseover', '.label_box', function() {
			$(this).find('.delete_question_button').css('display', 'inline');
		});
		$(document).on('mouseleave', '.label_box', function() {
			$(this).find('.delete_question_button').css('display', 'none');
		});
		$(document).on('click', '.delete_question_button', function() {
			if (self.questions_displayed < 2) { //don't allow delete if only one question
				alert("Your test must contain at least one question!");
			} //if
			else if (confirm('Are you sure you want to delete this question?')){
				control.deleteQuestion($(this).data('obj_id'));
			} //else
		});
		$(document).on('mouseover', '.incorrect_row', function() {
			if (($(this).find('.incorrect_answer').data('answer_id') != 0) && (action != "view")) {
				$(this).find('.delete_answer_button').css('display', 'inline');
				$(this).removeClass('bg-color-4').addClass('bg-color-2').addClass('font-color-4');
			} //if
		});
		$(document).on('mouseleave', '.incorrect_row', function() {
			$(this).find('.delete_answer_button').css('display', 'none');
			$(this).removeClass('font-color-4').removeClass('bg-color-2').addClass('bg-color-4');
		});
		$(document).on('click', '.delete_answer_button', function() {
			var obj_id = $(this).data('obj_id');
			var incorrect_index = $(this).data('answer_id');
			if (!control.checkIncorrectAnswers(obj_id)) { //don't allow delete if only one incorrect answer - just to make sure
				alert("Every question must have at least one incorrect answer!");
			} //if
			else if (confirm('Are you sure you want to delete this answer option?')){
				control.deleteIncorrectAnswer(obj_id, incorrect_index);
			} //else
		});

		/*************************************************************/
		//sliding answer options up and down:
		$(document).on('click', '.show_pic', function() {
			$(this).removeClass('show_pic').addClass('hide_pic').attr('src', root_path + 'images/arrow_down.png');
			var obj_id = $(this).data('obj_id');
			$('#box_' + obj_id).slideDown("slow");
			$('#label_box_' + obj_id).css('border-bottom-width', '3px');
		});
		$(document).on('click', '.hide_pic', function() {
			$(this).removeClass('hide_pic').addClass('show_pic').attr('src', root_path + 'images/arrow_right.png');
			var obj_id = $(this).data('obj_id');
			$('#box_' + obj_id).slideUp("slow");
			$('#label_box_' + obj_id).css('border-bottom-width', '0px');
		});

		/*************************************************************/
		//add incorrect answer options to existing question:
		$(document).on('click', '.add_incorrect', function() {
		 	var obj_id = $(this).data('obj_id');
		 	var incorrect_index = control.addDefaultIncorrectAnswer(obj_id);
		 	self.addIncorrectAnswerToView(obj_id, 'New Incorrect Answer...', incorrect_index);
		 	$('#incorrect_' + obj_id + '_' + incorrect_index).click(); //trigger change to input field
		});

		/*************************************************************/
		//inline editing of questions and answer options:
		$(document).on('blur', '.editable_inputfield', function() {
			var new_text = $.trim($(this).val());
			if (new_text == '') {
				alert('Please enter some text!');
				$(this).focus();
				return;
			} //if
			var obj_id = $(this).closest('.non_editable').data("obj_id");
			if ($(this).parent().hasClass('question_label')) {
				control.changeQuestionText(obj_id, new_text);
			} //if
			else if ($(this).parent().hasClass('correct_answer')) {
				if (!control.checkNewCorrectAnswer(obj_id, new_text)) {
					alert('You already have this answer option in your question. Choose another answer option!');
					$(this).focus();
					return;
				} //if
				control.changeCorrectAnswer(obj_id, new_text);
			} //else if
			else if ($(this).parent().hasClass('incorrect_answer')){
				var incorrect_index = $(this).parent().data("answer_id");
				if (!control.checkNewIncorrectAnswer(obj_id, new_text, incorrect_index)) {
					alert('You already have this answer option in your question. Choose another answer option!');
					$(this).focus();
					return;
				} //if
				control.changeIncorrectAnswer(obj_id, new_text, incorrect_index);
			} //else if
			$(this).closest('.non_editable').html(new_text).removeClass('non_editable').addClass('editable');
		});

		/*************************************************************/
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
			if (!$('#select_question_from_db').val()) { //just to make sure
				alert('Please select a question from the box!');
				return;
			} //if
			$(this).after('<em id="adding_msg">Adding Question...</em>');
			$(this).hide();
			control.addQuestionFromDb($('#select_question_from_db').val());
		});

		/*************************************************************/
		//save test to database
		$(document).on('click', '#save_test', function(e) {
			e.preventDefault();

			//check submission for completeness & correctness:
			var error = false;
			if (!self.checkForm('#general_info_form')) {
				error = true;
			} //if
			if (!control.checkTestName()) {
				error = true;
			} //if
			if (self.questions_displayed < 1) { //just to make sure
				alert('Your test must contain at least one question!');
				error = true;
			} //if

			//submission, if check yielded no errors:
			if (!error) {
				self.disableButtons(); //see js_general.js
				self.setHTMLContent('test_container', '<em>Saving...</em>');
				$('.db_questions').hide();
				control.saveTest();
			} //if
		});

		/*************************************************************/
		//running the test
		$(document).on('click', 'input[name="user_answer"]', function() {
			$('#ready_button').attr('disabled', false);
		});
		$('#ready_button').click(function(e) {
			e.preventDefault();
			if (!$("input[name='user_answer']:checked").val()) { //no answer selected
				alert('Please select an answer!');
				return;
			} //if
			control.evaluateAnswer($("input[name='user_answer']:checked").val());
			$(this).attr('disabled', true);
		});
		$('#next_question').click(function(e) {
			e.preventDefault();
			$(this).hide();
			$('#ready_button').show();
			control.runQuestion();
		});
		$('#show_result').click(function(e) {
			e.preventDefault();
			$(this).hide();
			self.displayScore(control.user_score, control.getNoOfQuestions());
			self.questions_container.html('');
		});
	}, //init

	addQuestionToView : function(my_question_object, my_solved) {
	//displays the given question
	//params: my_question_object = object, my_solved = bool (indicating whether display question as solved or not)
		var current_id = my_question_object.current_id;
		var question_html = this.question_template.replace(/{{id}}/g, current_id); //fill the template
		question_html = question_html.replace(/{{text}}/g, my_question_object.question_text);
		this.questions_container.append(question_html);
		this.questions_displayed++;

		if ((action == "view") && !my_solved) {
			for (var i = 0; i < my_question_object.answers.length; i++) {
				var answer_html = this.answer_unsolved_template.replace(/{{text}}/g, my_question_object.answers[i]);
				$('#question_table_' + current_id).append(answer_html);
			} //for
		} //if
		else if (my_solved) {
			var map = {"{{id}}" : current_id, "{{correct}}": "correct", "{{text}}": my_question_object.correct_answer, "{{answer_index}}" : 0};
			var answer_html = this.answer_solved_template.replace(/{{id}}|{{correct}}|{{text}}|{{answer_index}}/g, function(my_str){ return map[my_str]; });
			$('#question_table_' + current_id).append(answer_html);
			for (var i = 0; i < my_question_object.incorrect_answers.length; i++) {
				this.addIncorrectAnswerToView(current_id, my_question_object.incorrect_answers[i], i);
			} //for
		} //else if

		if (action == 'new' || action == 'edit') { //make editing possible, if necessary
			$('#label_box_' + current_id).append('<div class="delete_question_button font-color-1" data-obj_id="' + current_id + '">X</div>');
			$('#box_' + current_id).append('<input type="submit" class="submit_button add_incorrect" id="add_incorrect_' + current_id + '" data-obj_id="' + current_id + '" value="Add Incorrect Answer">').hide();
			$('#label_' + current_id + ', #correct_' + current_id + '_0, .incorrect_answer_' + current_id).addClass('editable');
			$('#label_' + current_id).before('<img class="show_pic" data-obj_id="' + current_id + '" src="' + root_path + '/images/arrow_right.png">&nbsp;&nbsp;');
		} //if
	}, //addQuestionToView

	addIncorrectAnswerToView : function(my_question_id, my_answer, my_answer_index) {
	//adds incorrect answer option to a question display
	//params: my_question_id = INT, my_answer = 'string', my_answer_index = INT (position of answer in object's array)
		var map = {"{{id}}" : my_question_id, "{{correct}}": "incorrect", "{{text}}": my_answer, "{{answer_index}}" : my_answer_index};
		var answer_html = this.answer_solved_template.replace(/{{id}}|{{correct}}|{{text}}|{{answer_index}}/g, function(my_str){ return map[my_str]; });
		$('#question_table_' + my_question_id).append(answer_html);
		if (action == 'new' || action == 'edit') { //incorrect answer options can be deleted
			$('#delete_cell_' + my_question_id + '_' + my_answer_index).append('<div class="delete_answer_button font-color-4" data-obj_id="' + my_question_id + '" data-answer_id="' + my_answer_index + '">X</div>');
			$('#incorrect_' + my_question_id + '_' + my_answer_index).addClass('editable');
		} //if
	}, //addIncorrectAnswerToView

	deleteQuestionFromView : function(my_question_id) {
	//deletes the given question from the display
		this.questions_displayed--;
		$('#question_' + my_question_id).remove();
	}, //deleteQuestionFromView

	refreshIncorrectAnswers : function(my_question_object) {
	//refreshes display of incorrect answers of given question
		$('#question_table_' + my_question_object.current_id + ' > .incorrect_row').remove(); //refresh display of incorrect answers
		for (var i = 0; i < my_question_object.incorrect_answers.length; i++) {
			this.addIncorrectAnswerToView(my_question_object.current_id, my_question_object.incorrect_answers[i], i);
		} //for
	}, //refreshIncorrectAnswers

	toggleSolution : function(my_solved) {
	//changes display between solved (my_solved == true) and unsolved display
		this.setHTMLContent(this.questions_container.attr('id'), '');
		control.current_question = 0;
		var counter = this.questions_displayed;
		this.questions_displayed = 0;
		for (var i = 0; i < counter; i++) {
			this.addQuestionToView(control.getCurrentQuestion(), my_solved);
			control.current_question++;
		} //for
	}, //toggleSolution

	addQuestionForm : function() {
	//adds the form to add new questions to the display
		this.questions_container.after(this.add_question_template);
	}, //addQuestionForm

	cleanAfterAddingFromDb : function() {
	//resets the section for adding questions from database
		$('#adding_msg').remove();
		$('#add_question_from_db').show();
	}, //cleanAfterAddingFromDb

	initRunQuestion : function(my_question_object) {
	//initializes display of a question in run mode
		this.questions_container.html('');
		this.addQuestionToView(my_question_object);
		$('.question_table').attr('id', 'current_question_table');
		this.instructions_container.html("Decide whether this answer option is correct or incorrect. Click \"Check\" when you have made your choice.");
		$('#ready_button').attr('disabled', true);
	}, //initRunQuestion

	showAnswerOption : function(my_text, my_solution) {
	//displays a answer option of the currently displayed question
	//params: my_text = string, my_solution = false (if no solution is shown) or 1||0
		$('.current_option').removeClass('current_option');
		$('.current_option_row').removeClass('current_option_row');			
		$('.user_answer').attr('disabled', true).attr('name', 'answer_' + control.options_counter).removeClass('user_answer'); //disable previous answer options
		control.options_counter++;
		
		var answer_html = this.answer_run_template.replace(/{{text}}/g, my_text);
		$('#current_question_table').append(answer_html);
		if (my_solution !== false) {
			$("input[name='user_answer'][value='" + my_solution + "']").attr("checked","checked");
		} //false
	}, //showAnswerOption

	markAnswerAsCorrect : function(my_correct, my_continue) {
	//marks the current answer option as answered correctly & displays feedback
	//params: my_correct = string ("correct" or "incorrect"), my_continue = bool (indicates whether to continue or question is finished)
		$('.current_option_row').find('.pic_' + my_correct).attr('src', root_path + 'images/' + my_correct + '_green.png');
		if (my_continue) {
			this.instructions_container.html('Well done! How about this answer option?');
		} //if
		else {
			this.instructions_container.html('Congratulations! You have solved this question correctly!');
		} //else
	}, //markAnswerAsCorrect

	markAnswerAsIncorrect : function(my_correct) {
	//marks the current answer option as answered incorrectly & displays feedback
	//params: my_correct = string ("correct" or "incorrect")
		$('.current_option_row').find('.pic_' + my_correct).attr('src', root_path + 'images/' + my_correct + '_red.png');
		this.instructions_container.html("Sorry! You have not solved this question correctly!");
	}, //markAsCorrect

	endQuestion : function(my_answer_options) {
	//initializes display solved version of question
	//params: my_answer_options = array
		for (var i = 0; i < my_answer_options.length; i++) {
			this.showAnswerOption(my_answer_options[i][1], my_answer_options[i][0]);
		} //for
		$('.user_answer').attr('disabled', true);
		$('#ready_button').hide();
		if (control.current_question < control.getNoOfQuestions()) { //questions left to display
			$('#next_question').show();
		} //if
		else {
			$('#show_result').show();
		} //else
	} //endQuestion
} //view

/*************************************************************************************************************************/
//CONTROL:

var control = {

	init: function(my_test_id) {
	//initialize loading of test and display, according to action
		//PROPERTIES:
		this.current_question = 0; //pointer to which is the currently handled question
		this.current_option = null; //keeps track of currently handled answer option
		this.options_counter = 0; //needed to create unique names for options in run mode
		this.user_score = 0;

		Control.call(this); //make this inherit from Control (see js_general.js)

		view.init();
		dynmc_test.init();

		switch (action) {
			case 'new':
				view.addQuestionForm();
				this.getTestNamesFromDb(0); //load test names from database for checking, see js_general.js
				break;
			case 'view':
				this.retrieveAndDisplayTest(test_id, true);
				break;
			case 'edit':
				this.retrieveAndDisplayTest(test_id, true);
				view.addQuestionForm();
				this.getTestNamesFromDb(my_test_id);
				break;
			case 'run':
				this.retrieveAndDisplayTest(test_id, false);
				break;
			default:
				break;
		} //switch
	}, //init

	retrieveAndDisplayTest : function(my_test_id, my_solution) {
	//retrieves data of a test from the database, initializes its display and stores it in model
	//params: my_test_id = INT; my_solution = bool (determines whether solution should be retrieved or not)
		dynmc_test.db_id = my_test_id;
		var self = this;
		$.getJSON(root_path + 'php_dynmc/dynmc_managetests.php', {test_id : my_test_id, solution : my_solution}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Test could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				view.setHTMLContent(view.questions_container.attr('id'), '');
				for (i = 0; i < feedback.questions.length; i++) {
					self.addQuestion(feedback.questions[i]);	
				} //for
				if (!my_solution) { //in run mode -> start with first question
					self.runQuestion();
				} //if
			} //else
		});
	}, //retrieveAndDisplayTest

	addQuestion : function(my_question_obj) {
	//adds question to the display and the model, return ID under which object is found
	//params: my_question_obj = object (with at least question_text)
		var question_object = dynmc_test.addQuestionToModel(my_question_obj);
		if (action == 'edit' || action == 'new') {
			view.addQuestionToView(question_object, true);
		} //if
		else if (action == 'view'){
			question_object.randomizeAnswers();
			view.addQuestionToView(question_object, false);
		} //else
		return question_object.current_id;
	}, //addQuestion

	addQuestionFromDb : function(my_question_id) {
	//retrieves the question with the given ID from the database and adds it to view and model
		var self = this;
		$.getJSON(root_path + 'php_dynmc/dynmc_managetests.php', {question_id : my_question_id}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Question could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				var current_id = self.addQuestion(feedback);
				dynmc_test.questions.objects[current_id].added_from_db = true;
				view.cleanAfterAddingFromDb();
			} //else
		});
	}, //addQuestionFromDb

	deleteQuestion : function(my_question_id) {
	//delete Question from model and view
		dynmc_test.questions.objects[my_question_id].deleted = true;
		view.deleteQuestionFromView(my_question_id);
	}, //deleteQuestion

	addDefaultIncorrectAnswer : function(my_question_id) {
	//adds a default incorrect answer to the given question, returns index of that incorrect answer
		var new_index = dynmc_test.questions.objects[my_question_id].incorrect_answers.length;
		dynmc_test.questions.objects[my_question_id].incorrect_answers.push('New Incorrect Answer...');
		return new_index;
	}, //addDefaultIncorrectAnswer

	deleteIncorrectAnswer : function(my_question_id, my_index) {
	//deletes incorrect answer (at position my_index) from the model and view from the given question
		dynmc_test.questions.objects[my_question_id].incorrect_answers.splice(my_index, 1); //remove from object
		dynmc_test.questions.objects[my_question_id].edited = true;
		view.refreshIncorrectAnswers(dynmc_test.questions.objects[my_question_id]);
	}, //deleteIncorrectAnswer

	changeQuestionText : function(my_question_id, my_new_text) {
	//sets question text of given question to my_new_text
		dynmc_test.questions.objects[my_question_id].question_text = my_new_text; 
		dynmc_test.questions.objects[my_question_id].edited = true;
	}, //changeQuestionText

	changeCorrectAnswer : function(my_question_id, my_new_text) {
	//sets correct answer of given question to my_new_text
		dynmc_test.questions.objects[my_question_id].correct_answer = my_new_text;
		dynmc_test.questions.objects[my_question_id].edited = true;
	}, //changeCorrectAnswer

	changeIncorrectAnswer : function(my_question_id, my_new_text, my_index) {
	//sets the incorrect answer at the given index of given question to my_new_text
		dynmc_test.questions.objects[my_question_id].incorrect_answers[my_index] = my_new_text; 
		dynmc_test.questions.objects[my_question_id].edited = true;
	}, //changeIncorrectAnswer

	getCurrentQuestion : function() {
		return dynmc_test.questions.objects[this.current_question];
	}, //getQuestion

	checkIncorrectAnswers : function(my_question_id) {
	//checks whether question has more than 1 incorrect answer
		if (dynmc_test.questions.objects[my_question_id].incorrect_answers.length <= 1) {
			return false;
		} //if
		return true;
	}, //checkIncorrectAnswers

	checkNewCorrectAnswer : function(my_question_id, my_new_text) {
	//check whether new text can be used as correct answer -> should not be in incorrect answers, returns true if ok	
		if ($.inArray(my_new_text, dynmc_test.questions.objects[my_question_id].incorrect_answers) !== -1) {
			return false;
		} //if
		return true;
	}, //checkNewCorrectAnswer

	checkNewIncorrectAnswer : function(my_question_id, my_new_text, my_index) {
	//check whether new text can be used as incorrect answer -> should not be in other incorrect answers + correct answer, returns true if ok	
		for (var i = 0; i < dynmc_test.questions.objects[my_question_id].incorrect_answers.length; i++) {
			if ((dynmc_test.questions.objects[my_question_id].incorrect_answers[i] == my_new_text) && (i != my_index)) { //another answer option with this text exists
				return false;
			} //if
		} //for
		if (dynmc_test.questions.objects[my_question_id].correct_answer == my_new_text) {
			return false;
		} //if
		return true;
	}, //checkNewIncorrectAnswer

	saveTest : function() {
	//initializes saving of a test
		dynmc_test.setTestData();
		dynmc_test.saveTestAndRedirect(action);
	}, //saveTest

	runQuestion : function() {
	//displays the current question of the test in the run mode
		this.options_counter = 0;
		var question_object = dynmc_test.questions.objects[this.current_question];
		view.initRunQuestion(question_object);
		this.getNewAnswerOption(); //show first answer option	
	}, //runQuestion

	getNewAnswerOption : function() {
	//retrieves next answer option from database, initialises displaying it
		var question_object = dynmc_test.questions.objects[this.current_question];
		$.get(root_path + 'php_dynmc/dynmc_managetests.php', {new_option : true, question_ID : question_object.db_id}, function(feedback) { 
			if (feedback) {
				view.showAnswerOption(feedback, false);
			} //if
		});
	}, //getNewAnswerOption

	evaluateAnswer : function(my_user_answer) {
	//evaluates the answer a user has given for the current options, initializes display of feedback
		var question_object = dynmc_test.questions.objects[this.current_question];
		var self = this;
		$.getJSON(root_path + 'php_dynmc/dynmc_managetests.php', {user_answer : my_user_answer, question_ID : question_object.db_id}, function(feedback) {
			if (feedback.answer_option == '0') { //incorrect answer has been hit
				if (my_user_answer == '0') { //user was right -> show next answer option
					view.markAnswerAsCorrect("incorrect", true);
					self.getNewAnswerOption();
				} //if
				else {
					view.markAnswerAsIncorrect("correct");
					self.current_question++;
					view.endQuestion(feedback.solved_options);
				} //else
			} //if
			else { //correct answer has been hit
				if (my_user_answer == '1') { //user was right
					view.markAnswerAsCorrect("correct", false);
					self.user_score++;
				} //if
				else {
					view.markAnswerAsIncorrect("incorrect");
				} //else
				self.current_question++;
				view.endQuestion(feedback.solved_options);
			} //else
		});
	}, //evaluateAnswer

	getNoOfQuestions : function()  {
	//returns number of questions in the current test
		return dynmc_test.questions.counter;
	} //getNoOfQuestions
} //control


$(document).ready(function() {
	control.init(test_id);
});