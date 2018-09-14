#!/usr/bin/env node

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var readline = require('readline');
var fs = require('fs');
var exec = require('child_process').exec;



var initDevices = function(socket, firstInit = false, emit = false){
	exec("aconnect -l | grep client > "+__dirname+"/midi_devices.txt", function (error, stdout, stderr) { 
		
		var devices = [];
		
		const rl = readline.createInterface({
		  input: fs.createReadStream(__dirname+'/midi_devices.txt'),
		  crlfDelay: Infinity
		});  
		
		var i = 0;
		rl.on('line', (line) => {
			if(i > 1){
				devices.push({
					"val":line.split(" ")[1],
					"label":line.split("'")[1]	
				});				
			}
			
			i++;
		}); 
		
		
		rl.on('close', () => {
			if(emit)
				socket.emit('devices', devices);
				
			if(firstInit){
				const rl = readline.createInterface({
				  input: fs.createReadStream(__dirname+'/init.txt'),
				  crlfDelay: Infinity
				});  
				
				rl.on('line', (line) => {
					exec(line, null);
				}); 				
			}
			
		});	
		
	});
	
	//restoreData(socket);			

};

var restoreData = function(socket){
	
	if(fs.existsSync(__dirname +'savedState.json')){
		var savedState = JSON.parse(fs.readFileSync('savedState.json', 'utf8'));
		
		if(savedState){
			socket.emit('restoreState', savedState);
		}				
	}
	
};


initDevices(null, true);

app.use('/static', express.static(__dirname+'/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
	
	
	socket.on('init', function(data){

		initDevices(socket, false, true);		
		
		if(fs.existsSync(__dirname+'/savedState.json')){
			var savedState = JSON.parse(fs.readFileSync(__dirname+'/savedState.json', 'utf8'));
			
			if(savedState){
				socket.emit('restoreState', savedState);
			}				
		}

	});
		
 
    socket.on('midiSetup', function (data) {
	    exec("aconnect -x");
	    
	    var connections = "";
        
        data.forEach(function(connection){
	        exec(connection, null);
			connections += connection+"\n";
			
        });

        fs.writeFileSync(__dirname+'/init.txt', connections);
    });

	
	socket.on('saveState', function (data) {
        fs.writeFileSync(__dirname+'/savedState.json', JSON.stringify(data));
        initDevices(socket, false, true);
	});
	
	socket.on('resetMidi', function(){
		exec("aconnect -x");
	});

});
  
http.listen(3000, function () {   
  exec("hostname -I", function (error, stdout, stderr){
	var ip = stdout.slice(0, -2);
  	
  	console.log('Server started. Listening on http://'+ip+':3000');
  });    
});



