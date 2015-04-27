<?php
/*************************************************************************************************************************
TEMPLATES FOR CROSSWORD TESTS
- contains HTML templates for elements of crossword tests
*************************************************************************************************************************/
?>	

<script type="text/template" data-template="question">
    <tr class="question_row" id="question_row_{{id}}">
		<td>
			<div class="editable question_text" data-obj_id="{{id}}">{{question}}</div>
		</td>
		<td>
			<div class="editable correct_answer" data-obj_id="{{id}}">{{answer}}</div>
			<div class="delete_question_button font-color-4" data-obj_id="{{id}}">X</div>
		</td>
	</tr>
</script>