vidStickBlock: {
if(document.body.getAttribute('chromeextension:video-tape'))break vidStickBlock;
document.body.setAttribute('chromeextension:video-tape',true);
var tabid=false;
function _ge(g){
	return document.getElementById(g);
}
function getFixedOffset( el ){
		var rec = el.getClientRects()[0];
		if(rec && rec.top)
			return{y:rec.top,x:rec.left};
		else return{y:0,x:0};
}
function getWindowWidth(){
 return window.innerWidth;
}
function getWindowHeight(){
 return window.innerHeight;
}
function getScrollY(){
    if(document.all){
        return document.documentElement.scrollTop;
    }else{
        return window.pageYOffset;
    }
}
function getScrollX(){
    if(document.all){
        return document.documentElement.scrollLeft;
    }else{
        return window.pageXOffset;
    }
}
function getOffset( el ){
    var _x=0,_y=0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
    		_x+=el.offsetLeft;// - el.scrollLeft;
    		_y+=el.offsetTop;// - el.scrollTop;  
        el=el.offsetParent;
    }return { y: _y, x: _x };
}

var chkForNodesTimeout=0;
function nodeInserted(){
	clearTimeout(chkForNodesTimeout);
	chkForNodesTimeout=setTimeout(checkForNodes,250);
}
document.body.addEventListener('DOMNodeInserted', nodeInserted, false);
document.body.addEventListener('DOMNodeRemoved', nodeInserted, false);

var validNodes=[];
var topFixed=1000;
var lasMoveVideo=-1;

function checkForNodes(){
	var testurl=window.location.href;
	
	if(testurl.indexOf('javascript:') == 0 ){
		return;
	}
	
	if(testurl.indexOf('mail.google.com') > 0 ){
		return;
	}
	
	var isYoutube=false;
	if(testurl.indexOf('youtube.com') > 0 ){
		isYoutube=true;
	}
	
	validNodes=[];
	var nodes1=document.getElementsByTagName('embed');
	var nodes1b=document.getElementsByTagName('object');
	var nodes2=document.getElementsByTagName('video');
	var nodes3=document.getElementsByTagName('iframe');
	
	/*
	if(vid.contentDocument.location.href.length > testurl.length)
		testurl=vid.contentDocument.location.href;
	if(vid.parentNode.nodeName=="OBJECT")vid=vid.parentNode;
	
	*/
	
	for(var x=0,l=nodes1.length;x<l;x++){
		if(nodes1[x].clientWidth < 10) continue;
		if(nodes1[x].parentNode.nodeName=="OBJECT") continue;
		validNodes.push({typ:'flash',elm:nodes1[x]});
	}
	
	for(var x=0,l=nodes1b.length;x<l;x++){
		if(nodes1b[x].clientWidth < 10) continue;
		validNodes.push({typ:'flash',elm:nodes1b[x]});
	}
	
	for(var x=0,l=nodes2.length;x<l;x++){
		if(nodes2[x].clientWidth < 10) continue;
		validNodes.push({typ:'html5',elm:nodes2[x]});
	}
	
	for(var x=0,l=nodes3.length;x<l;x++){
		if(nodes3[x].clientWidth < 10) continue;
		if(nodes3[x].getAttribute('aria-hidden') == 'true') continue;
		validNodes.push({typ:'iframe',elm:nodes3[x]});
	}
	
	if(validNodes.length > 0){
		
		//now we will loop through the valid nodes and see if we really should control the parent node instead
		for(var x=0,l=validNodes.length;x<l;x++){
			myl=validNodes[x].elm;
			tel=myl.parentNode;
			while(myl.clientWidth >= tel.clientWidth && myl.clientHeight >= tel.clientHeight){
				validNodes[x].elm = tel;
				tel=tel.parentNode;
			}
		}
		
		//lets try to fix all the zindexes too... what a mess! (we just want to place a given element on top of all)... well this block sort of fixes youtube but not good enough
//		for(var x=0,l=validNodes.length;x<l;x++){
//			tel=validNodes[x].elm.parentNode;
//			while(tel.style){
//				var newz=((tel.style.zIndex ? tel.style.zIndex : 100)-0)+1;
//				tel.style.zIndex = newz;
//				//so ugly
//				var ps=tel.previousSibling;
//				while(ps){
//					ps.style.zIndex = ++newz;
//					ps=ps.previousSibling;
//				}
//				
//				tel=tel.parentNode;
//			}
//		}
		
		//console.log(validNodes);
		chrome.extension.sendRequest({enable:true}, function(response){
			
		});
		if(tabid)
			chrome.extension.sendRequest({updatePreview:true},function(r){});
	}else{
		chrome.extension.sendRequest({disable:true}, function(response){
			
		});
	}
}

checkForNodes();

function viewScrolled(){
	if(tabid)
		chrome.extension.sendRequest({updatePreview:true},function(r){});
}
window.addEventListener('scroll',viewScrolled);

function computeBoxShadow(m){
//m.style.boxShadow=Math.round(((((m.style.left.replace('px','')-0+(m.clientWidth*0.5)))/getWindowWidth())-0.5)*-7)+'px 5px 5px #555';
}

chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	
	if (request.getLayout){
		tabid = request.tabid;
		var response=[];
		
		for(var i=0,l=validNodes.length;i<l;i++){
			var m = validNodes[i].elm;
			var sp=getFixedOffset(m);

			response.push({x:sp.x,y:sp.y,w:m.clientWidth,h:m.clientHeight,fixed:m.style.position=='fixed'});
		}	
		sendResponse({win:{w:getWindowWidth(),h:getWindowHeight(),scrypcnt:window.pageYOffset/(document.body.scrollHeight-getWindowHeight())},elm:response});
	}else if (request.scrToYpcnt){
		window.scrollTo(0,request.scrToYpcnt * (document.body.scrollHeight-getWindowHeight()));
	}else if (request.mwheel){
		window.scrollBy(0,-request.mwheel*0.5);
	}else if (request.moveVideo){
		var i=request.moveVideo-1;
		var m = validNodes[i].elm;
		
		if(request.x < 0 && request.x > -30)request.x=0;
		if(request.y < 0 && request.y > -30)request.y=0;
		
		m.style.top=(request.y)+'px';
		m.style.left=(request.x)+'px';
		
		computeBoxShadow(m);
		
		if(i!=lasMoveVideo)
			m.style.zIndex=++topFixed;
		lasMoveVideo=i;
	}else if (request.fixVideo){
		var i=request.fixVideo-1;
		var m = validNodes[i].elm;
		var sp=getFixedOffset(m);

		//m.style.width=(m.clientWidth)+'px !important';
		//m.style.height=(m.clientHeight)+'px !important';
		
		
		m.style.position='fixed';
		m.style.top=(sp.y)+'px';
		m.style.left=(sp.x)+'px';
		
//		if(_ge('watch7-main-container')){
//			_ge('watch7-main-container').style.WebkitTransform='translate3d(0px, 0px, 1px)';
//		}
		
		//document.body.style.WebkitTransformStyle='preserve-3d';
		m.style.WebkitTransform='translate3d(0px, 0px, -1px)';
		//m.style.WebkitTransformStyle='preserve-3d';
		computeBoxShadow(m);
		
		//-webkit-transform: translate3d(0px, 0px, 0px);

		var spa=Cr.elm('div',{'class':'_vidstickspacer','style':'display:inline-block;height:'+m.clientHeight+'px;width:'+m.clientWidth+'px;'});
		//setTimeout(function(){m.parentNode.insertBefore(spa,m)},20);
		m.parentNode.insertBefore(spa,m);
		sendResponse({});
	}else if (request.unfixVideo){
		
		var i=request.unfixVideo-1;
		var m = validNodes[i].elm;
		
		if(m.previousSibling.className=='_vidstickspacer'){
			m.parentNode.removeChild(m.previousSibling);
		}
		m.style.position='relative';
		m.style.top='0px';
		m.style.left='0px';
		m.style.WebkitTransform='none';
		m.style.boxShadow='';
		
		if(request.showRestored) m.scrollIntoView();
		
		viewScrolled();
		sendResponse({});
	}else if (request.removeVideo){
		var i=request.removeVideo-1;
		var m = validNodes[i].elm;
		m.parentNode.removeChild(m);
		checkForNodes();
		sendResponse({});
	}else if (request.justOpened){
		tabid = request.tabid;
		checkForNodes();
		sendResponse({});
	}else sendResponse({});
});
}//end block