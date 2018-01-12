function CustomPrompt(){
	this.render = function(dialog,func){
		var winW = window.innerWidth;
	    var winH = window.innerHeight;
	    var promptDiv = document.getElementById('promptDiv');
		promptDiv.style.left = (winW/2) - (550 * .5)+"px";
	    promptDiv.style.top = "100px";
		document.getElementById('promptHeaderDiv').innerHTML = "A value is required";
	    document.getElementById('promptBodyDiv').innerHTML = dialog;
		document.getElementById('promptBodyDiv').innerHTML += '<br><input id="prompt_value1">';
		document.getElementById('promptFooterDiv').innerHTML = '<button onclick="Prompt.ok(\''+func+'\')">OK</button> <button onclick="Prompt.cancel()">Cancel</button>';
		console.log("finished render");
	}
	this.cancel = function(){}
	this.ok = function(func){
		console.log("inside ok");
		document.body.style.overflow = 'visible';
		var prompt_value1 = document.getElementById('prompt_value1').value;
		window[func](prompt_value1);
		document.getElementById('promptDiv').style.display = "none";
		document.getElementById('maskingDiv').style.display = "none";
	}
}
var Prompt = new CustomPrompt();

if (document.getElementById("maskingDiv") == null){
	var promptDiv = document.createElement("div");
	promptDiv.id = "promptDiv";
	promptDiv.style.cssText = "display: block; position: fixed; background: #000;\
		width:550px; z-index: 1000;";
	var marginDiv = document.createElement("div");
	marginDiv.id = "marginDiv";
	marginDiv.style.cssText = "background:#FFF; margin:4px;";
	var promptHeaderDiv = document.createElement("div");
	promptHeaderDiv.id = "promptHeaderDiv";
	promptHeaderDiv.style.cssText = "background: #666; font-size:19px; padding:10px; color:#CCC;";
	var promptBodyDiv = document.createElement("div");
	promptBodyDiv.id = "promptBodyDiv";
	promptBodyDiv.style.cssText - "background: #333; padding:20px; color:#FFF;";
	var promptFooterDiv = document.createElement("div");
	promptFooterDiv.id = "promptFooterDiv";
	promptFooterDiv.style.cssText = "background: #666; padding:10px; text-align:right;";
	marginDiv.appendChild(promptHeaderDiv);
	marginDiv.appendChild(promptBodyDiv);
	marginDiv.appendChild(promptFooterDiv);
	promptDiv.appendChild(marginDiv);
	document.getElementsByTagName('body')[0].appendChild(promptDiv);
}
Prompt.render('Type some text:', 'zzz');
null;