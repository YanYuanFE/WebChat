var sio=require("socket.io");
var express=require('express');
var http=require("http");

var app=express();
var server=http.createServer(app);
app.use('public',express.static('public'));
app.use(express.static(__dirname));
app.get('',function(req,res){
	res.sendfile(__dirname+'/index.html');
});

server.listen(1337);

var io=sio.listen(server);
var names=[];

io.sockets.on('connection',function(socket){
	socket.on('login',function(name){
		for(var i=0;i<names.length;i++){
			if(names[i]==name){
				socket.emit('duplicate');
				return;
			}
		}
		names.push(name);
		io.sockets.emit('login',name);
		io.sockets.emit('sendClients',names);
	});

	socket.on('chat',function(data){
		io.sockets.emit('chat',data);
	});

	socket.on('logout',function(name){
		for(var i=0;i<names.length;i++){
			if(names[i]==name){
				names.splice(i,1);
				break;
			}
		}
		socket.broadcast.emit('logout',name);
		io.sockets.emit('sendClients',names);
	});
	
});
