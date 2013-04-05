chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.enable){
			chrome.pageAction.show(sender.tab.id)
			chrome.pageAction.setIcon({tabId:sender.tab.id, path:{19:'images/icon19.png',38:'images/icon38.png'}}, function(){})
			sendResponse({});
		}else if(request.disable){
			//chrome.pageAction.hide()
			chrome.pageAction.setIcon({tabId:sender.tab.id, path:{19:'images/inactive/icon19.png',38:'images/inactive/icon38.png'}}, function(){})
			sendResponse({});
		}else{
    	sendResponse({});
    }
  });

if(typeof(localStorage["usageStatistics"])=='undefined')localStorage["usageStatistics"]=true;
if(typeof(localStorage["shareVideos"])=='undefined')localStorage["shareVideos"]=true;

if(localStorage["usageStatistics"]=='true' && !navigator.doNotTrack){
	localStorage.removeItem("feedbackOptOut");
}else{
	localStorage.feedbackOptOut = "true";
}
