This repository is no longer updated and is now just an informational page on things I learnt whilst developing cheats for https://krunker.io.

## [Javascript Anti Cheats 101](https://github.com/hrt/GamingChair#javascript-anti-cheats-101)

* [Stack trace detection](https://github.com/hrt/GamingChair#stack-trace-detection)
* [XHR script modification detection](https://github.com/hrt/GamingChair#xhr-script-modification-detection)
* [Global variable detection #1](https://github.com/hrt/GamingChair#global-variable-detection-1)
* [Global variable detection #2](https://github.com/hrt/GamingChair#global-variable-detection-2)
* [Global variable detection #3](https://github.com/hrt/GamingChair#global-variable-detection-3)
* [DOM modification detection](https://github.com/hrt/GamingChair#dom-modification-detection)
* [Function use detection](https://github.com/hrt/GamingChair#function-use-detection)
* [Function modification detection](https://github.com/hrt/GamingChair#function-modification-detection)
* [Local storage detection](https://github.com/hrt/GamingChair#local-storage-detection)
* [User agent detection](https://github.com/hrt/GamingChair#user-agent-detection)
* [Event handler detection](https://github.com/hrt/GamingChair#event-handler-detection)

## [Krunker Exploits](https://github.com/hrt/GamingChair#krunker-exploits)

* [Spinning and invisibility](https://github.com/hrt/AnticheatJS#spinning-and-invisibility)
* [Fake lag](https://github.com/hrt/AnticheatJS#fake-lag)
* [Session token generation](https://github.com/hrt/GamingChair#session-token-generation)
* [Server crasher / kick players](https://github.com/hrt/GamingChair#server-crasher--kick-players)
* [Extreme XP farming](https://github.com/hrt/GamingChair#extreme-xp-farming)


# Javascript Anti Cheats 101
In this world, the hackers have a significant advantage, having access to a large variety of permissions that the anti cheat do not. Initially we modified the anti cheat checks directly but in recent patches, Krunker moved to WASM. Instead of having to deal with WASM, we work on hiding the presence of our cheat.
Most of the detection vectors below aren't even checked by Krunker (as of 1.5.8) but are things they could look into in the future.

## Stack trace detection

Intentionally throw an error within a try catch block and examine the stack trace. Check that the name and path of the game file has not been altered and also check that the line number it crashes corresponds to where it should be crashing. Extensions and user scripts will have a hard time dealing with this since they cannot reliably modify the message displayed by ```TypeError```.
    
1. Scripts can attempt to avoid detection by modifying the ```TypeError.prototype.name``` attribute to something that the anti cheat is looking for. For example, we can modify the name of ```TypeError``` to ```TypeError: https://krunker.io/js/game.XfsD.js:75``` and examine the stack trace of ```(void 0)['name']``` to be:
```Uncaught TypeError: https://krunker.io/js/game.XfsD.js:75: Cannot read property 'name' of undefined```
 However a more sophisticated anti cheat check wouldn't be fooled by a modification of the name and would continue to examine the end of the error message.

2. Avoided by cheats that do not modify the game file.

3. Also avoided by using Electrons ```protocol.interceptBufferProtocol``` to intercept the responses of requests - assuming that the line numbers of the modified response are still the same in a stack trace.


## XHR script modification detection
Send a XHR request to the same game file that has been loaded and check whether or not it has been altered at all.

1. Avoided by cheats that do not modify the game file

2. Avoided by cheats that only modify requests from script tags. Electron can look for script requests inside of ```session.defaultSession.webRequest.onBeforeRequest``` using ```details.resourceType === "script"```

## Global variable detection #1
Blacklist against public cheat(s) by checking for global variables.

* Avoided by randomly generating variable names.

## Global variable detection #2
We can dynamically find the global variable of a cheat by iterating the keys in window
    ```for (var variable in window)```
and then checking the attributes of each variable for a cheat.

* Avoided by defining the cheat global variable using ```Object.defineProperty``` with ```enumerable``` set to ```false```.


## Global variable detection #3
We can instead iterate global variables using```Object.getOwnPropertyNames(window)```and```getOwnPropertyDescriptors(window)```.

* Avoided by injecting javascript as soon as DOM is ready, to hook these two functions to hide our variable. If doing so, you also would want to hide the presence of the hook by modifying the hooked functions attributes such as ```toString```, ```toString.toString..```, ```prototype```, ```hasOwnProperty```, ```constructor``` and ```name```.

## DOM modification detection
This is really a no go since it's easy to detect. For example we can search through DOM for cheat strings used in GUIs.

* Avoided by drawing directly on canvas.

## Function use detection
Hook canvas draw functions such as ```fillText``` to detect cheat strings. We can even hook functions like ```Array.prototype.splice``` or other array functions and check for cheat artifacts within the parameters.

* Avoided by injecting javascript as soon as DOM is ready, keeping a copy of the original functions and using them instead.

## Function modification detection
Detect game function modifications by checking the ```toString()``` of said function.

* Avoid by also modifying the ```toString``` of the function being modified

## Local storage detection
Detect cheats by checking the storage for any settings saved.

* Avoided by storing settings on file system rather than local storage. Electron was modified to intercept XHR requests to a youtube URL with a secret key to save and load settings.

## User agent detection
Not really a bannable offense, but if users are using an old version of the Krunker client (which can be checked by looking at the user agent) it could raise flags since they should be auto updating.

* Avoided by modifying Electrons user agent to a normal chrome browser.

## Event handler detection
Most cheats have hooks on ```mousedown```, ```mouseup```, ```keydown``` and ```keyup``` but code running within script tags cannot access ```getEventListeners``` so this isn't really a detection vector.

# Krunker Exploits
Some things you accidentally bump into and realise it isn't right.

## Spinning and invisibility
Fixed in 1.4.x

Krunker clamps angles on client side before sending it to the server but does not do re-clamp on the server side. If we remove the clamp checks and add multiples of ```2 PI``` to our yaw, our character appears to spin insanely on everyone elses screen whilst completely unaffecting ourselves. This can also be abused to cause the top half of our player model to go invisble by forcing our pitch to go upside down (head towards ground).

## Fake lag
Fixed in 1.4.x

Player inputs get sent to the server in intervals of ```clientSendRate```. We can hold and queue up a buffer of inputs to send to the server instead of sending it instantly to cause ourselves to heavily lag and teleport on other players screens whilst leaving us largely affected. This can be combined with some logic that only releases the buffer if someone is about to shoot us to make us very hard to hit.

## Session token generation
Fixed in 1.5.3

One could observe that the session tokens used to login Krunker accounts are short. With further inspection we can extract public information from any account to generate a session token for that account to login as the user:
```var sessionToken = (secondCreated * 2).toString() + dayCreated + secondCreated + username.substring(0,3) + (secondCreated  * 4).toString()```

## Server crasher / kick players
Stopped working in 1.5.4, actual fix in 1.5.6

To move or shoot in Krunker, the client tells the Server which buttons it is pressing at a rate of ```ClientSendRate```. We can modify the buffer being sent to be consistently large to cause the server to konk out and kick everyone else out.

## Extreme XP farming
Fixed in 1.5.7

Respawning in Capture the Flag games are usually around the flag/base of your team - as long as we are not visible to an enemy. In ```ctf_littletown``` there are two walls which are penetrable but not transparent which causes enemies to spawn in the exact same spot. Using an aimbot and auto instant respawn we can get over 200 kills within 4 minutes. Since Krunkers xp/level system is purely based on score and is not capped per game, we can level up insanely fast and even reach the top 10 within a few days.

