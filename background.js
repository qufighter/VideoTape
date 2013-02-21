chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request.enable){
			chrome.pageAction.show(sender.tab.id)
			sendResponse({});
		}else if(request.disable){
			chrome.pageAction.hide(sender.tab.id)
			sendResponse({});
    }else{
    	sendResponse({});
    }
  });
