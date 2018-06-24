function getEventTargetA(ev){
	ev = ev || event;
	var targ=(typeof(ev.target)!='undefined') ? ev.target : ev.srcElement;
	if(targ !=null){
	    if(targ.nodeType==3)
	        targ=targ.parentNode;
	}
	if(targ.nodeName != 'A')return targ.parentNode;
	return targ;
}

//see opt_prefs.js

// Saves options to localStorage.
function save_options() {
//  var select = document.getElementById("color");
//  var color = select.children[select.selectedIndex].value;
//  localStorage["favorite_color"] = color;
  	
  	for( i in pOptions){
  		if(typeof(pOptions[i].def)=='boolean')
  			localStorage[i] = document.getElementById(i).checked;
  		else
  			localStorage[i] = document.getElementById(i).value;
  	}
	
	
	for( i in pAdvOptions){
  		if(typeof(pAdvOptions[i].def)=='boolean')
  			localStorage[i] = document.getElementById(i).checked;
  		else
  			localStorage[i] = document.getElementById(i).value;
  	}
	//localStorage["hqthumbs"] = document.getElementById("hqthumbs").checked;
	//localStorage["showCurrentTab"] = document.getElementById("showCurrentTab").checked;
	//localStorage["maxhistory"] = document.getElementById("maxhistory").value;
	

  // Update status to let user know options were saved.
  displayStatus("Options Saved.", 750);

  chrome.runtime.sendMessage({greeting: "reloadprefs"}, function(response) { });
}

function reset_options() {
	for( i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = pOptions[i].def;
		else
			document.getElementById(i).value = pOptions[i].def;
	}
	
	for( i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			document.getElementById(i).checked = pAdvOptions[i].def;
		else
			document.getElementById(i).value = pAdvOptions[i].def;
	}

	displayStatus("You still need to press save, defaults are showing now.");
}

var clearStatusTimeout = 0;
function displayStatus(message, timeout){
	timeout = timeout || 1750;
	var status = document.getElementById("status");
	Cr.empty(status);
	status.appendChild(Cr.txt(message)); // requireds upgradeeeee!

	clearTimeout(clearStatusTimeout);
	clearStatusTimeout = setTimeout(function() {
		status.innerHTML = "";
	}, timeout);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	for( i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i])?localStorage[i]:pOptions[i].def);
	}
	
	for( i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pAdvOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i])?localStorage[i]:pAdvOptions[i].def);
	}

//  var favorite = localStorage["favorite_color"];
//  if (!favorite) {
//    return;
//  }
//  var select = document.getElementById("color");
//  for (var i = 0; i < select.children.length; i++) {
//    var child = select.children[i];
//    if (child.value == favorite) {
//      child.selected = "true";
//      break;
//    }
//  }
}

var histReSize=false;
var hist_sx=0,hist_sy=0;
function dragHist(ev){
	hist_sx=ev.pageX;
	hist_sy=ev.pageY;
	histReSize=true;
}
function stopdragHist(){
	histReSize=false;
}
function mmv(ev){
	if(histReSize){
		var ch=ev.pageX-hist_sx;
		
		var his=document.getElementById('history');
		var hds=document.getElementById('hist_drag_sizer');
		
		//hds.style.right = hds.style.right.replace('px','')-0 - ch;
		his.style.width = his.style.width.replace('px','')-0 + ch;

		hist_sx=ev.pageX;
		hist_sy=ev.pageY;
	}
}

function createOptions(piOptions, elemAppend){
	//needs some compression 
	for( i in piOptions){
		if(piOptions[i].select){
			var l=document.createElement('label');
			var cb=document.createElement('select');
			cb.setAttribute('type','select');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(document.createTextNode(piOptions[i].name));
			l.appendChild(cb);
			
			
			for(z in piOptions[i].select){
				var opt=document.createElement('option');
				opt.setAttribute('value',z);
				opt.appendChild(document.createTextNode(piOptions[i].select[z]));
				cb.appendChild(opt);
			}
			
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
		}else if(typeof(piOptions[i].def)=='boolean'){
			var l=document.createElement('label');
			var cb=document.createElement('input');
			cb.setAttribute('type','checkbox');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(cb);
			l.appendChild(document.createTextNode(piOptions[i].name));
			if(piOptions[i].img){
				var t=piOptions[i].img;
				i=document.createElement('image');
				i.setAttribute('src',t);
				i.setAttribute('align','top');
				i.setAttribute('width',16);
				l.appendChild(i);
			}
			if(piOptions[i] && piOptions[i].css){
				l.setAttribute('style',piOptions[i].css);
			}
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
			//.getElementById(i).checked = ((localStorage[i]=='true')?true:piOptions[i].def);
		}else{
			var l=document.createElement('label');
			var cb=document.createElement('input');
			cb.setAttribute('type','text');
			cb.setAttribute('id',i);cb.setAttribute('size',(piOptions[i].def + '').length);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(cb);
			l.appendChild(document.createTextNode(piOptions[i].name));
			
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
			//document.getElementById(i).value = ((localStorage[i])?localStorage[i]:piOptions[i].def);
		}
	}
}

function init(){

//	var a=document.getElementById('dupli');
//	var b=a.cloneNode(true);
//	b.id='nota';
//	b.style.color='black';
//	b.style.position='absolute';
//	b.style.top='1px';b.style.left='1px';
//	a.appendChild(b);
	
	createOptions(pOptions, document.getElementById('options'));
	createOptions(pAdvOptions, document.getElementById('adv_options'))
	restore_options();
	
	
	
	if(document.getElementById('plat_prev')){
		if(navigator.userAgent.indexOf('Windows') < 0){
			document.getElementById('plat_prev').src="osx.png";
			document.getElementById('req_mac').style.display="block";
		}else{
			document.getElementById('req_win').style.display="block";
		}
	}
	
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse({});
  });
  

function showHelp(){
	toggle_next_sibling_display({target:document.getElementById('shohelp')})
}

function toggle_next_sibling_display(ev){
	who=getEventTargetA(ev);
	var nss=who.nextSibling.style;if(nss.display=='block')nss.display='none';else nss.display='block';
}

document.addEventListener('DOMContentLoaded', function () {
	init()
	document.getElementById('bsave').addEventListener('click', save_options);
	document.getElementById('defa').addEventListener('click', reset_options);
	
	document.getElementById('shoadvanc').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('shohelp').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('termsofuse').addEventListener('click', showHelp);

	if(window.location.hash=='#help'){
		toggle_next_sibling_display({target:document.getElementById('shohelp')})
	}
	
	createAndAttachRatings(document.getElementById('ratings-container'));

	if( isFirefox ){
		document.getElementById('web-link').href=ln_sprt;
	}

});
