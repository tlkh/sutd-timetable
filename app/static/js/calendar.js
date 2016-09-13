function attachCalendar(){
	$('#calendar').fullCalendar({
		header: { left: 'prev,next today', center: 'title', right:'month,agendaWeek' },
		businessHours: { start: '08:00', end: '20:00' },
		weekends: false, minTime: "08:00:00", maxTime: "20:00:00",
		contentHeight: 600,
		editable: false,
		defaultView: 'agendaWeek',
		eventRender: handleEventRender,
		eventClick: handleEventClick,
	});
	window.sources = {};
}

function toggleEventSource( action, section ){
	$(".fc-event").popover('hide');
	action = ( action ? 'add' : 'remove' ) + 'EventSource';
	$("#calendar").fullCalendar( action, window.sources[section] );
}

function handleEventRender( evt, element ){
	$("<span class='text'/>").text( evt.description ).appendTo( element );
}

function getEditForm( evt ){
	var fid = evt.source.section + '-' + $.inArray( evt, evt.source.events );
	var form = $("<div class='form-inline' style='width:250px'/>");
	var bt = $("<button type='button' class='btn btn-primary btn-xs' onclick='submitEdit(this);'/>");
	form.append("<select id='"+fid+"' class='form-control' style='width:85%'><option></option></select> ");
	bt.append("<i style='display:none'></i>");
	bt.append($("<span class='text'/>").text("Ok")).appendTo(form);
	return form;
}

function handleEventRender( evt, element ){
	var cb = " <a class='pull-right' onclick='cancelEdit(this);'>&times;</a>";
	$("<span class='text'/>").text( evt.description ).appendTo( element.find('.fc-content') );
	element.popover({
		title: "Edit Lesson Location" + cb,
		content: getEditForm(evt),
		trigger: 'manual', html: true,
		container: 'body',
		placement: 'auto bottom',
	});
}

function cancelEdit(elem){ $(elem).parent().parent().popover('hide'); }

function submitEdit(elem){
	var box = $(elem).parent().parent().parent(), spn = box.find('i');
	var txt = box.find('select')[0], dt = {loc: txt.value, id: txt.id};
	console.log(dt);
	spn.attr({style:'','class':'fa fa-spinner fa-pulse'});
	box.find('span').html('');
	$.ajax( '/editlocation', {
		type: 'POST', contentType: 'application/json',
		data: JSON.stringify(dt),
		success: function(r){
			setTimeout(function(){box.popover('hide');}, 1000);
			$('#'+txt.id).select2('destroy');
			spn.attr({'class':'fa fa-check-circle-o'});
		},
		error: function(r){
			console.log(r);
			spn.attr({'class':'fa fa-exclamation-triangle'});
		}
	});
}

function handleEventClick( evt, jsEvt ){
	$('.fc-event').not(this).popover('hide');
	$(this).popover('show');
	var fid = evt.source.section + '-' + $.inArray( evt, evt.source.events );
	$("#"+fid).select2(window.locationselect);
}
