Building a three.js scene with HCap content
============

[See end of document for Current Changelog]

# Introduction

This package contains all of the tools necessary to get Microsoft HCap volumetric video content playing within a [THREE.JS](https://threejs.org/) WebGL environment. Getting this working will take a few steps:
* Obtain the latest three.js package
* Obtain some volumetric content, usually in the form of a .hcap file and associated subfolder of relevant files
* Set up an example scene to 
  * load three.js
  * properly create the WebGL (or hopefully WebGL2) context for three.js
  * Create the HoloVideoObjectThreeJS and instruct it to load and play the HCap content
* Use this knowledge as a framework for integrating the HCap content into your project.

The instructions below should get you started. Three.js, browser and javascript standards are frequently evolving, so if you discover anything incorrect, or if anything fails to work as described, please alert Microsoft MRCS.


# Example scene
A minimal example scene can be found in `example-scene.html`. The next few sections call attention to some key features of this example, please refer to the full example code for complete integration details.

## WebGL2
The HCap web playback component requires support for WebGL 1.0 at minimum, but can perform significantly better with WebGL 2.0. By default `THREE.WebGLRenderer` will only create a WebGL 1.0 context so it's recommended that the application create its own context and pass this to the `THREE.WebGLRenderer` constructor as shown below:

~~~~
// try to create WebGL2 context
var context = canvas.getContext('webgl2');

// WebGL2 not available, fall back to WebGL1
if (!context) {
    context = canvas.getContext('webgl');
    if (!context) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    }
}

// Construct THREE.WebGLRenderer using our new context:
renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, context: context });
~~~~

## Adding HCap content to the scene

The primary class for HCAP three.js web playback is `HoloVideoObjectThreeJS`. An instance of this class represents a hologram that can be played and rendered in the three.js scene with open/close/play/pause/rewind functionality to control playback.

The code to instantiate an instance of `HoloVideoObjectThreeJS` is shown below:

~~~~
hvo = new HoloVideoObjectThreeJS(renderer, function(mesh) {
    mesh.position.set(-100, 300, 600);
    mesh.scale.set(0.2, 0.2, 0.2);
    scene.add(mesh);
});
hvo.open("tennis-web/video.hcap", {autoloop:true, audioEnabled:true});
~~~~

Options available in open():

Name | Description | Default
---|--|--
audioEnabled | Specifies whether audio playback is enabled initially | false
autoloop | sets file to autoloop | false
autoplay | Specifies whether capture should automatically begin playback when loaded. If enabled will disable audio as many browsers do not allow automatic audio playback without user input. | false
minBuffers|Minimum number of .bin segments that must be buffered before capture is considered preloaded.|2
maxBuffers|Maximum number of .bin segments that can be buffered and kept in memory at one time.|3
streamMode|Force the "streamMode" used for video texture streaming. This should only be used for debugging.<ul><li>HoloVideoObject.StreamMode.Automatic</li><li>HoloVideoObject.StreamMode.MP4 (downloads entire mp4 before beginning playback)</li><li>HoloVideoObject.StreamMode.HLS (generally used by Safari)</li><li>HoloVideoObject.StreamMode.Dash (Downloads portions of video in chunks, allowing earlier playback)</li><lu>Not all modes work for all browsers. Generally, the Automatic default is best. If you discover a browser for which Automatic does not result in the best performance, please alert Microsoft MRCS.|Automatic
keepAllMeshesInMemory | Forces all .bin segments to be kept in memory. This overrides the maxBuffers setting to the total number of segments. | false
startTime | Start playback from specified time (in seconds) | 0

Arguments passed to the constructor are the `THREE.WebGLRenderer` object, and a callback function that will be invoked when minimal playback data has been loaded and a preview frame is able to be displayed in the scene. The argument to this callback function is a `THREE.Mesh` instance that can be positioned and added to the scene at this point. This mesh will be updated with the animating capture geometry once playback begins.

## Starting playback

When the open callback is invoked, the `HoloVideoObjectThreeJS` instance will have at least one preview frame loaded but it may require additional time to buffer the rest of the capture. The application should monitor the `state` property of the `HoloVideoObjectThreeJS` instance until it reaches the value of `HoloVideoObject.State.Opened`, at which point playback can be started.

Many browsers will only allow video playback to be initiated in response to user input, so to begin playback the application should call the `HoloVideoObjectThreeJS.play()` method from a user input event handler as shown below:

~~~~
renderer.domElement.addEventListener('mousedown', function() {
if (hvo.state == HoloVideoObject.States.Opened || 
    hvo.state == HoloVideoObject.States.Opening) {
    hvo.play();
}});
~~~~

## Displaying animated HCap content

In order to update the hologram `THREE.Mesh` instance to display the texture and geometry for the current frame of playback, the `HoloVideoObjectThreeJS.update()` method needs to be called from the application's animation tick method as shown below:

~~~~
function animate() {
    requestAnimationFrame(animate);
    
    // update hologram to latest frame of playback:
    hvo.update();

    // let three.js render the scene:
    renderer.render(scene, camera);
}
~~~~

## Materials

The `THREE.Mesh` object created by a `HoloVideoObjectThreeJS` instance will be assigned a `THREE.MeshLambertMaterial` material for captures that contain vertex normals, and a `THREE.MeshBasicMaterial` material for captures without normals. The application can replace the default material however if desired. An example is shown below which takes the hologram texture from the default material and uses it to assign a new red-tinted material to the mesh:

~~~~
hvo = new HoloVideoObjectThreeJS(renderer, function(mesh) {
    mesh.material = new THREE.MeshBasicMaterial({color: 0xff0000, map: mesh.material.map});
    // code to position mesh, add to scene, etc
});
~~~~

## DASH streaming

MPEG-DASH is the preferred streaming format for HCap content on browsers other than Safari. DASH playback requires the `dash.js` player script from https://github.com/Dash-Industry-Forum/dash.js. The following line can be used to include the `dash.js` player implementation in a web page:
~~~~
<script src="https://cdn.dashjs.org/v3.2.2/dash.mediaplayer.min.js"></script>
~~~~

## Known Limitations

- An apparent bug has been identified where the HLS video stream used by default on iOS and macOS will not play correctly in Safari 14 on Apple Silicon/M1 systems. Because it isn't 
possible for the plugin to distinguish an M1 system from an Intel system, the plugin now resolves `StreamMode.Automatic` to `StreamMode.MP4` (instead of `StreamMode.HLS`) in Safari 14 on *all* macOS systems to ensure maximum out of the box compatibility. As such the application developer may prefer instead to give macOS users the ability to choose a specific format based on their system, or manually specify `StreamMode.HLS` on macOS and advise M1 users to use Safari 15 instead.

- Capture audio will always be muted by default on Safari, as Safari will not pre-load video data unless it is muted. The client application should call `HoloVideoObjectThreeJS.setAudioEnabled(true)` before starting playback if audio playback is desired.
- The `THREE.Mesh` associated with a `HoloVideoObjectThreeJS` instance is populated directly via WebGL during playback. As a result three.js doesn't have a frame-accurate copy of the geometry to use for operations like raycasting, and such operations may not return accurate results. The capture mesh will maintain an accurate bounding box however which can be used for simple selection and culling operations.

# Current changelog

## Version 1.4.0 - 2022-03-18

- Adds seeking functionality. See the `startTime` openOptions parameter and `HoloVideoObjectThreeJS.seekToTime` API for more details.

## Version 1.3.10 - 2022-03-04

- Properly handle switching from capture w/normals to capture w/out normals, and vice versa.

## Version 1.3.9 - 2022-02-01

- Fixes iPod touch devices not being considered valid iOS devices by plugin.

## Version 1.3.8 - 2021-09-30

- Playback in Mozilla WebXR Viewer for iOS 15 has been fixed.

## Version 1.3.7 - 2021-08-25

- Fixed compatibility with Safari 15 on macOS
- `StreamMode.Automatic` now resolves to `StreamMode.MP4` in macOS Safari 14.x (but continues to resolve to `StreamMode.HLS` in Safari 15+). See `Known Limitations` for more details.

## Version 1.3.6 - 2021-08-13

- iOS 15 is supported as of this release. Prior releases will not work correctly on iOS 15 unless `WebGL2` is manually disabled in the Safari `Experimental Features` settings.
- A problem has been resolved where captures would occasionally not loop correctly in Firefox for macOS.

## Version 1.3.5 - 2021-07-26

- Add support for captures with 32-bit index data. `OES_element_index_uint` extension is required for 32-bit index support on WebGL1.

## Version 1.3.4 - 2021-07-14

- `StreamMode.Automatic` now resolves to `StreamMode.HLS` on the Mozilla WebXR Viewer for iOS. Previously `StreamMode.Dash` was being selected which does not appear to be functional in this browser.
- It's recommended that `dashjs` player `v3.2.2` is used with the plugin as `v4.0` (which `cdn.dashjs.org/latest` resolves to as of this update) doesn't appear to work properly.
- WebGL context restore has been fixed

## Version 1.3.3 - 2021-07-06

- Major performance improvement in WebGL1 playback path (mainly affects iOS).
- Add optional `errorCallback` parameter to `HoloVideoObjectThreeJS` constructor. See HoloVideoObject docs for more info.

## Version 1.3.2 - 2021-05-04

- Removes MP4 workaround for iOS 14.6 and above.
- HoloVideoObject state is now set to `Opened` instead of `Opening` at end of video.

## Version 1.3.1 - 2021-02-17

- Fixes issue where a few frames were missing at the end in WebGL2.
- Rewinding now recognizes `keepAllMeshesInMemory` option and does not clear memory.
- End-of-stream now sets holograms to their correct state, which fixes an issue with visibility changes.

## Version 1.3.0 - 2021-02-02

- Major performance improvements.
- HoloVideoObjectThreeJS.Open now accepts `keepAllMeshesInMemory` as an option. When set to `true`, all .bin segments are kept in memory which results in no further mesh loading after the initial one at the cost of higher memory footprint.

## Version 1.2.9 - 2020-10-07

- HoloVideoObjectThreeJS does not require a patched version of three.js anymore. The latest versions of three.js, including r120 and above, can be used without any custom modification.

## Version 1.2.8 - 2020-09-23

- Temporarily redirects iOS/iPadOS 14 users to use MP4 until [Webkit bug](https://bugs.webkit.org/show_bug.cgi?id=215908) is fixed. Because Safari on iPadOS does not relay system version info, this fix does not work for those users.

## Version 1.2.7 - 2020-08-19

- Fixes a bug where having only one THREE.Mesh in the scene would make it disappear on hologram playback.

## Version 1.2.6 - 2020-08-03

- Fixes bug in index buffer management.

## Version 1.2.5.1 - 2020-07-31

- Confirms patch and plugin works with three.js r119.

## Version 1.2.5 - 2020-07-29

- HoloVideoObjectThreeJS now works with a patched version of three.js r118

- Adds ability to force a streamMode parameter when opening a hologram file. (Used only for debugging.)

## Version 1.2.4 - 2020-03-31

- Added HoloVideoObject.VideoStates 
```
    Undefined:0,
    CanPlay:1,
    CanPlayThrough:2,
    Waiting:3,
    Suspended:4,
    Stalled:5
```
Read as [holovideoobjectJS].***hvo***.videoState

Don't forget this is a property of the hvo owned by your holovideoobject!

## Version 1.2.3 - 2020-01-27

- HoloVideoObjectThreeJS constructor now accepts callback function for currentFrame

## Version 1.2.2 - 2019-11-26

- API documentation has been added for the `HoloVideoObjectThreeJS` class. See [holovideoobject.md](holovideoobject.md).

## Version 1.2.1 - 2019-11-12

- A bug has been fixed where playback would fail to start under Chrome simulated iOS Device Mode.

## Version 1.1.1 - 2019-10-31

- A bug has been fixed where a capture would appear with a corrupted texture and playback would be unable to proceed.

## Version 1.1.0 - 2019-10-30

- HoloVideoObjectThreeJS.Open now accepts `minBuffers` and `maxBuffers` options. `minBuffers` specifies how many .bin segments the player will download and cache before beginning playback, and `maxBuffers` is the maximum number of bin segments it will keep in memory at one time. An example of settings these options is shown below:

~~~~
hvo.open("mycapture.hcap", {minBuffers:5, maxBuffers:8});
~~~~

Previous versions of the player used an effective 'maxBuffers' value of 3 and 'minBuffers' value of 2 (these remain the default values if not explicitly specified).

## Version 1.0.0 - 2019-08-15

- WebGL context loss/reset is handled correctly now.

## Version 0.3.1 - 2019-07-19

- HoloVideoObjectThreeJS.Open now accepts an 'autoplay' field on the 'options' parameter as shown below:

~~~~
hvo.open("mycapture.hcap", {autoloop:true, autoplay: true});
~~~~

This will automatically start playback as soon as the capture is finished loading. Since automatic playback of audio content is not allowed by many browsers, this option will automatically mute the capture audio. It can be re-enabled from a user input event by calling `HoloVideoObjectThreeJS.setAudioEnabled(true)`.