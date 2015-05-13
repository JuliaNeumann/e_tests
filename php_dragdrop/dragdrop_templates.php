<?php
/*************************************************************************************************************************
TEMPLATES FOR DRAG&DROP TESTS
- contains HTML templates for elements of drag & drop tests
*************************************************************************************************************************/
?>	

<script type="text/template" data-template="item">
    <div class="item_box bg-color-2 font-color-4 border-theme-color" data-obj_id="{{id}}" id="item_box_{{id}}">
		<div class="test_item" data-obj_id="{{id}}" id="item_{{id}}">{{text}}</div>
	</div>
</script>

<script type="text/template" data-template="container">
	<div class="container border-theme-color" data-obj_id="{{id}}" id="container_{{id}}">
		<div class="label_box bg-theme-color font-color-4" data-obj_id="{{id}}" id="label_box_{{id}}">
			<div class="container_label" data-obj_id="{{id}}" id="label_{{id}}">{{text}}</div>
		</div>
		<div class="container_box bg-color-4" data-obj_id="{{id}}" id="container_box_{{id}}"></div>
	</div>
</script>
