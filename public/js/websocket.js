var userName,socket,tbxUsername,tbxMsg,divChat;

function $(id){
	return document.getElementById(id);
}

var EventUtil={
	addHander:function (dom,type,fn){
		if(dom.addEventListener){
			dom.addEventListener(type,fn,false);
		}else if(dom.attachEvent){
			dom.attachEvent('on'+type,fn);
		}else{
			dom['on'+type]=fn;
		}
	},
	getEvent:function(event){
		return event ? event:window.event;
	},
};

EventUtil.addHander(window,'load',window_onload);
EventUtil.addHander(window,'unload',window_onunload);
EventUtil.addHander($('btnLogin'),'click',btnLogin_onclick);
EventUtil.addHander($('btnLogout'),'click',btnLogout_onclick);
EventUtil.addHander($('btnSend'),'click',btnSend_onclick);
EventUtil.addHander($('tbxMsg'),'keydown',btnSend_onkeydown);


function btnSend_onkeydown(event){
	event=EventUtil.getEvent(event);
	if(event.keyCode==13){
		btnSend_onclick();
	}
}
function window_onload(){
	divChat=$('divchat');
	tbxUsername=$('tbxUsername');
	tbxMsg=$('tbxMsg');
	tbxUsername.focus();
	tbxUsername.select();
}


function AddMsg(msg){
	divChat.innerHTML+=msg+'<br>';
	if(divChat.scrollHeight>divChat.clientHeight)
		divChat.scrollTop=divChat.scrollHeight-divChat.clientHeight;
}

function btnLogin_onclick(){
	if(tbxUsername.value.trim()==''){
		alert('请输入用户名');
		return;
	}
	userName=tbxUsername.value.trim();
	socket=io.connect();
	socket.on('connect',function(){
		AddMsg('与聊天服务器的连接已建立。');
		socket.on('login',function(name){
			AddMsg('欢迎用户'+name+'进入聊天室。');
		});
		socket.on('sendClients',function(names){
			var divRight=$('divRight');
			var str="";
			names.forEach(function(name){
				str+=name+"<br>";
			});
			divRight.innerHTML="用户列表:<br>";
			divRight.innerHTML+=str;
		});
		socket.on('chat',function(data){
			AddMsg(data.user+':'+data.msg);
		});
		socket.on('disconnect',function(){
			AddMsg('与聊天服务器的连接已断开');
			$('btnSend').disabled=true;
			$('btnLogout').disabled=true;
			$('btnLogin').disabled="";
			divRight.innerHTML="用户列表";
		});

		socket.on('duplicate',function(){
			alert('该用户名已被使用。');
			$('btnSend').disabled=true;
			$('btnLogout').disabled=true;
			$('btnLogin').disabled="";
		});
	});

	socket.on('error',function(err){
		AddMsg('与聊天服务器之间的连接发生错误。');
		socket.disconnect();
		socket.removeAllListeners('connect');
		io.sockets={};
	});
	socket.emit('login',userName);
	$('btnSend').disabled='';
	$('btnLogout').disabled='';
	$('btnLogin').disabled=true;
}

function btnSend_onclick(){
	var msg=tbxMsg.value;
	// console.log(msg)
	if(msg.length>0){
		socket.emit('chat',{user:userName,msg:msg});
		tbxMsg.value='';
	}
}

function btnLogout_onclick(){
	socket.emit('logout',userName);
	socket.disconnect();
	socket.removeAllListeners('connect');
	io.sockets={};
	AddMsg("用户"+userName+"退出聊天室");
	var divRight=$('divRight');
	$('btnSend').disabled=true;
	$('btnLogout').disabled=true;
	$('btnLogin').disabled="";
	divRight.innerHTML="用户列表";
}

function window_onunload(){
	socket.emit('logout',userName);
	socket.disconnect();
}

