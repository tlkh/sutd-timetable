function modChange( e ){
	console.log( $(e.target).val() );
}

$(document).ready(function(){
	$("#mods").select2({
		width: 'resolve',
		allowClear: true,
		minimumInputLength: 2,
		placeholder: 'Search modules...',
		ajax: {
			dataType: 'json', delay: 250, url: '/modules',
			processResults: function(data,params){
				var kmatch, sh = params.term, r = [];
				$.each( data, function(k,v){
					kmatch = ( k.indexOf(sh) != -1 );
					$.each( v.sections, function(s,n){
						if ( kmatch || s.indexOf(sh) != -1 || n[0].indexOf(sh) != -1 )
						{
							r.push({id:s,text:k+' - '+n[0]});
						}
					});
				});
				return { results: r, count: r.length };
			}
		},
	}).on('change', modChange);
});
