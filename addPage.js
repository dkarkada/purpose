document.getElementById('button').addEventListener("click", function(event){
	browser.runtime.sendMessage({addPage: 'true'});
	window.close();
})