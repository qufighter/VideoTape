videoTapeBlock: {
if(document.body.getAttribute('chromeextension-video-tape'))break videoTapeBlock;
var tabid=false;
var vidDropShadow=false;
var cssPropsWeModify={'width':'w', 'height':'h', 'top':'t', 'left':'l', 'zIndex':'z', 'position':'p', 'boxShadow':'boxShadow' }; // a loop added to program
function _ge(g){
	return document.getElementById(g);
}
function parsePx(pxVal){
	return parseInt(pxVal, 10);
}
function getFixedOffset( el ){
	var rec = el.getClientRects()[0];
	if(rec)return{y:rec.top,x:rec.left};
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
function preventEventDefault(ev){
	ev = ev || event;
	if(ev.preventDefault)ev.preventDefault();
	ev.returnValue=false;
	return false;
}
function getEventTarget(ev){
	ev = ev || event;
	var targ=(typeof(ev.target)!='undefined') ? ev.target : ev.srcElement;
	if(targ !=null){
	    if(targ.nodeType==3)
	        targ=targ.parentNode;
	}
	return targ;
}

styles ='#videoTapeCtxM{display:block;width:auto;text-align:center;border-top:1px solid grey;box-shadow:5px 5px 5px #555;background-color:white;}';
styles+='#videoTapeCtxM a{border:1px solid grey;border-top:none;display:block;color:blue;width:auto;cursor:hand;margin:0px;padding:0px 3px 0px 3px;}';
styles+='#videoTapeCtxM a:hover{background-color:#AAA;}';

styleelem=document.createElement('style');
styleelem.type='text/css';
styleelem.appendChild(document.createTextNode(''+styles+''));
var e=(document.getElementsByTagName('head')[0]||document.body);
if(e){e.appendChild(styleelem);}

var chkForNodesTimeout=0;
function nodeInserted(e){
	if(e.relatedNode.querySelectorAll('embed,object,video,iframe').length < 1) return;
	clearTimeout(chkForNodesTimeout);
	chkForNodesTimeout=setTimeout(checkForNodes,250);
}

var validNodes=[];
var topFixed=1000;
var lasMoveVideo=-1;
var wasEnabled=false;


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
	
	var minHeight = 100, minRatio = 0.56, maxRatio = 2.5;
	
	for(var x=0,l=nodes1.length;x<l;x++){
		var ratio = nodes1[x].clientWidth/nodes1[x].clientHeight;
		if(nodes1[x].clientHeight < minHeight || ratio < minRatio || ratio > maxRatio ) continue;
		if(nodes1[x].parentNode.nodeName=="OBJECT") continue;
		validNodes.push({typ:'flash',elm:nodes1[x]});
	}
	
	for(var x=0,l=nodes1b.length;x<l;x++){
		var ratio = nodes1b[x].clientWidth/nodes1b[x].clientHeight;
		if(nodes1b[x].clientHeight < minHeight || ratio < minRatio || ratio > maxRatio ) continue;
		validNodes.push({typ:'flash',elm:nodes1b[x]});
	}
	
	for(var x=0,l=nodes2.length;x<l;x++){
		var ratio = nodes2[x].clientWidth/nodes2[x].clientHeight;
		if(nodes2[x].clientHeight < minHeight || ratio < minRatio || ratio > maxRatio ) continue;
		if(nodes2[x].childNodes.length < 1 && nodes2[x].controls == false){
			//validNodes.push({typ:'html5',elm:nodes2[x].parentNode});//video element without child nodes, must have parent contained controlls, parent container that centers video, who knows what else
			validNodes.push({typ:'html5',elm:nodes2[x]});// always use node itself in case it would detect differently on a different pass
		}else{
			validNodes.push({typ:'html5-ctn',elm:nodes2[x]});//video node "contains controlls" as expected.  Neato!
		}
	}
	
	for(var x=0,l=nodes3.length;x<l;x++){
		var ratio = nodes3[x].clientWidth/nodes3[x].clientHeight;
		if(nodes3[x].clientHeight < minHeight || ratio < minRatio || ratio > maxRatio ) continue;
		if(nodes3[x].getAttribute('aria-hidden') == 'true') continue;
		validNodes.push({typ:'iframe',elm:nodes3[x]});
	}
	
	var oel, elType, myl, tel, gel, props, lastAboveCnt, aboveCtr, foundControlls;

	if(validNodes.length > 0){
		
		//now we will loop through the valid nodes and see if we really should control the parent node instead
		for(var x=0,l=validNodes.length;x<l;x++){
			elType = validNodes[x].typ;
			oel=myl=gel=tel=validNodes[x].elm;

			props = myl.getAttribute('vidtapeorigprops');

			lastAboveCnt = myl.getAttribute('vidtapeabovecount') - 0; // how many elements above is our final element
			aboveCtr = 0;

			while(!props && aboveCtr < lastAboveCnt){
				tel=tel.parentNode;
				props = tel.getAttribute('vidtapeorigprops');

				// if( isContainerProxyFor(elType, tel, myl) ){
				// 	gel = tel;
				// }

				aboveCtr++;
			}

			// if( props && gel != tel ){
			// 	console.log('pretty odd, we were seeking ', tel, ' but on the way found ', gel,' was a better match - but not sure why we are checking');
			// }

			if( props ){
				validNodes[x].elm = tel;
				// its possible there is yet another parent node that is yet a better match now, due to some change in DOM ..
				// or that it is impossible to get here from video node now
				// call resetOrigionalProperties(tel)
				// if we unfix a video though... it should reset and re-detection may occur
			}

			//console.log('has props', props);

			if(!props){
				aboveCtr = 0;

				// if html5 we might try seeking controlls first, since aspect ratio of video may not match player

				tel=myl.parentNode;
				while( tel && isContainerProxyFor(elType, tel, myl) ){ // reasonalbe q: why search when non html5 elType
					validNodes[x].elm = gel = tel;
					aboveCtr++;
					tel=tel.parentNode;

					//console.log(aboveCtr, myl.scrollWidth , tel.scrollWidth , myl.scrollHeight, tel.scrollHeight);
					if(elType=='html5'){
						// not just class but more attributes might match
						foundControlls = gel.querySelectorAll('[class*=play],[class*=pause],[class*=mute],[class*=volume],[class*=fullscreen],[class*=time],[class*=duration]');
						if( foundControlls.length > 3 ){
							//console.log('found controls', foundControlls);
							tel = null; // dont advance further than necessary when seeking containers
						}
					}
				}
			}

			myl=validNodes[x].elm;
			if(!myl.getAttribute('vidtapeorigprops'))
				myl.setAttribute("vidtapeorigprops",JSON.stringify(getCssPropsWeModify(myl)));//,typ:validNodes[x].typ // {w:myl.scrollWidth,h:myl.scrollHeight}
			oel.setAttribute('vidtapeabovecount', aboveCtr);
			//console.log( 'setting aboveCtr', aboveCtr);
		}
		
		//console.log(validNodes);
		if(!wasEnabled)
			chrome.runtime.sendMessage({enable:true}, function(response){});
		if(tabid)
			chrome.runtime.sendMessage({updatePreview:true},function(r){});
			
		wasEnabled=true;

		//console.log('video tape valid nodes', validNodes);
	}else{
		if(wasEnabled) chrome.runtime.sendMessage({disable:true}, function(response){wasEnabled=false;});
	}
}

function getCssPropsWeModify(node){
	var robj={};
	var prop, propShortKey;
	for( prop in cssPropsWeModify ){
		robj[cssPropsWeModify[prop]] = node.style[prop];
	} // NOTE: we need to reset style.position no matter what, so if adding conditions in this loop should take care to set robj[cssPropsWeModify['position']]=""; afterwards
	return robj;
}

function isContainerProxyFor(elType, container, origional){

	var th = container.offsetHeight, hzCropRatio = 1.0, vertCropRatio = 1.042;

	if( th == 0 ){
		th = container.scrollHeight;
	}
	if( elType=='html5' ){
		hzCropRatio = 1.5;
	}

	return origional.scrollWidth * hzCropRatio >= container.scrollWidth && origional.scrollHeight * vertCropRatio >= th;

}

function resetOrigionalProperties(validNode){
	var origProps=JSON.parse(validNode.getAttribute("vidtapeorigprops")) || false;
	if( !origProps ){
	}
	var prop, propShortKey;
	for( prop in cssPropsWeModify ){
		propShortKey = cssPropsWeModify[prop];
		if( typeof origProps[propShortKey] != 'undefined' ) validNode.style[prop] = origProps[propShortKey];
	}
	validNode.removeAttribute("vidtapeorigprops");
	validNode = validNode.querySelector('[vidtapeabovecount]') || validNode;
	validNode.removeAttribute('vidtapeabovecount');
}

setTimeout(function(){
	checkForNodes();
	document.body.addEventListener('DOMNodeInserted', nodeInserted, false);
	document.body.addEventListener('DOMNodeRemoved', nodeInserted, false);
	document.addEventListener('webkitfullscreenchange', checkFullscreen, false);//fullscreenchange
}, 1230);

var isFullscreen=false;
function checkFullscreen(){
	isFullscreen=!isFullscreen;
	if( isFullscreen ){
		if( !_ge('videotape-stylesheet') ){
			Cr.elm('link',{href:chrome.extension.getURL('vidstick.user.css'),rel:'stylesheet',type:'text/css',media:'screen',id:'videotape-stylesheet'},[],document.head);
		}
	}
}

function viewScrolled(){
	if(tabid)
		chrome.runtime.sendMessage({updatePreview:true},function(r){});
}
window.addEventListener('scroll',viewScrolled);

var ctx_cur_elm=false;
function clearContextMenu(){
	if(_ge('videoTapeCtxM'))_ge('videoTapeCtxM').parentNode.removeChild(_ge('videoTapeCtxM'));
}

function ctx_remove_spacer(ev){
	if(ctx_cur_elm)ctx_cur_elm.parentNode.removeChild(ctx_cur_elm);
	clearContextMenu();
}

function spacerContextMenu(ev){
	var elm=getEventTarget(ev);
	ctx_cur_elm=elm;
	clearContextMenu();
	Cr.elm('div',{id:'videoTapeCtxM',style:'position:absolute;top:'+ev.pageY+'px;left:'+ev.pageX+'px;'},[
		Cr.elm('a',{events:[['mouseup',ctx_remove_spacer,true]]},[Cr.txt('Remove Video Spacer')]),
		Cr.elm('a',{events:[['mouseup',clearContextMenu,true]]},[Cr.txt('Close Menu')])
	],document.body);
	return preventEventDefault(ev);
}

function computeBoxShadow(m){
	if(vidDropShadow)m.style.boxShadow=Math.round(((((m.style.left.replace('px','')-0+(m.clientWidth*0.5)))/getWindowWidth())-0.5)*-7)+'px 5px 5px #555';
}

function affixVideo(m){
	document.body.style.overflow="scroll"; // in case video ever end up outside of window

	// back up current properties
	m.setAttribute("vidtapeorigprops",JSON.stringify(getCssPropsWeModify(m)));
	// EVERY property we modfiy needs to be tracked in cssPropsWeModify{}
	var sp=getFixedOffset(m);
	m.style.width=(m.scrollWidth)+'px';
	m.style.height=(m.scrollHeight)+'px';
	m.style.position='fixed';
	m.style.top=(sp.y)+'px';
	m.style.left=(sp.x)+'px';
	m.style.zIndex = topFixed;
//		if(_ge('watch7-main-container')){
//			_ge('watch7-main-container').style.WebkitTransform='translate3d(0px, 0px, 1px)';
//		}
	//document.body.style.WebkitTransformStyle='preserve-3d';
//	m.style.WebkitTransform='translate3d(0px, 0px, -1px)';
	//m.style.WebkitTransformStyle='preserve-3d';
	computeBoxShadow(m);
	//-webkit-transform: translate3d(0px, 0px, 0px);
	if(!m.getAttribute('domDetached')){
		var spa=Cr.elm('div',{'class':'_videotapespacer','events':[['contextmenu',spacerContextMenu]],'style':'display:inline-block;height:'+m.clientHeight+'px;width:'+m.clientWidth+'px;'});
		m.parentNode.insertBefore(spa,m);
		Cr.addListeners();
	}
	m = m.querySelector('[vidtapeabovecount]') || m;
	return m;
}
function unfixVideo(m, showRestored){
	if(m.previousSibling && m.previousSibling.className=='_videotapespacer'){
		m.parentNode.removeChild(m.previousSibling);
	}
	resetOrigionalProperties(m);
	if(showRestored)m.scrollIntoViewIfNeeded();
	checkForNodes();//viewScrolled();//similar effects, but since we reset node, scan for nodes again
	return m;
}

function videoNodeAt(req, i){
	var m = validNodes[i-1].elm;
	if( !m || !m.getAttribute("vidtapeorigprops") ){  console.log('vidsbee.videotape.problem ',req,' nodeProp> ',m?m.getAttribute("vidtapeorigprops"):'falsey','please report the URL');return false;};
	return m;
}

var currentWindowSize={w: 1,h: 1};
var lastWindowSize={w: 1,h: 1};
function setWindowSize(s){
	s.w=window.innerWidth,
	s.h=window.innerHeight;
}
setWindowSize(lastWindowSize);
window.addEventListener('resize', function(){
	setWindowSize(currentWindowSize);
	var offset,m,i,l,offsetX,offsetY;
	for(i=0,l=validNodes.length;i<l;i++){
		m = validNodes[i].elm;
		if( m.style.position=='fixed' ){
			offsetX = parsePx(m.style.left),
			offsetY = parsePx(m.style.top);

			if( currentWindowSize.w > m.clientWidth && offsetX+(m.clientWidth*0.5) > lastWindowSize.w*0.5 ){ // right half
				m.style.left=Math.round(offsetX+(currentWindowSize.w-lastWindowSize.w))+'px';
			}
			if( currentWindowSize.h > m.clientHeight && offsetY+(m.clientHeight*0.5) > lastWindowSize.h*0.5 ){ // bottom half
				m.style.top=Math.round(offsetY+(currentWindowSize.h-lastWindowSize.h))+'px';
			}
		}
	}
	setWindowSize(lastWindowSize);
});

if(!document.body.getAttribute('chromeextension:video-tape'))chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
	var m, i, l;
	if (request.getLayout){
		tabid = request.tabid;
		var response=[];
		for(i=0,l=validNodes.length;i<l;i++){
			m = validNodes[i].elm;
			var sp=getFixedOffset(m);
			response.push({x:sp.x,y:sp.y,w:m.scrollWidth,h:m.scrollHeight,fixed:m.style.position=='fixed'});
		}
		sendResponse({win:{w:getWindowWidth(),h:getWindowHeight(),scrypcnt:window.pageYOffset/(document.body.scrollHeight-getWindowHeight()),docHei:document.body.scrollHeight,scry:window.pageYOffset},elm:response});
	}else if (typeof(request.scrToYpcnt)!='undefined'){
		window.scrollTo(0,Math.round(request.scrToYpcnt * (document.body.scrollHeight-getWindowHeight())));
	}else if (typeof(request.scrToYpx)!='undefined'){
		window.scrollTo(0,request.scrToYpx);
	}else if (request.mwheel){
		window.scrollBy(0,-request.mwheel*0.5);
	}else if (request.moveVideo){
		m = videoNodeAt(request, request.moveVideo);
		if( !m ) return sendResponse({});
		var ith=10;
		var oth=30;
		if(request.x < ith && request.x > -oth)request.x=0;
		if(request.y < ith && request.y > -oth)request.y=0;
		m.style.top=(request.y)+'px';
		m.style.left=(request.x)+'px';
		computeBoxShadow(m);
		if(i!=lasMoveVideo)
			m.style.zIndex=++topFixed;
		lasMoveVideo=i;
	}else if (request.sizeVideo){
		m =  videoNodeAt(request, request.sizeVideo);
		if( !m ) return sendResponse({});
		m.style.height=(request.h)+'px';
		m.style.width=(request.w)+'px';
		computeBoxShadow(m);
		// if( validNodes[request.sizeVideo-1].typ == 'iframe' ){
		// 	console.log('iframe');
		// 	if(m.nodeName == 'IFRAME'){
		// 		console.log('IFRAME');
		// 		if( m.contentDocument ){
		// 			console.log(m.contentDocument);
		// 			if( m.contentDocument.body ){
		// 				console.log(m.contentDocument.body);
		// 			}
		// 		}
		// 	}
		// }
	}else if (request.fixVideo){
		m =  videoNodeAt(request, request.fixVideo);
		if( !m ) return sendResponse({});
		m=affixVideo(m);
		sendResponse({src:m?m.src:''});
	}else if (request.unfixVideo){
		m =  videoNodeAt(request, request.unfixVideo);
		if( !m ) return sendResponse({});
		unfixVideo(m, request.showRestored);
		sendResponse({});
	}else if (request.domDetachVideo){
		m =  videoNodeAt(request, request.domDetachVideo);
		if( !m ) return sendResponse({});
		if(m.style.position!='fixed')affixVideo(m);
		m.setAttribute('domDetached',true);
		if(request.attachToTop)
			document.body.insertBefore(m.parentNode.removeChild(m),document.body.firstChild);
		else
			document.body.appendChild(m.parentNode.removeChild(m));
	}else if (request.removeVideo){
		m =  videoNodeAt(request, request.removeVideo);
		if( !m ) return sendResponse({});
		m.parentNode.removeChild(m);
		checkForNodes();
		sendResponse({});
	}else if (request.justOpened){
		vidDropShadow = request.vidDropShadow?true:false;
		tabid = request.tabid;
		checkForNodes();
		sendResponse({});
	}else sendResponse({});
});
document.body.setAttribute('chromeextension:video-tape',true);
}//end block