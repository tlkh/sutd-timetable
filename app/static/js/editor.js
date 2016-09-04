function modChange( e ){
	console.log( $(e.target).val() );
}

$.getJSON( '/modules', function(data){
	var r = [];
	$.each( data, function(k,v){
		$.each( v.sections, function(s,n){ r.push({id:s,text:k+' - '+n[0]}); });
	});
	$("#mods").select2({
		width: 'resolve',
		allowClear: true,
		minimumInputLength: 2,
		placeholder: 'Search modules...',
		data: r,
	}).on('change', modChange);
});
