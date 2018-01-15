if (document.getElementById("dialog-form") == null){
	document.body.style.overflow = 'hidden';

	var jqueryCSS = document.createElement("link");
		jqueryCSS.rel = 'stylesheet';
		jqueryCSS.href = 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'
	document.body.appendChild(jqueryCSS);
	var otherStyleRules = document.createElement('style');
	document.body.appendChild(otherStyleRules);
	var stylesheet = otherStyleRules.sheet;
	stylesheet.insertRule(".ui-front{ z-index: 1001;}", 0);
	stylesheet.insertRule("#purpose{ font: 12pt 'Arial';}", 0);
	stylesheet.insertRule(".ui-dialog{ z-index: 1002; margin-top: 150px; font: 12pt 'Arial'}", 0);
	stylesheet.insertRule(".validateTips{ width: 300px; word-break: break-word; white-space: normal}", 0);
	stylesheet.insertRule(".ui-widget-overlay{ position: fixed}", 0);

	browser.runtime.sendMessage({request: "type"}, function(response) {
		var instructions = response.type == 'ask' ?
			"Describe why you\'re on this site, using at least 40 characters." :
			"Retype your purpose to remind yourself to stay on track:</p><p class=\"validateTips\">" + response.type;

		var dialogHTML = '<div id="dialog-form" title="What\'re you doing here?">\
					<p class="validateTips">' + instructions + '</p> \
					<br>\
					<form>\
						<textarea style = "resize:none; font: 12pt \'Arial\'; width:auto;"\
						 id = "purpose" name="message" rows="5" cols="36" class="nopaste text ui-widget-content">The cat was playing in the garden.</textarea>\
						<!-- Allow form submission with keyboard without duplicating the dialog button -->\
						<input type="submit" tabindex="-1" style="width:0px; position:absolute; top:-1000px">\
					</form>\
					</div>';
		$("body").append(dialogHTML);

		$( function() {
			var dialog, form,
	 
				purpose = $( "#purpose" ),
				allFields = $( [] ).add( purpose ),
				tips = $( ".validateTips" );
	 
			function updateTips( t ) {
				tips
					.text( t )
					.addClass( "ui-state-highlight" );
				setTimeout(function() {
					tips.removeClass( "ui-state-highlight", 1500 );
				}, 500 );
			}
	 
			function submitPurpose() {
				allFields.removeClass( "ui-state-error" );
				if (response.type == 'ask'){
					var min = 20;
					if (purpose.val().length >= min) {
						var host = window.location.hostname;
						var time = Date.now();
						var data = {host: host, purpose: purpose.val(), timeStarted: time}
						browser.runtime.sendMessage({data: data});
						document.body.style.overflow = 'visible';
						dialog.dialog( "close" );
						return true;
					}
					else {
						purpose.addClass( "ui-state-error" );
						updateTips( "Length of reason must be greater than " +
							min + " characters." );
						return false;
					}
				}
				else {
					if (response.type.trim() == purpose.val().trim()){
						var time = Date.now();				
						browser.runtime.sendMessage({timeStarted: time});
						document.body.style.overflow = 'visible';
						dialog.dialog( "close" );
						return true;
					}
					else {
						purpose.addClass( "ui-state-error" );
						return false;
					}
				}
			}
	 
			dialog = $( "#dialog-form" ).dialog({
				closeOnEscape: false,
				open: function(event, ui) {
					$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
				},
				autoOpen: true,
				draggable: false,
				height: 400,
				width: 350,
				modal: true,
				position: {my: "top", at:"top", of: window },
				resizable: false,
				buttons: {
					"Submit": submitPurpose
				},
				close: function() {
					form[ 0 ].reset();
					allFields.removeClass( "ui-state-error" );
					dialog.dialog('destroy').remove();
					document.body.removeChild(jqueryCSS);
					document.body.removeChild(otherStyleRules);
				}
			});
	 
			form = dialog.find( "form" ).on( "submit", function( event ) {
				event.preventDefault();
				submitPurpose();
			});
			$('.nopaste').bind('cut copy paste', function (e) {
				e.preventDefault(); //disable cut,copy,paste
			});
		} );
	});
}