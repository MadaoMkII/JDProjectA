function asf () {
	alert(1);
}

function init (num) {
	var firstBtn = $('<li></li>');
	var upBtn = $('<li></li>');
	var downBtn = $('<li></li>');
	var lastBtn = $('<li></li>');
	firstBtn.html('<a href="javascript:void(0)">首页</a>');
	upBtn.html('<a href="javascript:void(0)"><<</a>');
	downBtn.html('<a href="javascript:void(0)" v-on:click="goNext()">>></a>');
	lastBtn.html('<a href="javascript:void(0)">末页</a>');
	$('#pagination').append(firstBtn);
	$('#pagination').append(upBtn);
	if (num<=5) {
		for (var i=1;i<num+1;i++) {
			var btn = $('<li></li>');
			btn.html('<a href="javascript:void(0)">'+i+'</a>');
			$('#pagination').append(btn);
		}
	} 
	else{
		for (var i=1;i<6;i++) {
			if (i<5) {
				var btn = $('<li></li>');
				btn.html('<a href="javascript:void(0)">'+i+'</a>');
			} else{
				var btn = $('<li></li>');
				btn.html('<a href="javascript:void(0)">...</a>');
			}
			$('#pagination').append(btn);
		}
	}
	$('#pagination').append(downBtn);
	$('#pagination').append(lastBtn);
}

function nextPage () {
	alert(1);
}

export{asf,init,nextPage}
