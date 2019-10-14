This repository is no longer updated and is now just an informational page on things I learnt whilst playing and developing cheats for https://krunker.io during my vacation.

## [Javascript Anti Cheats 101](https://github.com/hrt/AnticheatJS#javascript-anti-cheats-101)

* [Stack trace detection](https://github.com/hrt/AnticheatJS#stack-trace-detection)
* [XHR script modification detection](https://github.com/hrt/AnticheatJS#xhr-script-modification-detection)
* [Global variable detection #1](https://github.com/hrt/AnticheatJS#global-variable-detection-1)
* [Global variable detection #2](https://github.com/hrt/AnticheatJS#global-variable-detection-2)
* [Global variable detection #3](https://github.com/hrt/AnticheatJS#global-variable-detection-3)
* [DOM modification detection](https://github.com/hrt/AnticheatJS#dom-modification-detection)
* [Function use detection](https://github.com/hrt/AnticheatJS#function-use-detection)
* [Function modification detection](https://github.com/hrt/AnticheatJS#function-modification-detection)
* [Local storage detection](https://github.com/hrt/AnticheatJS#local-storage-detection)
* [User agent detection](https://github.com/hrt/AnticheatJS#user-agent-detection)
* [Event handler detection](https://github.com/hrt/AnticheatJS#event-handler-detection)

## [Krunker Exploits](https://github.com/hrt/AnticheatJS#krunker-exploits)

* [Spinning and invisibility](https://github.com/hrt/AnticheatJS#spinning-and-invisibility)
* [Fake lag](https://github.com/hrt/AnticheatJS#fake-lag)
* [Session Exploit](https://github.com/hrt/AnticheatJS#session-exploit)
* [Server crasher / kick players](https://github.com/hrt/AnticheatJS#server-crasher--kick-players)
* [Extreme XP farming](https://github.com/hrt/AnticheatJS#extreme-xp-farming)
* [Any username and broken profiles](https://github.com/hrt/AnticheatJS#any-username-and-broken-profiles)
* [Persistent XSS Vulnerability](https://github.com/hrt/AnticheatJS#persistent-xss-vulnerability)
* [Denial Of Service 1](https://github.com/hrt/AnticheatJS#denial-of-service-1)
* [Denial Of Service 2](https://github.com/hrt/AnticheatJS#denial-of-service-2)
* [Speed hack](https://github.com/hrt/AnticheatJS#speed-hack)


# Javascript Anti Cheats 101
In this world, the hackers have a significant advantage, having access to a large variety of permissions that the anti cheat do not. Initially we modified the anti cheat checks directly but in recent patches, Krunker moved to anti cheat checks in WASM which is verified by the server. Instead of having to reverse engineer WASM, we work on hiding the presence of our cheat from all kinds of anti cheat checks - far more than Krunker actually check for (as of 1.5.8).

## Stack trace detection

Intentionally throw an error within a try catch block and examine the stack trace. Check that the name and path of the game file has not been altered and also check that the line number it crashes corresponds to where it should be crashing. Extensions and user scripts will have a hard time dealing with this since they cannot reliably modify the message displayed by ```TypeError```.
    
1. Scripts can attempt to avoid detection by modifying the ```TypeError.prototype.name``` attribute to something that the anti cheat is looking for. For example, we can modify the name of ```TypeError``` to ```TypeError: https://krunker.io/js/game.XfsD.js:75``` and examine the stack trace of ```(void 0)['name']``` to be:
```Uncaught TypeError: https://krunker.io/js/game.XfsD.js:75: Cannot read property 'name' of undefined```
 However a more sophisticated anti cheat check wouldn't be fooled by a modification of the name and would continue to examine the end of the error message.

2. Avoided by cheats that do not modify the game file - we can have cheats that work simply by pasting into the console.

3. Also avoided by using Electrons ```protocol.interceptBufferProtocol``` to intercept the responses of requests - assuming that the line numbers of the modified response are still in line.


## XHR script modification detection
Send a XHR request to the same game file that has been loaded and check whether or not it has been altered at all.

1. Avoided by cheats that do not modify the game file (e.g. console cheats).

2. Avoided by cheats that only modify requests from script tags. Electron can look out for non script requests inside of ```session.defaultSession.webRequest.onBeforeRequest``` using ```details.resourceType !== "script"```

## Global variable detection #1
Blacklist against public cheat(s) by checking for global variables.

* Avoided by dynamically generating random variable names.
* Avoided by anonymous function call

## Global variable detection #2
We can dynamically find the global variable of a cheat by iterating the keys in window
    ```for (var variable in window)```
and then checking the attributes of each variable for a known cheat attribute.

* Avoided by defining the cheat global variable using ```Object.defineProperty``` with ```enumerable``` set to ```false```.
* Avoided by anonymous function call

## Global variable detection #3
We can still iterate and find hidden global variables using ```Object.getOwnPropertyNames(window)```and ```getOwnPropertyDescriptors(window)```.

* Avoided by injecting javascript before anything else loads (using preload scripts in electron), to hook these two functions to hide our variable. If doing so, you also would want to hide the presence of the hook by modifying the hooked functions attributes such as ```toString```, ```prototype```, ```hasOwnProperty```, ```constructor``` and ```name```.
* Avoided by anonymous function call

## DOM modification detection
This is really a no go since it's easy to detect. For example we can search through DOM for cheat strings used in GUIs by ```document.documentElement.innerHTML.indexOf('aimbot')```.

* Avoided by drawing directly on canvas.

## Function use detection
Hook canvas draw functions such as ```fillText``` to detect cheat strings. We can even hook functions like ```Array.prototype.splice``` or other array functions and check for cheat artifacts within the parameters.

* Avoided by injecting javascript as soon as DOM is ready, keeping a copy of the original functions and using them instead.

## Function modification detection
Detect game function modifications by checking the ```
()``` of said function.

* Avoid by also modifying the ```toString``` of the function being modified

```js
var hideHook = function(fn, oFn) { fn.toString = oFn.toString.bind(oFn); }
```

## Local storage detection
Detect cheats by checking the storage for any settings saved.

* Avoided by storing settings on file system rather than local storage. Electron was modified to intercept XHR requests to a youtube URL with a secret key to save and load settings.

## User agent detection
Not really a bannable offense, but if users are using an old version of the Krunker client (which can be checked by looking at the user agent) it could raise flags since they should be updating.

* Avoided by modifying Electrons user agent to a normal chrome browser.

## Event handler detection
Most cheats have hooks on ```mousedown```, ```mouseup```, ```keydown``` and ```keyup``` but code running within script tags cannot access ```getEventListeners``` so this isn't really a detection vector.

# Krunker Exploits
Some things I accidentally bumped into and realised wasn't right. Just to clarify, no <b>game breaking</b> exploits were posted publicly until they were fixed. Exploits are ordered from oldest fix date to most recent fix date.

## Spinning and invisibility
Publicly reported - fixed in 1.4.x

Krunker clamps angles on client side before sending it to the server but does not do re-clamp on the server side. If we remove the clamp checks and add multiples of ```2 PI``` to our yaw, our character appears to spin insanely on everyone elses screen whilst completely unaffecting ourselves (since effective angle wise, we are looking at the same position if we add 360). This can also be abused to cause the top half of our player model to go invisible by forcing our pitch to go upside down (head towards ground).

## Fake lag
Publicly reported - weird fix that didn't work in 1.4.x. Still works

Player inputs get sent to the server in intervals of ```clientSendRate```. We can hold and queue up a buffer of inputs to send to the server instead of sending it instantly to cause ourselves to heavily lag and teleport on other players screens whilst leaving us largely affected. This can be combined with some logic that only releases the buffer if someone is about to shoot us to make us very hard to hit. Extreme uses of fake lag allow players to shoot players from spawn to spawn.

## Session Exploit
Privately reported - fixed in 1.5.3

One could observe that the session tokens used to login Krunker accounts are short. With further inspection we can extract public information from any account, and use this information to generate a session token for that account:
```var sessionToken = (secondCreated * 2).toString() + dayCreated + secondCreated + username.substring(0,3) + (secondCreated  * 4).toString()```

It works for around 30% of accounts on first attempt. If it fails we can bruteforce with high probability the correct session token within 60 attempts by varying ```secondCreated```. And if this still fails we can bruteforce with 100% probability within 1800 attempts by varying both ```secondCreated``` and ```dayCreated```. Time wise, it would take us 10 seconds per 3 attempts on a single PC, which means that it would take us a maximum of 1.5 hours to crack any account within the game.

## Server crasher / kick players
Privately reported, stopped working in 1.5.4 - actual fix in 1.5.6

To move or shoot in Krunker, the client tells the Server which buttons it is pressing at a rate of ```ClientSendRate```. We can modify the buffer being sent to be consistently large to cause the server to konk out and kick everyone else out.

## Extreme XP farming
Publicly reported - fixed in 1.5.7

Respawning in Capture the Flag games are usually around the flag/base of your team - as long as we are not visible to an enemy. In ```ctf_littletown``` there are two walls which are penetrable but not transparent which causes enemies to spawn in the exact same spot. Using an aimbot and auto instant respawn we can get over 200 kills within 4 minutes. Since Krunkers xp/level system is purely based on score and is not capped per game, we can level up insanely fast and even reach the top 10 within a few days.

## Any username and broken profiles
Privately reported - partial fix in 1.5.8

Since Krunker allows for a large variety of characters within usernames, we can abuse zero width space characters such as ```&#8203``` to create and appear as any username in the game - including no name. This also holds true for messages typed within the in game chat - Krunker filters out the characters ```<``` and ```>``` in messages but we can still have a message displayed (visually) with these characters by using ```&lt;``` and ```&gt;```.

Having HTML entities such as ```&lt;```, ```&gt;```, ```&nbsp``` or ```&quot;``` contained within a username causes the social links to that profile to break. This means that no one in the game is able to view our social profile - even if manually typed into the url!

A specific case of this led to an accounts social profile linking to a completely different account!

After observing the behavior from different malformed usernames, I concluded that there was underlying issues with:

* how the server generates social links for a malformed username
* how the server decides on which profile to show for a given social link
* client side visual representation of strings containing HTML entities


Outside of this, there is also room for persistent XSS attacks on the follow and gift buttons which create DOM using the templates:

* ```onclick=\x27followUser(\x22' + USERNAME + '\x22)```

* ```onclick=\x27giftPopup(\x22' + USERNAME + '\x22,\x20\x22' + SW['src'] + '\x22)```

However the max length imposed on usernames limits the potential - yet we can still break the above buttons from functioning with malformed usernames.


## Persistent XSS Vulnerability
Privately reported - attempted fix in 1.5.8, actual fix in 1.6.5

Krunker allows users to publish custom maps/mods, taking user inputs as names for the map. These maps can be accessed either ingame or through social. Anyone can create a custom map. Before playing on a custom map, a user must first click on the preview of said map.

There are certain checks on map names. For example we cannot have ```<```, ```>``` or ```"``` within a map name.

A map name would generate DOM using the following template:

```onclick=\x27playMap(&quot;' + MAPNAME + '&quot;)```

Knowing this, we can create a custom map with name ```&quot|alert())//``` which causes the ```onclick``` handler to become ```playMap(""|alert())//")```, a.k.a ```playMap(""|alert())``` which bypasses the string and causes a pop up to appear.


## Denial Of Service 1
Privately reported - Fixed in 1.6.7

You can reserve all slots for every server by spamming calls to `seek-game` API.

## Denial Of Service 2
Privately reported - Fixed in 1.6.9

Newly introduced captcha system on the games critical API `seek-game` causes trouble when given large inputs. Since the entire krunker eco system relies on this API being alive, the end result is no one on any server being able to play a single game.


## Speed hack
Unreported - (re?)patched 1.7.0

How to perform speed hacks are self explanatory. Lets you shoot faster, move faster, reload faster etc.
