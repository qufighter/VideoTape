var pOptions=[];
var pAdvOptions=[];

pOptions["vidDropShadow"]={def:false,ind:0,name:'Add Drop Shadow'};
pOptions["takeSnapshots"]={def:false,ind:0,name:'Take Page Snapshots for Preview'};
pOptions["restoreScrolls"]={def:true,ind:0,name:'Restore scrolls to video'};
pOptions["usageStatistics"]={def:true,ind:0,name:'Gather Usage Statistics (See Terms of Use)'};
pOptions["shareVideos"]={def:true,ind:0,name:'Share Video Statistics (See Terms of Use)'};

function setOptionDefaults(){
	for( i in pOptions){
		if(typeof(localStorage[i])=='undefined'){
			localStorage[i] = pOptions[i].def;
		}
	}
	for( i in pAdvOptions){
		if(typeof(localStorage[i])=='undefined'){
			localStorage[i] = pAdvOptions[i].def;
		}
	}
}

setOptionDefaults();