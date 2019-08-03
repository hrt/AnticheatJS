# KrunkerMultihack
http://krunker.io


Gameplay: https://youtu.be/R6LBPZxtf3A
[![Alt text](https://github.com/hrt/KrunkerMultihack/blob/master/screenshot.png?raw=true)](https://www.youtube.com/watch?v=Fvmn3Obuelo)

aimbot, snaplines esp, name esp, no visual recoil and quick scoping - Aimbot actives if you hold down right


Came across the game this morning and quit it this evening: 


Load this extension on chrome and you're good to go.

# Anti cheat
Their "anti script" is mainly the last few lines of the js file ```zip.js```. Any script that is loaded with a source from ```jsdelivr``` or ```raw.githack.com``` gets flagged. This is easy to avoid if need be.

```
setInterval(function() {
    document.querySelectorAll("script[src*='jsdelivr'], script[src*='raw.githack.com']").length && (document.body.innerHTML = "<div style='font-size:28px;margin-top:30px;width:100%;text-align:center'>SCRIPT DETECTED</div>")
}, 1E4);
```


The anti script also checks if certain classes are defined under the ```window``` object:

```
window.chH = function(a) {
    try {
        null == window.hack && null == window.iUb && null == window.hags && null == window.aimbot && null == window.nxtrun && null == window.KrunkAimDotTK && null == window.wallHackEnabled || !a.socket || (a.send("hc"), a.socket.close())
    } catch (b) {}
};
```
