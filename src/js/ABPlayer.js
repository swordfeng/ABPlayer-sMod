var ABP = {
	"version":"0.8.0.1-sMod_bili"
};

(function(){
	"use strict";
	if(!ABP) return;
	var $ = function (e) { return document.getElementById(e); };
	var _ = function (type, props, children, callback) {
		var elem = null;
		if (type === "text") {
			return document.createTextNode(props);
		} else {
			elem = document.createElement(type);
		}
		for(var n in props){
			if(n === "style"){
				for(var x in props.style){
					elem.style[x] = props.style[x];
				}
			}else if(n === "className"){
				elem.className = props[n];
			}else if (n === "html") {
				elem.innerHTML = props[n];
			} else if (n === "tooltip") {
				elem.tooltip = props[n];
				addClass( elem.tooltip, "ABP-Tooltip");
				elem.addEventListener("mouseover", function(e){
					elem.parentElement.appendChild(elem.tooltip);
					var pr=elem.parentElement.getBoundingClientRect();
					var er=elem.getBoundingClientRect();
					var tr=elem.tooltip.getBoundingClientRect();
					elem.tooltip.style.left=(er.left-pr.left+er.width/2-tr.width/2)+"px";
					elem.tooltip.style.top=(-tr.height-2)+"px";
					if (typeof elem.updatetooltip !== "undefined" && elem.updatetooltip) elem.updatetooltip(e);
				});
				elem.addEventListener("mousemove", function(e){
					if (typeof elem.updatetooltip !== "undefined" && elem.updatetooltip) elem.updatetooltip(e);
				});
				elem.addEventListener("mouseout", function(){
					elem.tooltip.parentElement.removeChild(elem.tooltip);
				});
			}else {
				elem.setAttribute(n, props[n]);
			}
		}
		if (children) {
			for(var i = 0; i < children.length; i++){
				if(children[i] != null)
					elem.appendChild(children[i]);
			}
		}
		if (callback && typeof callback === "function") {
			callback(elem);
		}
		return elem;
	};
	var addClass = function(elem, className){
		if(elem == null) return;
		var oldClass = elem.className.split(" ");
		if(oldClass.indexOf(className) < 0){
			oldClass.push(className);
		}
		elem.className = oldClass.join(" ");
	};
	var hasClass = function(elem, className){
		if(elem == null) return false;
		var oldClass = elem.className.split(" ");
		return oldClass.indexOf(className) >= 0;
	};
	var removeClass = function(elem, className){
		if(elem == null) return;
		var oldClass = elem.className.split(" ");
		if(oldClass.indexOf(className) >= 0){
			oldClass.splice(oldClass.indexOf(className),1);
		}
		elem.className = oldClass.join(" ");
	};
	var buildFromDefaults = function (n, d){
		var r = {};
		for(var i in d){
			if(n && typeof n[i] !== "undefined")
				r[i] = n[i];
			else
				r[i] = d[i];
		}
		return r;
	}
	var makeEvent= function(eventname) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(eventname, false, false);
		return evt;
	};
	var makebar = function(elem) {
		var  mainbar = _("div", {
			"className": "dark"
		});
		var secondarybar = _("div", {
			"className": "load"
		});
		var _bar = _("div", {
			"className": "bar"
		},[secondarybar,mainbar ]);
		elem.appendChild(_bar);
		var _main,_secondary;
		elem.progress = {
			get main() {
				return _main;
			},
			set main(x) {
				if (typeof x !== "number" || x<0 || x>100) return;
				_main = x;
				mainbar.style.width = x + "%";
			},
			get secondary() {
				return _secondary;
			},
			set secondary(x) {
				if (typeof x !== "number" || x<0 || x>100) return;
				_secondary = x;
				secondarybar.style.width = x + "%";
			},
		};
		elem.progress.main = 0;
		elem.progress.secondary = 0;
		var dragging = false;
		var dragrate;
		_bar.addEventListener("mousedown", function(e){
			dragging = true;
			var pos = e.layerX;
			if (typeof e.offsetX == "number") pos = e.offsetX;
			if (pos>=0) dragrate=pos*100/this.offsetWidth;
			elem.progress.main = dragrate;
			elem.dispatchEvent(new Event("startdrag"));
		});
		document.addEventListener("mouseup", function(e){
			if (dragging) {
				dragging = false;
				elem.dispatchEvent(new Event("stopdrag"));
			}
		});
		_bar.addEventListener("mouseup", function(e){
			dragging=false;
			var pos = e.layerX;
			if (typeof e.offsetX == "number") pos = e.offsetX;
			if (pos>=0) dragrate=pos*100/this.offsetWidth;
			elem.progress.main = dragrate;
			elem.dispatchEvent(new Event("stopdrag"));
		});
		_bar.addEventListener("mousemove", function(e){
			if(dragging) {
				var pos = e.layerX;
				if (typeof e.offsetX == "number") pos = e.offsetX;
				if (pos>=0) {
					dragrate=pos*100/this.offsetWidth;
					elem.progress.main = dragrate;
					elem.dispatchEvent(makeEvent("ondrag"));
				}
			}
		});
		return elem;
	};


	ABP.create = function (element, params) {
		var elem = element;
		if(!params){
			params = {};
		}
		params = buildFromDefaults(params,{
			"replaceMode":true,
			"width":512,
			"height":384,
			"src":"",
			"mobile":false
		});
		if (typeof element === "string") {
			elem = $(element);
		}
		if(elem.children.length > 0 && params.replaceMode){
			elem.innerHTML = "";
		}
		// 'elem' is the parent container in which we create the player.
		var container;
		if(!hasClass(elem, "ABP-Unit")){
			container = _("div", {
				"className": "ABP-Unit",
				"style":{
					"width": params.width + "px",
					"height": params.height + "px"
				}
			});
			elem.appendChild(container);
		}else{
			container = elem;
		}
		var playlist = [];
		if(typeof params.src === "string"){
			params.src = _("video",{
				"className":"ABP-VideoItem",
				"preload":"meatdata",
			},[
				_("source",{
					"src":params.src
				})
			]);
			playlist.push(params.src);
		}else if(params.src.hasOwnProperty("playlist")){
			var data = params.src;
			var plist = data.playlist;
			for(var id = 0; id < plist.length; id++){
				if(plist[id].hasOwnProperty("sources")){
					var sources = [];
					for(var mime in plist[id]["sources"]){
						sources.push(_("source", {
							"src":plist[id]["sources"][mime],
							"type":mime
						}));
					}
					playlist.push(_("video",{
						"className":id==0?"ABP-VideoItem":"ABP-VideoItem ABP-VideoItemHidden",
						"preload":"metadata",
					},sources));
				}else if(plist[id].hasOwnProperty("video")){
					playlist.push(plist[id]["video"]);
				}else{
					console.log("No recognized format");
				}
			}
		}else{
			playlist.push(params.src);
		}
		var _video=[_("div", {
			"className":"ABP-Container"
		})];
		for (var i=0;i<playlist.length;i++) _video.push(playlist[i]);
		container.appendChild(_("div",{
			"className":"ABP-Player"
		},[
			_("div",{
				"className" : "ABP-Video",
				"tabindex" : "10"	
			}, 
			_video),
			_("div", {
				"className":"ABP-Toolbar",
			}, [
				_("div", {
					"className":"ABP-Text",
				},[
					_("div", {
						"className" : "button ABP-CommentFont"
					}),
					_("div", {
						"className" : "button ABP-CommentColor"
					}),
					_("div", {
						"className" : "button right ABP-CommentSend",
						"tooltip":_("div",{
							"html":"吃我电磁炮啦！",
						}),
					}),
					_("div", {
						"className": "ABP-TextBox autofill"
					},[
						_("input", {
							"type":"text"
						}),
					]),
				]),
				_("div", {
					"className":"ABP-Control"
				},[
					_("div", {
						"className": "button ABP-Play"
					}),
					_("div", {
						"className": "button right ABP-FullScreen"
					}),
					_("div", {
						"className": "button right ABP-FullWindow"
					}),
					_("div", {
						"className": "button right ABP-WideScreen"
					}),
					_("div", {
						"className": "button right ABP-Loop"
					}),
					_("div", {
						"className": "button right ABP-CommentShow",
					}),
					_("div",{
						"className":"ABP-Opacity",
					},[
						_("div",{
							"html":"弹幕透明度",
						}),
						_("div",{
							"className":"opacity-bar",
						}),
					]),
					_("div", {
						"className": "volume-bar right"
					}),
					_("div", {
						"className": "button right ABP-VolumeButton"
					}),
					_("div", {
						"className": "right ABP-TimeLabel"
					}),
					_("div", {
						"className": "progress-bar autofill"
					}),
				]),
			]),
			_("div", {
				"className": "box ABP-CommentFont-Box"
			}),
			_("div", {
				"className": "box ABP-CommentColor-Box"
			})
		]));
		container.appendChild(_("div",{
			"className":"ABP-CommentList ABP-SideBlock"
		},[
			_("div",{
				"className":"ABP-CommentList-Title"
			},[
				_("div", {
					"className":"time",
					"html":"时间"
				}),
				_("div", {
					"className":"content",
					"html":"评论"
				}),
				_("div", {
					"className":"date",
					"html":"发送日期",
				})
			]),
			_("div",{
				"className":"ABP-CommentList-Container"
			})
		]));
		container.appendChild(_("div",{
			"className":"ABP-InfoBox ABP-SideBlock"
		},[
			//todo
		]));
		container.appendChild(_("div",{
			"className":"ABP-Settings ABP-SideBlock"
		},[
			//todo
		]));
		var bind = ABP.bind(container, params.mobile);
		if (params.src.hasOwnProperty("danmaku")) {
			CommentLoader(params.src.danmaku, bind.cmManager);
			console.log(bind.cmManager);
		}
		return bind;
	}

	ABP.bind = function (playerUnit, mobile, state) {
		var currentTime=0;
		var dragging = false;
		var waitting = false;
		var ABPInst = {
			btnPlay:null,
			divComment:null,
			btnFullScr:null,
			btnFullWin:null,
			btnWide:null,
			btnDm:null,
			btnLoop:null,
			videos:null,
			timeLabel:null,
			divTextField:null,
			txtText:null,
			cmManager:null,
			currentItem:0,
			duration:0,
			buffered:0,
			defaults:{
				w:0,
				h:0
			},
			state:buildFromDefaults(state, {
				widescreen: false,
				fullwindow: false,
				fullscreen: false,
				commentVisible: true,
				allowRescale: false,
				autosize: false,
				loop:false
			}),
			createPopup:null,
			removePopup:null,
			swapVideo: null,
			resetLayout:null,
			wideScreen:null,
			fullWindow:null,
			onReady:null,
			ready:false,
			onProgress:null,
			onBuffered:null,
			onStop:null,
			play:null,
			pause:null,
			playing:false,
			get currentTime() {
				return currentTime;
			},
			set currentTime(x) {
				seekto(x);
			}
		};

		function changeItem(item) {
			removeClass(ABPInst.videos[item],"ABP-VideoItemHidden");
			for (var i=0;i<ABPInst.videos.length;i++) {
				if (i!=item) {
					addClass(ABPInst.videos[i],"ABP-VideoItemHidden");
				}
			}
			ABPInst.currentItem=item; 
		}

		function seekto(pos) {
			ABPInst.videos[ABPInst.currentItem].pause();
			var item = 0;
			while ( item<ABPInst.videos.length && pos > ABPInst.videos[item].duration ) {
				pos -= ABPInst.videos[item].duration;
				item++;
			}
			if (item>=ABPInst.videos.length ) return;
			ABPInst.videos[item].currentTime=pos;
			changeItem(item);
			//currentTime=pos;
			if (ABPInst.cmManager) {
				ABPInst.cmManager.time(parseInt(pos*1000));
				ABPInst.cmManager.clear();
			}
			if (ABPInst.playing) {
				if (ABPInst.cmManager && ABPInst.cmManager.display)
					ABPInst.cmManager.start();
				ABPInst.videos[ABPInst.currentItem].play();
			}
		}


		ABPInst.resetLayout = function(){
			var e;
			ABPInst.state.widescreen=false;
			ABPInst.state.fullwindow=false;
			ABPInst.state.fullscreen=false;
			// if fullscreen
			if(window.outerHeight==screen.height && window.outerWidth==screen.width){
				var el = document;
				var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || 
					el.mozCancelFullScreen || el.exitFullScreen;
				if(typeof cfs != "undefined" && cfs) {
					cfs.call(el);
				} else if(typeof window.ActiveXObject != "undefined") {
					//for IE
					var wscript = new ActiveXObject("WScript.Shell");
					if(wscript != null) {
						wscript.SendKeys("{F11}");
					}
				}
			}
			removeClass(playerUnit,"ABP-Wide");
			removeClass(playerUnit,"ABP-Full");
			removeClass(playerUnit,"ABP-Screen");
			removeClass(document.getElementsByTagName("body")[0],"ABP-NoScroll");
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};
		ABPInst.wideScreen = function(){
			ABPInst.resetLayout();
			addClass(playerUnit, "ABP-Wide");
			ABPInst.state.widescreen=true;
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};

		ABPInst.fullWindow = function(){
			ABPInst.resetLayout();
			addClass(playerUnit, "ABP-Full");
			addClass(document.getElementsByTagName("body")[0],"ABP-NoScroll");
			ABPInst.state.fullwindow=true;
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};

		ABPInst.fullScreen = function(){
			ABPInst.fullWindow();
			var el = document.documentElement;
			var rfs = el.requestFullScreen || el.webkitRequestFullScreen || 
				el.mozRequestFullScreen || el.msRequestFullScreen;
			if(typeof rfs != "undefined" && rfs) {
				rfs.call(el);
			} else if(typeof window.ActiveXObject != "undefined") {
				//for IE
				var wscript = new ActiveXObject("WScript.Shell");
				if(wscript != null) {
					wscript.SendKeys("{F11}");
				}
			}
			addClass(playerUnit, "ABP-Screen");
			ABPInst.state.fullscreen=true;
			if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
		};


		ABPInst.play = function() {
			if (ABPInst.playing) return;
			ABPInst.videos[ABPInst.currentItem].play();
			addClass(ABPInst.btnPlay,"ABP-Pause");
			console.log(ABPInst.cmManager);
			if (ABPInst.cmManager && ABPInst.cmManager.display) ABPInst.cmManager.start();
			ABPInst.playing = true;
		};
		ABPInst.pause = function() {
			if (!ABPInst.playing) return;
			ABPInst.videos[ABPInst.currentItem].pause();
			removeClass(ABPInst.btnPlay,"ABP-Pause");
			if (ABPInst.cmManager) ABPInst.cmManager.stop();
			ABPInst.playing = false;
		};

		/*
			 ABPInst.swapVideo = function(video){
				 if(ABPInst.cmManager){
					 ABPInst.cmManager.clear();
					 video.addEventListener("progress", function(){
						 if(lastPosition == video.currentTime){
							 video.hasStalled = true;
							 ABPInst.cmManager.stopTimer();
						 }else
							 lastPosition = video.currentTime;
					 });
					 video.addEventListener("timeupdate", function(){
						 if(ABPInst.cmManager.display === false) return;
						 if(video.hasStalled){
							 ABPInst.cmManager.startTimer();
							 video.hasStalled = false;
						 }
						 ABPInst.cmManager.time(Math.floor(video.currentTime * 1000));
					 });
				 }
			 };
			 */
			ABPInst.defaults.w = playerUnit.offsetWidth; 
			ABPInst.defaults.h = playerUnit.offsetHeight;

			/* start binding */
			ABPInst.videos = playerUnit.getElementsByClassName("ABP-VideoItem");
			ABPInst.btnPlay = playerUnit.getElementsByClassName("ABP-Play")[0];
			ABPInst.barProgress = makebar(playerUnit.getElementsByClassName("progress-bar")[0]);
			ABPInst.btnFullWin = playerUnit.getElementsByClassName("ABP-FullWindow")[0];
			ABPInst.btnFullScr = playerUnit.getElementsByClassName("ABP-FullScreen")[0];
			ABPInst.btnWide = playerUnit.getElementsByClassName("ABP-WideScreen")[0];
			ABPInst.btnLoop = playerUnit.getElementsByClassName("ABP-Loop")[0];
			ABPInst.barVolume = makebar(playerUnit.getElementsByClassName("volume-bar")[0]);
			ABPInst.barOpacity = makebar(playerUnit.getElementsByClassName("opacity-bar")[0]);
			ABPInst.divTextField = playerUnit.getElementsByClassName("ABP-Text")[0];
			ABPInst.txtText = ABPInst.divTextField.getElementsByTagName("input")[0];
			ABPInst.btnDm = playerUnit.getElementsByClassName("ABP-CommentShow")[0];
			ABPInst.divComment = playerUnit.getElementsByClassName("ABP-Container")[0];
			ABPInst.timeLabel = playerUnit.getElementsByClassName("ABP-TimeLabel")[0];
			// bind danmaku
			if(typeof CommentManager !== "undefined"){
				ABPInst.cmManager = new CommentManager(ABPInst.divComment);
				ABPInst.cmManager.display = true;
				ABPInst.cmManager.init();
				ABPInst.cmManager.clear();
			}

			function convTime(t) {
				var sec=parseInt(t);
				var min=parseInt(sec/60);
				sec%=60;
				return min+":"+(sec<10?"0":"")+sec;
			}

			ABPInst.timeLabel.setTime = function(t) {
				this.innerHTML = convTime(t)+"/"+convTime(ABPInst.duration);
			}

			var time2rate = function(t) {
				return t*100/ABPInst.duration;
			}

			/* set events */

			// fullscreen monitor
			window.addEventListener("resize", function(){
				if (ABPInst.state.fullscreen && !(window.outerHeight==screen.height && window.outerWidth==screen.width))
					ABPInst.resetLayout();
			});
			//video init
			for (var i=0;i<ABPInst.videos.length;i++) {
				//init video
				var v=ABPInst.videos[i];
				var readyNum = 0;
				v.itemNo=i;
				v.buffComplete=false;
				v.addEventListener("loadedmetadata",function(){
					ABPInst.duration += ABPInst.videos[this.itemNo].duration;
					readyNum++;
					if (readyNum == ABPInst.videos.length) {
						ABPInst.ready=true;
						console.log("ABP duration "+ABPInst.duration);
						ABPInst.timeLabel.setTime(0);
						if (ABPInst.onReady) ABPInst.onReady();
					}
					ABPInst.videos[0].dispatchEvent(makeEvent("progress"));
				});
				v.addEventListener("progress", function(){
					var buff;
					try{
						buff = this.buffered.end(0);
					} catch(e) {
						return;
					}
					var firsttime = this.buffComplete;
					if (this.duration-this.buffered.end(0)<0.05) {
						this.buffComplete=true;
					} else this.buffComplete=false;
					for (var ii=0;ii<this.itemNo;ii++) {
						if(!ABPInst.videos[ii].buffComplete) return;
						buff+=ABPInst.videos[ii].duration;
					}
					ABPInst.buffered=buff;
					if (firsttime) { // now it's the first time
						var ii=this.itemNo+1;
						while (ii<ABPInst.videos.length&&ABPInst.videos[ii].buffComplete) {
							ABPInst.buffered += ABPInst.videos[ii].duration;
							ii++;
						}
						if(ii<ABPInst.videos.length) {
							ABPInst.videos[ii].play();
							ABPInst.videos[ii].pause();
						} else {
							if (ABPInst.onBuffered) ABPInst.onBuffered();
						}
					}
					ABPInst.barProgress.progress.secondary=time2rate(buff);
					if (ABPInst.onProgress) ABPInst.onProgress();
				});
				v.addEventListener("timeupdate", function() {
					if (this.itemNo != ABPInst.currentItem) return;
					if (waitting && ABPInst.cmManager) ABPInst.cmManager.start();
					waitting = false;
					var nowtime=this.currentTime;
					for (var ii=0;ii<this.itemNo;ii++) nowtime+=ABPInst.videos[ii].duration;
					currentTime=nowtime;
					if (!dragging) {
						ABPInst.timeLabel.setTime(nowtime);
						ABPInst.barProgress.progress.main=time2rate(nowtime);
					}
				});
				v.addEventListener("waitting", function(){
					if (this.itemNo == ABPInst.currentItem) {
						if ((!waitting) && ABPInst.cmManager)  ABPInst.cmManager.stop();
						waitting = true;
					}
				});
				v.addEventListener("ended", function() {
					if (this.itemNo != ABPInst.currentItem) return;
					if (this.itemNo<ABPInst.videos.length-1) {
						changeItem(this.itemNo+1);
						ABPInst.videos[this.itemNo+1].currentTime=0;
						ABPInst.videos[this.itemNo+1].play();
					} else {
						if (ABPInst.state.loop) {
							seekto(0);
						} else {
							ABPInst.playing=false;
							removeClass(ABPInst.btnPlay,"ABP-Pause");
						}
						if (ABPInst.onStop) ABPInst.onStop();
					}
				});
			}
			//buttons
			ABPInst.btnFullScr.addEventListener("click", function(){
				if(!ABPInst.state.fullscreen){
					ABPInst.fullScreen();
				}else{
					ABPInst.resetLayout();
				}
				/*
				 if(!ABPInst.state.allowRescale) return;
			 if(ABPInst.state.fullscreen){
				 if(ABPInst.defaults.w >0){
					 ABPInst.cmManager.def.scrollScale = playerUnit.offsetWidth / ABPInst.defaults.w;
				 }
			 }else{
				 ABPInst.cmManager.def.scrollScale = 1;
			 }
			 */
			});
			ABPInst.btnFullWin.addEventListener("click", function(){
				if((!ABPInst.state.fullwindow)||ABPInst.state.fullscreen) {
					ABPInst.fullWindow();;
				} else {
					ABPInst.resetLayout();
				}
			});
			ABPInst.btnWide.addEventListener("click",function(){
				if(!ABPInst.state.widescreen)
					ABPInst.wideScreen();
				else
					ABPInst.resetLayout();
			});
			ABPInst.btnDm.addEventListener("click", function(){
				if(ABPInst.cmManager.display == false){
					ABPInst.cmManager.display = true;
					ABPInst.cmManager.time(parseInt(ABPInst.currentTime*1000));
					ABPInst.cmManager.clear();
					ABPInst.cmManager.startTimer();
				}else{
					ABPInst.cmManager.display = false;
					ABPInst.cmManager.clear();
					ABPInst.cmManager.stopTimer();
				}
			});
			ABPInst.btnLoop.addEventListener("click", function(){
				if(!ABPInst.state.loop){
					ABPInst.state.loop=true;
					addClass(this,"ABP-Activated");
				}else{
					ABPInst.state.loop=false;
					removeClass(this,"ABP-Activated");
				}
			});
			ABPInst.btnPlay.addEventListener("click", function(){
				if(!ABPInst.playing){
					ABPInst.play();
				}else{
					ABPInst.pause();
				}
			});
			//progress bar
			ABPInst.barProgress.addEventListener("stopdrag", function(){
				seekto(this.progress.main / 100 * ABPInst.duration);
			});
			ABPInst.barProgress.addEventListener("ondrag", function(){
				ABPInst.timeLabel.setTime(this.progress.main/100*ABPInst.duration);
			});

			//volume bar
			ABPInst.barVolume.progress.main=100;
			ABPInst.barVolume.addEventListener("stopdrag", function(){
				for (var i=0;i<ABPInst.videos.length;i++) {
					ABPInst.videos[i].volume = ABPInst.barVolume.progress.main/100;
				}
			});
			ABPInst.barVolume.addEventListener("ondrag", function(){
				for (var i=0;i<ABPInst.videos.length;i++) {
					ABPInst.videos[i].volume = ABPInst.barVolume.progress.main/100;
				}
			});
			//opacity bar
			//todo
			//
			/* danmaku events */
			//todo 

			/* key events */
			playerUnit.addEventListener("keydown", function(e){
				if(e && e.keyCode == 32 && document.activeElement !== ABPInst.txtText){
					ABPInst.btnPlay.click();
					e.preventDefault();
				}
			});


				/*
			 //bar
			 if(Math.abs(newTime - ABPInst.video.currentTime) > 4){
				 if(ABPInst.cmManager)
					 ABPInst.cmManager.clear();
			 }
		 ABPInst.barHitArea.addEventListener("mousemove", function(e){
			 if(dragging){
				 ABPInst.barTime.style.width =((e.layerX) * 100 / this.offsetWidth) + "%";
			 }
		 });


		 if(mobile){
			 // Controls
			 var controls = playerUnit.getElementsByClassName("ABP-Control");
			 if(controls.length > 0){
				 ABPInst.controlBar = controls[0];
			 }
			 var timer = -1;
			 var hideBar = function(){
				 ABPInst.controlBar.style.display = "none";
				 ABPInst.divTextField.style.display = "none";
				 ABPInst.divComment.style.bottom = "0px";
				 ABPInst.cmManager.setBounds();
			 };
			 ABPInst.divComment.style.bottom = 
				 (ABPInst.controlBar.offsetHeight + ABPInst.divTextField.offsetHeight) + "px";
			 var listenerMove = function(){
				 ABPInst.controlBar.style.display = "";
				 ABPInst.divTextField.style.display = "";
				 ABPInst.divComment.style.bottom = 
					 (ABPInst.controlBar.offsetHeight + ABPInst.divTextField.offsetHeight) + "px";
				 try{
					 if (timer != -1){
						 clearInterval(timer);
						 timer = -1;
					 }
					 timer = setInterval(function(){
						 if(document.activeElement !== ABPInst.txtText){
							 hideBar();
							 clearInterval(timer);
							 timer = -1;
						 }
					 }, 2500);
				 } catch(e){
					 console.log(e);
				 }
			 };
			 playerUnit.addEventListener("touchmove",listenerMove);
			 playerUnit.addEventListener("mousemove",listenerMove);
			 timer = setTimeout(function(){
				 hideBar();
			 }, 4000);
		 }






		 playerUnit.addEventListener("touchmove", function(e){
			 event.preventDefault();
		 });
		 var _touch = null;
		 playerUnit.addEventListener("touchstart", function(e){
			 if(e.targetTouches.length > 0) {
				 //Determine whether we want to start or stop
				 _touch = e.targetTouches[0];
			 }
		 });
		 playerUnit.addEventListener("touchend", function(e){
			 if(e.changedTouches.length > 0) {
				 if(_touch != null){
					 var diffx = e.changedTouches[0].pageX - _touch.pageX;
					 var diffy = e.changedTouches[0].pageY - _touch.pageY;
					 if(Math.abs(diffx) < 20 && Math.abs(diffy) < 20){
						 _touch = null;
						 return;
					 }
					 if(Math.abs(diffx) > 3 * Math.abs(diffy)){
						 if(diffx > 0) {
							 if(ABPInst.video.paused){
								 ABPInst.btnPlay.click();
							 }
						 } else {
							 if(!ABPInst.video.paused){
								 ABPInst.btnPlay.click();
							 }
						 }
					 } else if (Math.abs(diffy) > 3 * Math.abs(diffx)) {
						 if(diffy < 0){
							 ABPInst.video.volume = Math.min(1,ABPInst.video.volume + 0.1)
						 }else{
							 ABPInst.video.volume = Math.max(0,ABPInst.video.volume - 0.1)
						 }
					 }
					 _touch = null;
				 }
			 }
		 });
		 */

/*
			if(ABPInst.txtText !== null){
				ABPInst.txtText.addEventListener("keyup", function(k){
					if(this.value == null) return;
					if(/^!/.test(this.value)){
						this.style.color = "#5DE534";
					}else{
						this.style.color = "";
					}
					if(k != null && k.keyCode === 13){
						if(this.value == "") return;
						if(/^!/.test(this.value)){
							var commandPrompts = this.value.substring(1).split(":");
							var command = commandPrompts.shift();
							switch (command){
								case "help":{
									var popup = ABPInst.createPopup("提示信息：",2000);
								}break;
								case "speed":
								case "rate":
								case "spd":{
									if(commandPrompts.length < 1){
										ABPInst.createPopup("速度调节：输入百分比【 1% - 300% 】", 2000);
									}else{
										var pct = parseInt(commandPrompts[0]);
										if(pct != NaN){
											var percentage = Math.min(Math.max(pct, 1), 300);
											ABPInst.video.playbackRate = percentage / 100;
										}
										if(ABPInst.cmManager !== null){
											ABPInst.cmManager.clear();
										}
									}
								}break;
								case "off":{
									ABPInst.cmManager.display = false;
									ABPInst.cmManager.clear();
									ABPInst.cmManager.stopTimer();
								}break;
								case "on":{
									ABPInst.cmManager.display = true;
									ABPInst.cmManager.startTimer();
								}break;
								case "cls":
								case "clear":{
									if(ABPInst.cmManager !== null){
										ABPInst.cmManager.clear();
									}
								}break;
								case "pp":
								case "pause":{
									ABPInst.video.pause();
								}break;
								case "p":
								case "play":{
									ABPInst.video.play();
								}break;
								case "vol":
								case "volume":{
									if(commandPrompts.length == 0){
										var popup = ABPInst.createPopup("目前音量：" + 
											Math.round(ABPInst.video.volume * 100) + "%", 2000);
									}else{
										var precVolume = parseInt(commandPrompts[0]);
										if(precVolume !== null && precVolume !== NaN){
											ABPInst.video.volume = Math.max(Math.min(precVolume, 100),0) / 100;
										}
										ABPInst.createPopup("目前音量：" + 
											Math.round(ABPInst.video.volume * 100) + "%", 2000);
									}
								}break;
								default:break;
							}
							this.value = "";
						}
					}else if(k != null && k.keyCode === 38){
						if(!k.shiftKey){
							ABPInst.video.volume = Math.round(Math.min((ABPInst.video.volume * 100) + 5, 100)) / 100;
							ABPInst.removePopup();
							var p = ABPInst.createPopup("目前音量：" + 
								Math.round(ABPInst.video.volume * 100) + "%", 800);
						}else{
							if(ABPInst.cmManager !== null){
								var opa = Math.min(Math.round(ABPInst.cmManager.def.opacity * 100) + 5,100);
								ABPInst.cmManager.def.opacity = opa / 100;
								ABPInst.removePopup();
								var p = ABPInst.createPopup("弹幕透明度：" + Math.round(opa) + "%",800);
							}
						}
					}else if(k != null && k.keyCode === 40){
						if(!k.shiftKey){
							ABPInst.video.volume = Math.round(Math.max((ABPInst.video.volume * 100) - 5, 0)) / 100;
							ABPInst.removePopup();
							var p = ABPInst.createPopup("目前音量：" + 
								Math.round(ABPInst.video.volume * 100) + "%", 800);
						}else{
							if(ABPInst.cmManager !== null){
								var opa = Math.max(Math.round(ABPInst.cmManager.def.opacity * 100) - 5,0);
								ABPInst.cmManager.def.opacity = opa / 100;
								ABPInst.removePopup();
								var p = ABPInst.createPopup("弹幕透明度：" + Math.round(opa) + "%",800);
							}
						}
					}
				});
			}
			/** Create a bound CommentManager if possible **/
			if(typeof CommentManager !== "undefined"){
				if(ABPInst.state.autosize){
					var autosize = function(){
						if(video.videoHeight === 0 || video.videoWidth === 0){
							return;
						}
						var aspectRatio = video.videoHeight / video.videoWidth;
						// We only autosize within the bounds
						var boundW = playerUnit.offsetWidth;
						var boundH = playerUnit.offsetHeight;
						var oldASR = boundH / boundW;

						if(oldASR < aspectRatio){
							playerUnit.style.width = (boundH / aspectRatio) + "px";
							playerUnit.style.height = boundH  + "px";
						}else{
							playerUnit.style.width = boundW + "px";
							playerUnit.style.height = (boundW * aspectRatio) + "px";
						}

						ABPInst.cmManager.setBounds();
					};
					video.addEventListener("loadedmetadata", autosize);
					autosize();
				}
			}
			return ABPInst;
		}
	})()
