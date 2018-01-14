if (document.getElementById("dialog-form") == null){
	document.body.style.overflow = 'hidden';

	var jqueryCSS = document.createElement("link");
		jqueryCSS.rel = 'stylesheet';
		jqueryCSS.href = 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'
	document.body.appendChild(jqueryCSS);
	var otherStyleRules = document.createElement('style');
	document.body.appendChild(otherStyleRules);
	var stylesheet = otherStyleRules.sheet;
	stylesheet.insertRule(".ui-front{ z-index: 1001;}", 0)
	stylesheet.insertRule(".ui-dialog{ z-index: 1002; margin-top: 150px}", 0)

	var dialogHTML = '<div id="dialog-form" title="What\'re you doing here?">\
				<p class="validateTips">Describe why you\'re on this site, using at least 40 characters.</p> \
				<form>\
					<textarea style = "resize:none" id = "purpose" name="message" rows="5" cols="36" class="nopaste text ui-widget-content">The cat was playing in the garden.</textarea>\
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
 
		function checkLength( o, min ) {
			if (o.val().length < min ) {
				o.addClass( "ui-state-error" );
				updateTips( "Length of reason must be greater than " +
					min + " characters." );
				return false;
			} else {
				return true;
			}
		}
 
		function addUser() {
			allFields.removeClass( "ui-state-error" );
			var valid = checkLength( purpose, 40 );
 
			if ( valid ) {
				var time = Math.floor(Date.now() / 1000);
				var host = window.location.hostname;
			    var info = {time: time, purpose: purpose.val()};
			    browser.storage.local.clear();	
				browser.storage.local.set({[host]: info});

				let gettingItem = browser.storage.local.get([host]);
				gettingItem.then((item)=> {console.log(item)});
				//console.log(info);
				document.body.style.overflow = 'visible';
				dialog.dialog( "close" );
			}
			return valid;
		}
 
		dialog = $( "#dialog-form" ).dialog({
			closeOnEscape: false,
			open: function(event, ui) {
				$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
			},
			autoOpen: true,
			draggable: false,
			height: 300,
			width: 350,
			modal: true,
			position: {my: "top", at:"top", of: window },
			resizable: false,
			buttons: {
				"Submit": addUser
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
			addUser();
		});
		$('.nopaste').bind('cut copy paste', function (e) {
			e.preventDefault(); //disable cut,copy,paste
		});
	} );
}