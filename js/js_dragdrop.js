/*************************************************************************************************************************
JS FOR DRAG&DROP TESTS
- contains JS necessary for creating & playing drag & drop tests
*************************************************************************************************************************/
var error = false;
var current_container_height = 0;
var dragdrop_test;

$(document).ready(function() {

	/*************************************************************************************************************************/
	dragdrop_test = new E_Test('dragdrop'); //test object to hold the test data produced / edited here

	//extend the object with the necessary properties & methods for drag&drop tests:
	dragdrop_test.containers = {counter: 0, objects: {}, displayed: 0}; //holds container objects
	dragdrop_test.items = {counter: 0, objects: {}, displayed: 0}; //holds item objects
	dragdrop_test.solutions = {}; //holds mappings item => container (numbers)
	dragdrop_test.saveTestData = function() {
	//put all test data into one object literal for easy database submission
		this.test_data.items = this.items;
		this.test_data.containers = this.containers;
		this.test_data.solutions = this.solutions;
	} //saveTestData
	dragdrop_test.retrieveAndDisplayTest = function(my_test_id, my_solution, my_show_solution) {
	//retrieves data of a test from the database, displays it in div test_container
	//params: my_test_id = INT; my_solution = bool (determines whether solution should be retrieved or not);  my_show_solution = bool (determines whether solution should be displayed or not)
		this.db_id = my_test_id;
		$.getJSON(root_path + 'php_dragdrop/dragdrop_managetests.php', {test_id : my_test_id, solution : my_solution}, function(feedback) {
			if (feedback.db_error != '') {
				alert('Test could not be retrieved correctly from database! ' + feedback.db_error);
			} //if
			else {
				displayDragDropTest(feedback.items, feedback.containers);
				if (my_solution) {
					setTestSolution(my_show_solution);
				} //if
			} //else
		});
	} //retrieveAndDisplayTest
	
	//set correct test data, according to action:
	switch (action) {
		case 'new':
			createDragDropTest(2, 2);
			getTestNamesFromDb(0); //load test names from database for checking
			break;
		case 'view':
			dragdrop_test.retrieveAndDisplayTest(test_id, true, false);
			break;
		case 'edit':
			dragdrop_test.retrieveAndDisplayTest(test_id, true, true);
			getTestNamesFromDb(test_id); //load test names from database for checking
			break;
		case 'run':
			dragdrop_test.retrieveAndDisplayTest(test_id, false, false);
			break;
		default:
			break;
	} //switch

	function setTestSolution(my_show) {
	//updates the test object by adding the solution as a property
	//params: my_show = bool (indicating whether solution should be shown after loading it or not)
		for (i = 0; i < dragdrop_test.items.counter; i++) {
			var db_container_id = dragdrop_test.items.objects[i].item_container_ID;
			for (var j = 0; j < dragdrop_test.containers.counter; j++) {
				if (db_container_id == dragdrop_test.containers.objects[j].db_id) {
					dragdrop_test.solutions[i] = j;
				}; 
			};
		};
		if (my_show) {
			showSolution();
		} //if
	} //function setTestSolution

	function showSolution() {
		$('.item_box').each(function() {
			var correct_container = dragdrop_test.solutions[$(this).data('obj_id')];
			$('#container_box_' + correct_container).append($(this));
			$(this).css('display', 'block');
		});
	} //function showSolution
	
	/*************************************************************************************************************************/
	
	//functions for creating the displayed drag&drop test:
	
	function createDragDropTest(my_containers_number, my_items_number) {
	//prepare default items and containers for displaying empty drag&drop test, using the given numbers, then initialize display, drag&drop & editing
		//create items:
		var empty_items = {length: my_items_number};
		for (var i = 0; i < my_items_number; i++) {
			empty_items[i] = {item_text: '[ITEM ' + (i + 1) + ']'};
		} //for
		var empty_containers = {length: my_containers_number};
		for (var i = 0; i < my_containers_number; i++) {
			empty_containers[i] = {container_text: '[CONTAINER ' + (i + 1) + ']'};
		} //for

		displayDragDropTest(empty_items, empty_containers);
	} //function createDragDropTest()

	function displayDragDropTest(my_items, my_containers) {
	//displays drag and drop test of given items and containers in test_container section, sets items and containers in dragdrop_test
	//params: lists of objects (each containing at least the text of the item/container)
		//reset object properties
		dragdrop_test.containers.counter = 0; 
		dragdrop_test.containers.objects = {};
		dragdrop_test.items.counter = 0; 
		dragdrop_test.items.objects = {};

		if (action == 'view' || action == 'run') {
			$('#items_container').html('');
		} //if

		//display items:
		for (var i = 0; i < my_items.length; i++) {
			addItem(my_items[i]);
		} //for

		//display containers:
		for (var i = 0; i < my_containers.length; i++) {
			addContainer(my_containers[i]);
		} //for

	} //function displayDragDropTest

	function addItem(my_item_object) {
	//adds item to display and to test object
	//params: my_item_object = object (must have at least one property: item_text)
		var current_id = dragdrop_test.items.counter;
		$('#items_container').append('<div class="item_box" data-obj_id="' + current_id + '" id="item_box_' + current_id + '"> \
										<div class="test_item" data-obj_id="' + current_id + '" id="item_' + current_id + '">' + my_item_object.item_text + '</div> \
									</div>');
		dragdrop_test.items.objects[current_id] = new Item(current_id, my_item_object.item_text);
		dragdrop_test.items.counter++;
		dragdrop_test.items.displayed++;
		
		if (action == 'new' || action == 'edit') {
			makeDraggable('item_box_' + current_id);
			enableInlineEditing('item', current_id);
		} //if
		else if (action == 'run') {
			makeDraggable('item_box_' + current_id);
		} //else if
		if (my_item_object.item_ID) {
			dragdrop_test.items.objects[current_id].db_id = my_item_object.item_ID;
		} //if
		else {
			dragdrop_test.items.objects[current_id].newly_created = true;
		} //else
		if (my_item_object.item_container_ID) {
			dragdrop_test.items.objects[current_id].item_container_ID = my_item_object.item_container_ID;
		} //if
	} //function addItem

	function addContainer(my_container_object) {
	//adds container to display and to test object
	//params: my_container_object = object (must have at least one property: container_text)
		var current_id = dragdrop_test.containers.counter;
		$('#container_row').append('<div class="css_td container_cell" id="container_cell_' + current_id + '"> \
										<div class="container" data-obj_id="' + current_id + '" id="container_'  + current_id + '"> \
											<div class="label_box" data-obj_id="' + current_id + '" id="label_box_' + current_id + '"> \
												<div class="container_label" data-obj_id="' + current_id + '" id="label_'  + current_id + '">' + my_container_object.container_text + '</div> \
											</div> \
											<div class="container_box" data-obj_id="' + current_id + '" id="container_box_' + current_id + '"></div> \
										</div> \
									</div>');
		dragdrop_test.containers.objects[current_id] = new Container(current_id, my_container_object.container_text);
		dragdrop_test.containers.counter++;
		dragdrop_test.containers.displayed++;
		fixContainerTable();
		if (action == 'new' || action == 'edit') {
			makeDropContainer('container_' + current_id);
			enableInlineEditing('container', current_id);
			if (dragdrop_test.containers.displayed >= 4) { //don't allow creation of more than 4 containers
				$('#add_container').prop('disabled', true);
			};
		} //if
		else if (action == 'run') { 
			makeDropContainer('container_' + current_id);
		} //else if
		if (my_container_object.container_ID) {
			dragdrop_test.containers.objects[current_id].db_id = my_container_object.container_ID;
		} //if
		else {
			dragdrop_test.containers.objects[current_id].newly_created = true;
		} //else
	} //function addItem

	function fixContainerTable() {
	//fixes width of table cells, so they do not 'jump' when their content is modified
		var cell_width = 100 / parseInt(dragdrop_test.containers.displayed);
		$('.container_cell').css('width', cell_width + '%'); //fix width of table cells, so they do not 'jump'
	} //function fixContainerTable

	function makeDraggable(my_id) {
	//adds event handlers to items that enable dragging
	//params: my_id = 'string' (ID attribute of the element for which dragging should be allowed)
		$('#' + my_id).attr('draggable', 'true');
		document.getElementById(my_id).addEventListener('dragstart', setDragData); //needs to be done with plain JS, as jQuery does not pass necessary event data!
		document.getElementById(my_id).addEventListener('dragend', resetOpacity);
	} //function makeDraggable()

	function makeDropContainer(my_id) {
	//adds event handlers to containers that enable dropping of items
	//params: my_id = 'string' (ID attribute of the element for which dropping should be allowed)
		document.getElementById(my_id).addEventListener('drop', function(e) {
			addItemToCell(e, this);
		});
		document.getElementById(my_id).addEventListener('dragover', function(e) {
			allowDrop(e, this);
		});
		document.getElementById(my_id).addEventListener('dragenter', function(e) {
			allowDrop(e, this);
		});
		document.getElementById(my_id).addEventListener('dragleave', function(e) {
			removeDragBorder(e, this);
		});
	} //function makeDropContainer()

	function enableInlineEditing(my_type, my_id) {
	//adds classes to items & containers that enable editing of their text
	//params: my_type = 'string' ('container' or 'item'), my_id = INT (current ID of container, used to build element ID attributes)
		switch (my_type) {
			case 'container':
				$('#label_' + my_id).addClass('editable');
				$('#label_box_' + my_id).append('&nbsp;<div class="delete_button">X</div>');
				break;
			case 'item':
				$('#item_' + my_id).addClass('editable');
				$('#item_box_' + my_id).append('&nbsp;<div class="delete_button">X</div>');
				break;
			default:
				break;
		} //switch
	} //function enableInlineEditing

	/*************************************************************************************************************************/
	
	//adding new items & containers by button clicks:
	$('#add_item').click(function(e) {
		e.preventDefault();
		addItem({item_text: '[ITEM ' + (dragdrop_test.items.displayed + 1) + ']'});
	});

	$('#add_container').click(function(e) {
		e.preventDefault();
		addContainer({container_text: '[CONTAINER ' + (dragdrop_test.containers.displayed + 1) + ']'});
	});

	/*************************************************************************************************************************/

	//deleting items & containers:
	$(document).on('mouseover', '.item_box, .label_box', function() {
		$(this).find('.delete_button').css('display', 'inline');
		if ($(this).css('display') == 'inline') {
			$(this).find('.delete_button').css({'float': 'initial'});
		} //if
	});

	$(document).on('mouseleave', '.item_box, .label_box', function() {
		$(this).find('.delete_button').css('display', 'none');
	});

	$(document).on('click', '.delete_button', function() {
		var current_id = $(this).parent().data('obj_id');
		if ($(this).parent().hasClass('label_box')) {
			//deletion of container:
			if ($('#container_box_' + current_id + ' > .item_box').length > 0) { //don't allow deleting if there are items inside container
				alert('You cannot delete a container with items inside. Move or delete the items first!');
			} //if
			else if (dragdrop_test.containers.displayed < 3) { //don't allow deletion if only two containers
				alert('Your test must contain at least two containers, so you cannot delete this container. Click on it to change its text instead.');
			} //else if
			else  if (confirm('Are you sure you want to delete this container?')){
				$('#container_cell_' + current_id).remove();
				dragdrop_test.containers.displayed--;
				dragdrop_test.containers.objects[current_id].deleted = true;
				fixContainerTable();
				if (dragdrop_test.containers.displayed < 4) { //allow creation of up to 4 containers
					$('#add_container').prop('disabled', false);
				};
			} //else
		} //if
		else {
			//deletion of item:
			if (dragdrop_test.items.displayed < 3) { //don't allow deletion if only two items
				alert('Your test must contain at least two items, so you cannot delete this item. Click on it to change its text instead.');
			} //if
			else if (confirm('Are you sure you want to delete this item?')){
				$('#item_box_' + current_id).remove();
				dragdrop_test.items.displayed--;
				dragdrop_test.items.objects[current_id].deleted = true;
			} //else
		} //else
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
		if ($(this).parent().hasClass('container_label')) {
			//check whether a container with this name already exists:
			bool_container = true;
			new_text = new_text.toUpperCase(); //convert to upper case
			for (var i = 0; i < dragdrop_test.containers.counter; i++) {
				if (i != obj_id ) {
					if (dragdrop_test.containers.objects[i].container_text == new_text) { //another container with this text exists
						alert('You already have a container with this label in your test. Choose another label!');
						$(this).focus();
						return;
					} //if
				} //if
			} //for
			dragdrop_test.containers.objects[obj_id].container_text = new_text; //update test object
			dragdrop_test.containers.objects[obj_id].edited = true;
		} //if
		else {
			dragdrop_test.items.objects[obj_id].item_text = new_text; //update test object
			dragdrop_test.items.objects[obj_id].edited = true;
		} //else
		var current_height = $(this).closest('.non_editable').html(new_text).removeClass('non_editable').addClass('editable').height();
		if (bool_container && (current_height > current_container_height)) {
			current_container_height = current_height;
			$('.container_label').height(current_height); //set all containers to have same height
		} //if
	});

	/*************************************************************************************************************************/
	
	//switching between solved and unsolved view:
	$(document).on('click', '#show_solved', function() {
		showSolution();
		$(this).attr('id', 'show_unsolved').val('Show Unsolved Test');
		$('#items_container').hide();
		var max_height = 0;
		$('.container_box').each(function() { //set all table cells to the height of the biggest cell
			if ($(this).height() > max_height) {
				max_height = $(this).height();
			} //if
		});
		$('.container_box').height(max_height).css('padding-bottom', '2px');
	});

	$(document).on('click', '#show_unsolved', function() {
		$('.item_box').each(function() {
			$('#items_container').append($(this));
			$(this).css('display', 'inline');
		});
		$(this).attr('id', 'show_solved').val('Show Solved Test');
		$('#items_container').show();
		$('.container_box').css({'height': 'auto', 'padding-bottom': '30px'});
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
		if ($('#items_container > .item_box').length > 0) { //all test items must be inside a container
			alert('Every item must be assigned to a container before you can save your test! Please drag all items into the containers first.');
			error = true;
		} //if

		//submission, if check yielded no errors:
		if (!error) {
			$('#test_container').html('<em>Saving...</em>');
			dragdrop_test.saveTestData();
			dragdrop_test.saveTestAndRedirect(action);
		} //if
	});

	/*************************************************************************************************************************/
	
	//check test
	$('#check_test').click(function(e) {
		if ($('#items_container > .item_box').length > 0) { //all test items must be inside a container
			alert('Some items are still waiting to be dropped into a container! Please drag all items into the containers first.');
		} //if
		else {
			//translate current IDs to database IDs
			$('#items_container').html('<em>Checking ...</em>');
			$('.item_box').removeClass('incorrect_item');
			var temp_solution = {};
			for (i = 0; i < dragdrop_test.items.counter; i++) {
				var item_obj = dragdrop_test.items.objects[i];
				var container_obj = dragdrop_test.containers.objects[dragdrop_test.solutions[i]];
				temp_solution[item_obj.db_id] = container_obj.db_id;
			} //for
			$.getJSON(root_path + 'php_dragdrop/dragdrop_managetests.php', {check_test : temp_solution, check_test_id : dragdrop_test.db_id}, function(feedback) {
				$('#items_container').html('Your score: ' + feedback.correct + ' out of ' + dragdrop_test.items.counter + ' correct!');
				for (var i = 0; i < dragdrop_test.items.counter; i++) {
					var item_obj = dragdrop_test.items.objects[i];
					if (feedback[item_obj.db_id] == 0) { //mark incorrect items
						$('#item_box_' + i).addClass('incorrect_item');
					} //if
				} //for
			});
		} //else
	});
	
	/*************************************************************************************************************************/

}); //document ready function

/*************************************************************************************************************************/

//drag&drop functionality (must be outside document ready!):
function setDragData(e) {
//specifies what happens when an element is dragged -> ID of that element as dragged data
	e.dataTransfer.setData('text', e.target.id); 
	e.target.style.opacity = '0.5';
	var img = document.getElementById(e.target.id);
	if (e.dataTransfer.setDragImage) { //check for support (not supported in IE, but IE displays drag image fine by default)
		e.dataTransfer.setDragImage(img, 0, 0); //set ghost image that is dragged along to be the item itself & to appear at mouse pointer
	} //if
} //function setDragData()

function allowDrop(e, element) {
//allow dropping on containers (by preventing default, as elements can by default not be dropped into other elements)
	e.preventDefault();
	element.style.border = "3px solid #C3B9AE"; //add border to indicate that drop is allowed here
} //function allowDrop()

function addItemToCell(e, element) {
//specifies what happens when element is dropped on a cell -> attach element to that cell
	var container_id = element.dataset.obj_id;
	
	e.preventDefault();
	element.style.border = "3px solid #006093";
	var item = document.getElementById(e.dataTransfer.getData('text'));
	item.style.display = 'block';
	if (action == 'new' || action == "edit") {
		item.querySelector('.delete_button').style.float = 'right';
	} //if
	document.getElementById('container_box_' + container_id).appendChild(item);

	//save this solution to the test object:
	var item_id = item.dataset.obj_id;
	dragdrop_test.solutions[item_id] = container_id;
	dragdrop_test.items.objects[item_id].edited = true;
} //function addItemToCell()

function removeDragBorder(e, element) {
//dragged element leaves element where it can be dropped
	element.style.border = "3px solid #006093";
} //function removeDragBorder()

function resetOpacity(e) {
//reset opacity of dragged item when it is not dragged anymore
	e.target.style.opacity = '1';
} //function resetOpacity()

/*************************************************************************************************************************/

//class declarations for items and containers:
function Item(my_current_id, my_text) {
//represents one draggable item
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.item_text = my_text;
	this.item_container_ID = null;
} //function Item

function Container(my_current_id, my_text) {
//represents one container in which items can be dropped
	TestItem.call(this, my_current_id); //make this a 'sub-class' of TestItem (see js_general.js)
	this.container_text = my_text;
} //function Container