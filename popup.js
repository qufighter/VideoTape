var tabid=0;
var scaleFactor = 0.2;
function _ge(g){
	return document.getElementById(g);
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
function getEventTargetA(ev){
	var targ=getEventTarget(ev);
	if(targ.nodeName != 'A')return targ.parentNode;
	return targ;
}
function preventEventDefault(ev){
	ev = ev || event;
	if(ev.preventDefault)ev.preventDefault();
	ev.returnValue=false;
	return false;
}
function stopEventPropagation(ev){
	ev = ev || event;
	if(ev.stopPropagation)ev.stopPropagation();
	ev.cancelBubble=true;
}



//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request.updatePreview){
			getCurrentLayout();
    }
    sendResponse({});
  }
);

function videoElmToIdNum(elm){
	return elm.id.split('_')[1]-0+1;
}

var ctx_cur_video_id=false;

function clearContextMenu(){
	if(_ge('contextMenu'))_ge('contextMenu').parentNode.removeChild(_ge('contextMenu'));
}

function ctx_dom_detach_totop_video(ev){
	chrome.tabs.sendRequest(tabid,{domDetachVideo:ctx_cur_video_id,attachToTop:true},function(r){getCurrentLayout();});
}
function ctx_dom_detach_tobtm_video(ev){
	chrome.tabs.sendRequest(tabid,{domDetachVideo:ctx_cur_video_id},function(r){getCurrentLayout();});
}
function ctx_close_video(){
	chrome.tabs.sendRequest(tabid,{removeVideo:ctx_cur_video_id},function(r){getCurrentLayout();});
}
function ctx_unfix_video(ev){
	chrome.tabs.sendRequest(tabid,{unfixVideo:ctx_cur_video_id},function(r){getCurrentLayout();});
}
function ctx_unfix_scrollto_video(ev){
	chrome.tabs.sendRequest(tabid,{unfixVideo:ctx_cur_video_id,showRestored:true},function(r){getCurrentLayout();});
}
function ctx_fix_video(ev){
	chrome.tabs.sendRequest(tabid,{fixVideo:ctx_cur_video_id},function(r){getCurrentLayout();});
}

function vidContextMenu(ev){
	
	var elm=getEventTarget(ev);
	ctx_cur_video_id=videoElmToIdNum(elm);
	
	clearContextMenu();
	
	var ctxItms=[];
	//ctxItms.push(Cr.elm('a',{events:[['click',ctx_unfix_video]]},[Cr.txt('Hello')]));
	if(elm.className=='videofixed'){
		ctxItms.push(Cr.elm('a',{events:[['mouseup',ctx_unfix_video,true]]},[Cr.txt('Restore Video')]));
		ctxItms.push(Cr.elm('a',{events:[['mouseup',ctx_unfix_scrollto_video,true]]},[Cr.txt('Restore and Scroll to Video')]));
	}else{
		ctxItms.push(Cr.elm('a',{events:[['mouseup',ctx_fix_video,true]]},[Cr.txt('Affix Video')]));
	}
	ctxItms.push(Cr.elm('a',{events:[['mouseup',ctx_dom_detach_totop_video,true]]},[Cr.txt('DOM attach at Top')]));
	ctxItms.push(Cr.elm('a',{events:[['mouseup',ctx_dom_detach_tobtm_video,true]]},[Cr.txt('DOM attach at End')]));
	ctxItms.push(Cr.elm('a',{events:[['mouseup',ctx_close_video,true]]},[Cr.txt('End Video')]));
	ctxItms.push(Cr.elm('a',{events:[['mouseup',clearContextMenu,true]]},[Cr.txt('Close Menu')]));

	var xpos=ev.pageX;
	if(ev.pageX > document.body.clientWidth -100)xpos-=100;
	Cr.elm('div',{id:'contextMenu',style:'position:absolute;top:'+ev.pageY+'px;left:'+xpos+'px;'},ctxItms,document.body);
	
	return preventEventDefault(ev);
}

var isdrag=false,scdrag=false,d_x=0,d_y=0,ds_x=0,ds_y=0;
function vmdown(ev){
	if(ev.which != 1) return;
	isdrag=getEventTarget(ev),
	d_x=ev.pageX,d_y=ev.pageY;
	ds_x=d_x,ds_y=d_y;
	return preventEventDefault(ev);
}
function scrollmdown(ev){
	scdrag=getEventTarget(ev),
	d_x=ev.pageX,d_y=ev.pageY;
	ds_x=d_x,ds_y=d_y;
	return preventEventDefault(ev);
}
function vmup(ev){
	var elm=isdrag || getEventTarget(ev);
	
	scdrag=false;

	if(ev.which == 2){
		chrome.tabs.sendRequest(tabid,{removeVideo:videoElmToIdNum(elm)},function(r){
			getCurrentLayout();
		});
		isdrag=false;
		return;
	}
	
	if(elm.className=='videofixed' && (ds_x!=ev.pageX || ds_y!=ev.pageY)){
		isdrag=false;
		return;
	}
	
	if(ev.which != 1)return;
	clearContextMenu();
	
	if(elm.className=='videofixed'){
		elm.className='video';
		chrome.tabs.sendRequest(tabid,{unfixVideo:videoElmToIdNum(elm)},function(r){getCurrentLayout();});
		
	}else if(elm.className=='video'){
		elm.className='videofixed';
		chrome.tabs.sendRequest(tabid,{fixVideo:videoElmToIdNum(elm)},function(r){getCurrentLayout();});
		mmf(ev);
	}
	
	isdrag=false;
}

function mmf(ev){
	if(isdrag){
		var nx=isdrag.style.left.replace('px','')-0+(ev.pageX-d_x);
		var ny=isdrag.style.top.replace('px','')-0+(ev.pageY-d_y);
		isdrag.style.left=nx+'px';
		isdrag.style.top=ny+'px';
		d_x=ev.pageX,d_y=ev.pageY;
		
		if(isdrag.className=='videofixed'){
			chrome.tabs.sendRequest(tabid,{moveVideo:videoElmToIdNum(isdrag),x:Math.round(nx/scaleFactor),y:Math.round(ny/scaleFactor)},function(r){});
		}
		return preventEventDefault(ev);
	}else if(scdrag){
		var maxSc=_ge('miniscreen').clientHeight - scdrag.clientHeight;
		var ny=scdrag.style.top.replace('px','')-0+(ev.pageY-d_y);
		if(ny < 0)ny=0;
		if(ny > maxSc)ny=maxSc;
		scdrag.style.top=ny+'px';
		d_x=ev.pageX,d_y=ev.pageY;
		chrome.tabs.sendRequest(tabid,{scrToYpcnt:(ny/maxSc)},function(r){});
		return preventEventDefault(ev);
	}
}

function mwheel(ev){
	chrome.tabs.sendRequest(tabid,{mwheel:ev.wheelDelta},function(r){});
}

function getCurrentLayout(){
	chrome.tabs.sendRequest(tabid,{getLayout:true,tabid:tabid},function(r){
		
		if(initalLoad){
			var lo=_ge('load');if(lo)lo.parentNode.removeChild(lo);
		}
		
		r.win.w=Math.ceil(r.win.w*scaleFactor);
		r.win.h=Math.ceil(r.win.h*scaleFactor);
		
		var childs=[];
		
		for(var i=0,l=r.elm.length;i<l;i++){
			var cl=r.elm[i].fixed ? 'videofixed' : 'video';
			
			childs.push(
				Cr.elm('div',{'id':'vproxy_'+i,
											'class':cl,
											'style':'top:'+Math.round(r.elm[i].y*scaleFactor)+'px;left:'+Math.round(r.elm[i].x*scaleFactor)+'px;width:'+Math.round(r.elm[i].w*scaleFactor)+'px;height:'+Math.round(r.elm[i].h*scaleFactor)+'px;',
										  'events':[['mousedown',vmdown],['dragstart',preventEventDefault],['contextmenu',vidContextMenu]]
										 },[/*Cr.elm('div',{class:'resize-se'},[])*/])
			);
			
		}
		var ms=_ge('miniscreen');
		if(ms)_ge('msbox').removeChild(ms);
		ms=Cr.elm('div',{'id':'miniscreen','style':'width:'+r.win.w+'px;height:'+r.win.h+'px;'},childs,_ge('msbox'));

		
		if(!scdrag){
			_ge('scrolldrag').style.top=Math.round(r.win.scrypcnt*(r.win.h-_ge('scrolldrag').clientHeight))+'px';
			
		}

	});
}

initalLoad=true;
function iin(){
	Cr.elm('div',{'id':'scrolldrag',
		'style':'top:'+(0)+'px;right:'+(0)+'px;width:'+(10)+'px;height:'+(20)+'px;',
	  'events':[['mousedown',scrollmdown],['dragstart',preventEventDefault]]
	 },[],_ge('msbox'))
	
	document.body.addEventListener('mousemove',mmf);
	document.body.addEventListener('mouseup',vmup);
	window.addEventListener('mousewheel',mwheel);
	chrome.windows.getCurrent(function(window){
		chrome.tabs.getSelected(window.id, function(tab){
			tabid=tab.id;
			//chrome.tabs.sendRequest(tabid,{justOpened:true,tabid:tabid},function(r){});
			getCurrentLayout();
		})
	})
}

function toggle_next_sibling_display(ev){
	who=getEventTargetA(ev);
	var nss=who.nextSibling.style;if(nss.display=='block')nss.display='none';else nss.display='block';
}

document.addEventListener('DOMContentLoaded', function () {
	iin();
	//_ge('popout').addEventListener('click', popOut);
	
	document.getElementById('helpbtn').addEventListener('click', toggle_next_sibling_display);
});
