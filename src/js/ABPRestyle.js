var ABP_Restyle = function() {
	setTimeout(function(){
		var playerUnits = document.getElementsByClassName("ABP-Unit");
		for (var i=0;i<playerUnits.length;++i) {
			var pUnit = playerUnits[i];
			var pCommentList = pUnit.getElementsByClassName("ABP-CommentList-Container")[0];
			pCommentList.style.height = (pUnit.getBoundingClientRect().bottom-pCommentList.getBoundingClientRect().bottom-1)+"px";
		};
	},5000);
};
