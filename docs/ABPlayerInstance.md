ABP-sMod Instance
==========================
You can only create an instance using ABP.create() like this:

>var inst = ABP.create(document.getElementById("bofqi"), {
>					"src":{
>						"playlist":{
>									{"sources":{"video/mp4":"1.mp4"}},
>									{"sources":{"video/mp4":"1.mp4"}}
>								},
>						"danmaku":'2.xml', //may be incorrect
>					},
>					"width":1160,
>					"height":640
>				});


Events
---
The player is now using events for interaction.
To set a listener, use:
>inst.addListener("event", function(arg) { /* your code here... */ });

- play
  arg: none
  when the player starts to play
- pause
  arg: none
  when the player pauses
- stop
  arg: none
  when the player stops
- ready
  arg: none
  when the player is ready to play
- progress
  arg: none
  when player buffer updates
- senddanmaku
  arg: danmaku object
  when a danmaku is about to be sent
