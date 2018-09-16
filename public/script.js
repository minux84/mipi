var socket = null;

$(function () {
	
    socket = io('http://'+window.location.hostname+':3000');
	
	socket.emit('init');
	
	socket.on('devices', function(data){				
		buildList('.devices-list', data);
		initList();
	});
	
	socket.on('restoreState', function(data){

		buildList('.devices-out',data.device_out);
		buildList('.devices-in',data.device_in);
		initList();
	});
	
	$(".reset-btn").click(reset);
	
	if(window.orientation == 0 || window.orientation == 180){
		alert("Rotate your device to best experience!");
	}

});

function buildList(listContainer, data){

    var html = "";
    
	data.forEach(function(data){
		html += "<li class='list-group-item' data-val='"+data.val+"'>"+data.label+"</li>";
	});
	
	$(listContainer).html(html);	            
}

function initList(){
    
	var options = { 
		group: "devices",
		onStart: function (e){
			$(".wrapper").addClass("no-scroll");	
		},
		onEnd: function (e) {
			$(".wrapper").removeClass("no-scroll");	
			sendData(); 
		}
	};

	for (const list of document.querySelectorAll("ol.devices")) {
	    Sortable.create(list, options);
	}
	
}


function sendData(){
    var data = [];
    var currentState = {device_out: [], device_in: []};
    
    $(".devices-in li.list-group-item").each(function(){ 
        var device_in = this;
        if(device_in){
            
            var device_in_id = $(device_in).attr('data-val')+"0";
            
        	$(".devices-out li.list-group-item").each(function(){
	        	var device_out = this;

	        	if(device_out){
		            var device_out_id = $(device_out).attr('data-val')+"0";
		            if(device_in_id != device_out_id)
		        		data.push("aconnect "+$(device_out).attr('data-val')+"0"+" "+$(device_in).attr('data-val')+"0");					        	
	        	}
	        	
        	});   			            
        }

    });
    
    if(data.length > 0){
    	socket.emit("midiSetup", data);
    }else{
	    socket.emit("resetMidi");
    }
    
    $(".devices-in li.list-group-item").each(function(){
        var device_in = this;
        currentState.device_in.push({ val: $(device_in).attr('data-val'), label: $(device_in).text() });
    });
    
    $(".devices-out li.list-group-item").each(function(){
	    var device_out = this;
		currentState.device_out.push({ val: $(device_out).attr('data-val'), label: $(device_out).text() });
    });
    
    socket.emit("saveState", currentState);

}

function reset(){
	$(".devices-in, .devices-out").empty();
	socket.emit("resetConnections");
}
