<?php
/*************************************************************************************************************************
TEMPLATES FOR DYNMC TESTS
- contains HTML templates for elements of dynmc tests
*************************************************************************************************************************/
?>	

<script type="text/template" data-template="question">
    <div class="question border-theme-color" id="question_{{id}}" data-obj_id="{{id}}">
		<div class="label_box  bg-theme-color font-color-4 border-theme-color" id="label_box_{{id}}">
			<div class="question_label" data-obj_id="{{id}}" id="label_{{id}}">{{text}}</div>
		</div>
		<div class="question_box bg-color-4" id="box_{{id}}" data-obj_id="{{id}}">
			<div class="css_table question_table" id="question_table_{{id}}"></div>
		</div>
	</div>
</script>

<script type="text/template" data-template="answer_unsolved">
    <div class="css_tr">
		<div class="css_td small_cell right_aligned">
			<svg height="18" width="18">
				<circle cx="9" cy="10" r="6" stroke="#848484" stroke-width="2" fill="none" />
			</svg> 
		</div>
		<div class="css_td answer_option">
			{{text}}
		</div>
	</div>
</script>

<script type="text/template" data-template="answer_solved_correct">
    <div class="css_tr correct_row" id="correct_row_{{id}}_{{answer_index}}">
		<div class="css_td small_cell right_aligned">
			<svg height="18" width="18">
				<path d="M 2 10 l 6 6 l 12 -12" stroke="#848484" stroke-width="3" fill="none" />
			</svg>
		</div>
		<div class="css_td">
			<div class="correct_answer correct_answer_{{id}}" id="correct_{{id}}_{{answer_index}}" data-obj_id="{{id}}" data-answer_id="{{answer_index}}">{{text}}</div>
		</div>
	</div>
</script>

<script type="text/template" data-template="answer_solved_incorrect">
    <div class="css_tr incorrect_row" id="incorrect_row_{{id}}_{{answer_index}}">
		<div class="css_td small_cell right_aligned">
			<svg height="18" width="18">
				<path class="pic_incorrect" d="M 4 4 l 13 13" stroke="#848484" stroke-width="3" fill="none" />
				<path class="pic_incorrect" d="M 4 17 l 13 -13" stroke="#848484" stroke-width="3" fill="none" />
			</svg>
		</div>
		<div class="css_td">
			<div class="incorrect_answer incorrect_answer_{{id}}" id="incorrect_{{id}}_{{answer_index}}" data-obj_id="{{id}}" data-answer_id="{{answer_index}}">{{text}}</div>
		</div>
		<div class="css_td small_cell" id="delete_cell_{{id}}_{{answer_index}}"></div>
	</div>
</script>

<script type="text/template" data-template="new_incorrect_answer">
    <div class="css_tr new_incorrect_row" id="new_incorrect_row_{{index}}">
		<div class="css_td small_cell right_aligned">
			<svg height="18" width="18">
				<path class="pic_incorrect" d="M 4 4 l 13 13" stroke="#848484" stroke-width="3" fill="none" />
				<path class="pic_incorrect" d="M 4 17 l 13 -13" stroke="#848484" stroke-width="3" fill="none" />
			</svg>
		</div>
		<div class="css_td">
			<input type="text" class="new_inputfield new_incorrect_answer" name="new_incorrect_answer_{{index}}" id="new_incorrect_answer_{{index}}" placeholder="New Incorrect Answer...">
		</div>
		<div class="css_td small_cell">
			<div class="delete_new_answer_button font-color-1" data-index="{{index}}">X</div>
		</div>
	</div>
</script>

<script type="text/template" data-template="answer_run">
    <div class="css_tr current_option_row">
		<div class="css_td medium_cell">
			<div class="radio_correct">
				<input type="radio" value="1" name="user_answer" class="user_answer">
				<svg height="18" width="18">
					<path class="pic_correct" d="M 2 10 l 6 6 l 12 -12" stroke="#848484" stroke-width="3" fill="none" />
				</svg>
			</div>
			<div class="radio_incorrect">
				<input type="radio" value="0" name="user_answer" class="user_answer radio_incorrect">
				<svg height="18" width="18">
					<path class="pic_incorrect" d="M 4 4 l 13 13" stroke="#848484" stroke-width="3" fill="none" />
					<path class="pic_incorrect" d="M 4 17 l 13 -13" stroke="#848484" stroke-width="3" fill="none" />
				</svg>
			</div>
		</div> 
		<div class="css_td small_cell">|</div>
		<div class="css_td" class="current_option">{{text}}</div>
	</div>
</script>

<script type="text/template" data-template="add_question">
    <div class="question border-theme-color" id="new_question">
		<div class="label_box  bg-theme-color font-color-4">
			<div class="question_label"><input type="text" class="new_inputfield" name="new_question_text" id="new_question_text" placeholder="New Question..."></div>
		</div>
		<div class="question_box bg-color-4">
			<div class="css_table question_table" id="new_question_table">
				<div class="css_tr">
					<div class="css_td small_cell right_aligned">
						<svg height="18" width="18">
							<path d="M 2 10 l 6 6 l 12 -12" stroke="#848484" stroke-width="3" fill="none" />
						</svg>
					</div>
					<div class="css_td">
						<input type="text" class="new_inputfield" name="new_correct_answer" id="new_correct_answer" placeholder="New Correct Answer...">
					</div>
				</div>
				<div class="css_tr new_incorrect_row" id="new_incorrect_row_0">
					<div class="css_td small_cell right_aligned">
						<svg height="18" width="18">
							<path class="pic_incorrect" d="M 4 4 l 13 13" stroke="#848484" stroke-width="3" fill="none" />
							<path class="pic_incorrect" d="M 4 17 l 13 -13" stroke="#848484" stroke-width="3" fill="none" />
						</svg>
					</div>
					<div class="css_td">
						<input type="text" class="new_inputfield new_incorrect_answer" name="new_incorrect_answer_0" id="new_incorrect_answer_0" placeholder="New Incorrect Answer...">
					</div>
					<div class="css_td small_cell">
						<div class="delete_new_answer_button font-color-1" data-index="0">X</div>
					</div>
				</div>
			</div>
			<input type="submit" class="submit_button" name="add_question" id="add_question" value="Add this Question">
			<input type="submit" class="submit_button" name="add_new_incorrect" id="add_new_incorrect" value="Add Incorrect Answer">
		</div>
	</div>
</script>