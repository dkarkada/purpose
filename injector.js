if (document.getElementById("maskingDiv") == null){
	var newDiv = document.createElement("div");
	newDiv.id = "maskingDiv";
	newDiv.style.cssText = 'display: block; opacity: .8; position: fixed; top: 0px; left: 0px; background: #FFF;\
		width: 100%; height: 100%; z-index: 1000;';
	document.body.appendChild(newDiv);
	document.body.style.overflow = 'hidden';

	var sss;
	do{
		sss = prompt("AAA");
	} while (sss == null || sss.length<1)

	document.body.removeChild(newDiv);
	document.body.style.overflow = 'visible';
}