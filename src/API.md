## Classes

<dl>
<dt><a href="#HoloVideoObject">HoloVideoObject</a></dt>
<dd></dd>
<dt><a href="#HoloVideoObjectThreeJS">HoloVideoObjectThreeJS</a></dt>
<dd></dd>
</dl>

<a name="HoloVideoObject"></a>

## HoloVideoObject
**Kind**: global class  

* [HoloVideoObject](#HoloVideoObject)
    * [new HoloVideoObject()](#new_HoloVideoObject_new)
    * _static_
        * [.States](#HoloVideoObject.States) : <code>enum</code>
        * [.ErrorStates](#HoloVideoObject.ErrorStates) : <code>enum</code>
        * [.StreamMode](#HoloVideoObject.StreamMode) : <code>enum</code>
        * [.VideoStates](#HoloVideoObject.VideoStates) : <code>enum</code>
    * _inner_
        * [~errorCallback](#HoloVideoObject..errorCallback) : <code>function</code>

<a name="new_HoloVideoObject_new"></a>

### new HoloVideoObject()
[HoloVideoObject](#HoloVideoObject) is the internal web player implementation that interacts directly with WebGL (independent of three.js).[HoloVideoObjectThreeJS](#HoloVideoObjectThreeJS) defines the public interface for three.js development.

<a name="HoloVideoObject.States"></a>

### HoloVideoObject.States : <code>enum</code>
HoloVideoObject States

**Kind**: static enum of [<code>HoloVideoObject</code>](#HoloVideoObject)  
**Read only**: true  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Closed | <code>number</code> | <code>-1</code> | A previously loaded capture has been unloaded. A new capture may be opened by calling [open](#HoloVideoObjectThreeJS+open) |
| Empty | <code>number</code> | <code>0</code> | Initial state of all HoloVideoObjectThreeJS instances |
| Opening | <code>number</code> | <code>1</code> | A capture is in the process of opening and buffering data for playback. |
| Opened | <code>number</code> | <code>2</code> | The capture loaded and ready for [play](#HoloVideoObjectThreeJS+play) to be called |
| Playing | <code>number</code> | <code>3</code> | Capture playback is in progress |
| Paused | <code>number</code> | <code>4</code> | Playback is paused and may be resumed by calling [play](#HoloVideoObjectThreeJS+play) |

<a name="HoloVideoObject.ErrorStates"></a>

### HoloVideoObject.ErrorStates : <code>enum</code>
HoloVideoObject ErrorStates

**Kind**: static enum of [<code>HoloVideoObject</code>](#HoloVideoObject)  
**Read only**: true  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| NetworkError | <code>number</code> | <code>-1</code> | 
| VideoError | <code>number</code> | <code>-2</code> | 
| PlaybackPrevented | <code>number</code> | <code>-3</code> | 

<a name="HoloVideoObject.StreamMode"></a>

### HoloVideoObject.StreamMode : <code>enum</code>
HoloVideoObject StreamMode - set as an option to HoloVideoObject.open() to force the StreamMode for the video element

**Kind**: static enum of [<code>HoloVideoObject</code>](#HoloVideoObject)  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| Automatic | <code>number</code> | <code>0</code> | 
| MP4 | <code>number</code> | <code>1</code> | 
| HLS | <code>number</code> | <code>2</code> | 
| Dash | <code>number</code> | <code>3</code> | 

<a name="HoloVideoObject.VideoStates"></a>

### HoloVideoObject.VideoStates : <code>enum</code>
HoloVideoObject VideoStates

**Kind**: static enum of [<code>HoloVideoObject</code>](#HoloVideoObject)  
**Read only**: true  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| Undefined | <code>number</code> | <code>0</code> | 
| CanPlay | <code>number</code> | <code>1</code> | 
| CanPlayThrough | <code>number</code> | <code>2</code> | 
| Waiting | <code>number</code> | <code>3</code> | 
| Suspended | <code>number</code> | <code>4</code> | 
| Stalled | <code>number</code> | <code>5</code> | 
| Playing | <code>number</code> | <code>6</code> | 

<a name="HoloVideoObject..errorCallback"></a>

### HoloVideoObject~errorCallback : <code>function</code>
**Kind**: inner typedef of [<code>HoloVideoObject</code>](#HoloVideoObject)  

| Param | Type | Description |
| --- | --- | --- |
| error | [<code>ErrorStates</code>](#HoloVideoObject.ErrorStates) | type - Value from [HoloVideoObject#ErrorStates](HoloVideoObject#ErrorStates) enum indicating the type of error encountered. |
| additional | <code>Object</code> | error information (see description of specific [HoloVideoObject#ErrorStates](HoloVideoObject#ErrorStates) value for more information). |

<a name="HoloVideoObjectThreeJS"></a>

## HoloVideoObjectThreeJS
**Kind**: global class  

* [HoloVideoObjectThreeJS](#HoloVideoObjectThreeJS)
    * [new HoloVideoObjectThreeJS(renderer, callback, options)](#new_HoloVideoObjectThreeJS_new)
    * _instance_
        * [.state](#HoloVideoObjectThreeJS+state) : [<code>States</code>](#HoloVideoObject.States)
        * [.open(url, options)](#HoloVideoObjectThreeJS+open)
        * [.update()](#HoloVideoObjectThreeJS+update)
        * [.rewind()](#HoloVideoObjectThreeJS+rewind)
        * [.seekToTime(seekTime, displayImmediately)](#HoloVideoObjectThreeJS+seekToTime)
        * [.play()](#HoloVideoObjectThreeJS+play)
        * [.close()](#HoloVideoObjectThreeJS+close)
        * [.pause()](#HoloVideoObjectThreeJS+pause)
        * [.setLogLevel(level)](#HoloVideoObjectThreeJS+setLogLevel)
        * [.setAudioEnabled(enabled)](#HoloVideoObjectThreeJS+setAudioEnabled)
        * [.audioEnabled()](#HoloVideoObjectThreeJS+audioEnabled)
        * [.setAudioVolume(volume)](#HoloVideoObjectThreeJS+setAudioVolume)
        * [.setAutoLooping(loop)](#HoloVideoObjectThreeJS+setAutoLooping)
    * _inner_
        * [~openCallback](#HoloVideoObjectThreeJS..openCallback) : <code>function</code>

<a name="new_HoloVideoObjectThreeJS_new"></a>

### new HoloVideoObjectThreeJS(renderer, callback, options)
Creates a new HoloVideoObjectThreeJS instance


| Param | Type | Description |
| --- | --- | --- |
| renderer | <code>THREE.WebGLRenderer</code> | WebGLRenderer that will be used to render the capture. |
| callback | [<code>openCallback</code>](#HoloVideoObjectThreeJS..openCallback) | Callback invoked when initial loading is complete. |
| options | <code>Object</code> | Optional collection of options that permanently affect behavior of this HoloVideoObjectThreeJS instance. |
| options.disableAsyncDecode | <code>boolean</code> | Disables asynchronous video decoding path which may result in improved audio sync but incurs a performance penalty. This is the only decoding path available in WebGL1 environments. |
| options.numAsyncFrames | <code>boolean</code> | Controls how many asynchronous frames are buffered in WebGL2 async. decode path resulting in 'numAsyncFrames' - 1 frames of latency. The default value is 3. |
|  | <code>function</code> | Callback invoked when currentFrame is updated |
|  | [<code>errorCallback</code>](#HoloVideoObject..errorCallback) | Callback invoked when unexpected error condition is encountered, see [HoloVideoObject#ErrorStates](HoloVideoObject#ErrorStates) for list of possible conditions. |

<a name="HoloVideoObjectThreeJS+state"></a>

### holoVideoObjectThreeJS.state : [<code>States</code>](#HoloVideoObject.States)
The current state of this HoloVideoObjectThreeJS instance.

**Kind**: instance property of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+open"></a>

### holoVideoObjectThreeJS.open(url, options)
Opens and capture and begins buffering data for playback

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Capture URL, e.g. "http://127.0.0.1/mycapture.hcap" |
| options | <code>Object</code> | Optional collection of options related to capture loading and playback. |
| options.audioEnabled | <code>boolean</code> | Specifies whether audio playback is enabled initially |
| options.autoplay | <code>boolean</code> | Specifies whether capture should automatically begin playback when loaded. If enabled will disable audio as many browsers do not allow automatic audio playback without user input. |
| options.streamMode | [<code>StreamMode</code>](#HoloVideoObject.StreamMode) | Force the streamMode for the video object. Default is Automatic. |
| options.minBuffers | <code>number</code> | Minimum number of .bin segments that must be buffered before capture is considered preloaded. Default value is 2. |
| options.maxBuffers | <code>number</code> | Maximum number of .bin segments that can be buffered and kept in memory at one time. |
| options.keepAllMeshesInMemory | <code>boolean</code> | Overrides maxBuffers setting and keeps all mesh in memory to prevent further loading. |
| options.startTime | <code>boolean</code> | Time in seconds where playback should begin from. Defaults to 0 if not specified. |

<a name="HoloVideoObjectThreeJS+update"></a>

### holoVideoObjectThreeJS.update()
Updates capture mesh and texture to latest playback frame. This should be called periodically from the application's animate/update loop.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+rewind"></a>

### holoVideoObjectThreeJS.rewind()
Rewinds capture back to the first frame and pauses.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+seekToTime"></a>

### holoVideoObjectThreeJS.seekToTime(seekTime, displayImmediately)
Seeks playback position to the specified time.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type | Description |
| --- | --- | --- |
| seekTime | <code>number</code> | Time (in seconds) to seek to. |
| displayImmediately | <code>boolean</code> | Specifies whether to update to and display target frame immediately. |

<a name="HoloVideoObjectThreeJS+play"></a>

### holoVideoObjectThreeJS.play()
Starts capture playback if sufficient data has been buffered, or resumes paused playback.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+close"></a>

### holoVideoObjectThreeJS.close()
Stops playback and releases capture-specific resources. A new capture can then be loaded by calling [open](#HoloVideoObjectThreeJS+open)

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+pause"></a>

### holoVideoObjectThreeJS.pause()
Pauses playback.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+setLogLevel"></a>

### holoVideoObjectThreeJS.setLogLevel(level)
Sets verbosity level of log output

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>number</code> | 0 = errors, 1 = warnings, 2 = info, 3 = debug. Default setting is = 0. |

<a name="HoloVideoObjectThreeJS+setAudioEnabled"></a>

### holoVideoObjectThreeJS.setAudioEnabled(enabled)
Enables or disables audio playback. May be called at any time.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>boolean</code> | Specifies whether audio should be enabled or disabled. |

<a name="HoloVideoObjectThreeJS+audioEnabled"></a>

### holoVideoObjectThreeJS.audioEnabled()
Returns whether audio playback is currently enabled.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  
<a name="HoloVideoObjectThreeJS+setAudioVolume"></a>

### holoVideoObjectThreeJS.setAudioVolume(volume)
Sets audio volume.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type | Description |
| --- | --- | --- |
| volume | <code>number</code> | Value between 0 and 1 specifying volume level. |

<a name="HoloVideoObjectThreeJS+setAutoLooping"></a>

### holoVideoObjectThreeJS.setAutoLooping(loop)
Specifies whether capture should loop automatically. May be called at any time.

**Kind**: instance method of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type |
| --- | --- |
| loop | <code>boolean</code> | 

<a name="HoloVideoObjectThreeJS..openCallback"></a>

### HoloVideoObjectThreeJS~openCallback : <code>function</code>
**Kind**: inner typedef of [<code>HoloVideoObjectThreeJS</code>](#HoloVideoObjectThreeJS)  

| Param | Type | Description |
| --- | --- | --- |
| mesh | <code>THREE.Mesh</code> | THREE.Mesh object that will be populated with capture geometry during playback. |

