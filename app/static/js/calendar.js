function displayModules( mods ){
	$.each( mods, function(k,s){
		var t=k.split('.'),l=k.replace('.','-');
		var panel = $("<div class='panel panel-primary'/>");
		var phead = $("<div class='panel-heading'/>");
		var ptitle = $("<h3 class='panel-title'/>");
		var ahead=$("<a data-toggle='collapse'/>").attr({'data-parent':'#l'+t[0],'href':'#m'+l});

		var sc = $("<ul class='list-group'/>");
		$.each( s.sections, function(k,v){
			var li = $("<li class='list-group-item list-group-item-info'/>");
			var cb = $("<input type='checkbox'>").attr('value',k);
			var dt = (new Date(v[1]*1000)).toISOString().slice(0,10);
			var lz = $("<label/>").text(v[0]+' (Updated: '+dt+')').prepend(cb);
			sc.append( li.append( $("<div class='checkbox'/>").html(lz) ) );
		});

		panel.html(phead.html(ptitle.html(ahead.text(k+' - '+s.title))));
		$("<div class='panel-collapse collapse'/>").attr('id','m'+l).html(sc).appendTo(panel);
		$('#l'+t[0]).append(panel);
	});
	$('#ualert').removeClass('hidden');
}

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
	$.getJSON( 'groups', function(r){
		window.groups = r;
		var sl=$("<select/>").append($("<option>None</option>"));
		$.each( r, function(k,v){ if (k[0]=='F') $("<option>"+k+"</option>").appendTo(sl); });
		sl.change( function(e){ selectGroup( e.target.value ); } );
		$("#freshy").append(sl).removeClass('hidden');
	});
	window.sources = {};
	window.checked = [];
	$("#absurl").html( window.location.host );
}

function handleCheckbox(){
	toggleSection( $(this).is(':checked'), this.value );
	$("#modlink").html( window.checked.sort().join(',') );
}

function selectGroup( group ){
	if ( group in window.groups ){
		var ck = window.groups[group];
		$("#modlink").html( group );
	}
	$(":checkbox").each( function(){
		var kk = ck ? ( $.inArray( this.value, ck ) != -1 ) : false;
		toggleSection( kk, this.value ); $(this).prop( "checked", kk );
	});
}

function toggleSection( action, section ){
	var sc = $.inArray( section, window.checked );
	if ( action != ( sc == -1 ) ) return;
	if ( action ){
		window.checked.push( section );
	} else {
		window.checked.splice( sc, 1 );
	}
	if ( section in window.sources ){
		toggleEventSource( action, section );
	} else {
		$.getJSON( 'section/' + section, function(r){
			if ( r.status == 'error' ) return;
			r.section = section
			window.sources[section] = r;
			toggleEventSource( action, section );
		});
	}
}

function toggleEventSource( action, section ){
	$(".fc-event").popover('hide');
	action = ( action ? 'add' : 'remove' ) + 'EventSource';
	$("#calendar").fullCalendar( action, window.sources[section] );
}

function getEditForm( evt ){
	var fid = evt.source.section + '-' + $.inArray( evt, evt.source.events );
	var form = $("<div class='form-inline' style='width:240px'/>");
	var bt = $("<button type='button' class='btn btn-primary' onclick='submitEdit(this);'/>");
	form.append("<input id='"+fid+"' type='text' class='form-control'> ");
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
		placement: 'auto bottom',
	});
}

function cancelEdit(elem){ $(elem).parent().parent().popover('hide'); }

function submitEdit(elem){
	var box = $(elem).parent().parent().parent(), spn = box.find('i');
	var txt = box.find('input')[0], dt = {loc: txt.value, id: txt.id};
	console.log(dt);
	spn.attr({style:'','class':'fa fa-spinner fa-pulse'});
	box.find('span').html('');
	$.ajax( '/editlocation', {
		type: 'POST', contentType: 'application/json',
		data: JSON.stringify(dt),
		success: function(r){
			setTimeout(function(){box.popover('hide');}, 1000);
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
}
