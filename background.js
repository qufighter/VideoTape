chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.enable){
		//chrome.action.show(sender.tab.id)
		//action.setIcon closes a action popup that is already showing on Vista, we try to avoid calling this redundantly
		chrome.action.setIcon({tabId:sender.tab.id, path:{19:'images/icon19.png',38:'images/icon38.png'}}, function(){})
		sendResponse({});
	}else if(request.updateCount){

		if( request.updateCount == '0'){
			chrome.action.setIcon({tabId:sender.tab.id, path:{19:'images/icon19.png',38:'images/icon38.png'}}, function(){});
			return sendResponse({});
		}

        // follwing is uselees code in manifest v3... not sure where or how we'd render any custom icon anymore!!! wf
//		var canvas = document.createElement('canvas');
//		context = canvas.getContext('2d');
//		base_image = new Image();
//		base_image.src = chrome.extension.getURL('images/icon128.png');
//		base_image.onload = function(ev){
//			canvas.width = ev.target.width;
//			canvas.height = ev.target.height;
//			context.drawImage(base_image, 0, 0);
//			context.font = '58px sans-serif';
//			context.textAlign = 'center';
//			context.textBaseline='middle';
//			context.fillText(request.updateCount, 64, 64);
//			chrome.action.setIcon({tabId:sender.tab.id, imageData: context.getImageData(0, 0, canvas.width, canvas.height)}, function(){})
//		}
		sendResponse({});
	}else if(request.disable){
		//chrome.action.hide()
		chrome.action.setIcon({tabId:sender.tab.id, path:{19:'images/inactive/icon19.png',38:'images/inactive/icon38.png'}}, function(){})
		sendResponse({});
	}else{
		sendResponse({});
	}
});

if( typeof(localStorage) != 'undefined' ){
    // manifest v3... not sure we use LocalStoage anymore...
    if(typeof(localStorage["reallyShareVideos"])=='undefined')localStorage["reallyShareVideos"]=false;

    localStorage.removeItem("usageStatistics");
    localStorage.removeItem("feedbackOptOut");
    localStorage.removeItem("shareVideos");
}
