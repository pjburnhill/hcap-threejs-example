(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MRCS = {}, global.THREE));
})(this, (function (exports, Three) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var Three__namespace = /*#__PURE__*/_interopNamespace(Three);

    const version = { major: 1, minor: 1, patch: 0 };

    const MAJOR_PLACEHOLDER = version.major;
    const MINOR_PLACEHOLDER = version.minor;
    const PATCH_PLACEHOLDER = version.patch;
    const clamp = (num, min, max) => (num < min ? min : num > max ? max : num);
    var StreamMode;
    (function (StreamMode) {
        StreamMode[StreamMode["Automatic"] = 0] = "Automatic";
        StreamMode[StreamMode["MP4"] = 1] = "MP4";
        StreamMode[StreamMode["HLS"] = 2] = "HLS";
        StreamMode[StreamMode["Dash"] = 3] = "Dash";
    })(StreamMode || (StreamMode = {}));
    var VideoStates;
    (function (VideoStates) {
        VideoStates[VideoStates["Undefined"] = 0] = "Undefined";
        VideoStates[VideoStates["CanPlay"] = 1] = "CanPlay";
        VideoStates[VideoStates["CanPlayThrough"] = 2] = "CanPlayThrough";
        VideoStates[VideoStates["Waiting"] = 3] = "Waiting";
        VideoStates[VideoStates["Suspended"] = 4] = "Suspended";
        VideoStates[VideoStates["Stalled"] = 5] = "Stalled";
        VideoStates[VideoStates["Playing"] = 6] = "Playing";
    })(VideoStates || (VideoStates = {}));
    var ErrorStates;
    (function (ErrorStates) {
        ErrorStates[ErrorStates["NetworkError"] = -1] = "NetworkError";
        ErrorStates[ErrorStates["VideoError"] = -2] = "VideoError";
        ErrorStates[ErrorStates["PlaybackPrevented"] = -3] = "PlaybackPrevented";
    })(ErrorStates || (ErrorStates = {}));
    exports.States = void 0;
    (function (States) {
        States[States["Closed"] = -1] = "Closed";
        States[States["Empty"] = 0] = "Empty";
        States[States["Opening"] = 1] = "Opening";
        States[States["Opened"] = 2] = "Opened";
        States[States["Playing"] = 3] = "Playing";
        States[States["Paused"] = 4] = "Paused";
    })(exports.States || (exports.States = {}));
    const _extName = 'HCAP_holovideo';
    class HoloVideoObject {
        id;
        state;
        json;
        suspended;
        seekingAutoPlay;
        seekingStartBufferIndex;
        fallbackFrameBuffer;
        nextBufferLoadIndex;
        pendingBufferDownload;
        seekTargetTime;
        searchStartFrame;
        seeking;
        frameIndex;
        lastUpdate;
        lastVideoTime;
        currentBufferIndex;
        pauseAfterSeek;
        unmuteAfterSeek;
        eos;
        audioVolume = 1.0;
        logLevel = 1;
        openOptions;
        createOptions;
        urlRoot;
        caps;
        capsStr;
        dashPlayer;
        httpRequest;
        minBuffers;
        buffersLoaded;
        minVideos;
        videosLoaded;
        buffers;
        freeArrayBuffers;
        lastKeyframeUVs;
        lastKeyframeIndices;
        lastKeyframe;
        prevPrevMesh;
        prevMesh;
        curMesh;
        nextPbo;
        readFences;
        gl;
        texCopyVerts;
        textures;
        texCopyShader;
        fbo1;
        fbo2;
        pixelBuffers;
        octNormalsShader;
        contextLost;
        outputBuffers;
        normalsVao;
        normalsTF;
        vaos;
        transformFeedbacks;
        tfShader;
        deltasBuf;
        clientBuffers;
        onUpdateCurrentFrame;
        errorCallback;
        onEndOfStream;
        onLoaded;
        isSafari;
        safariVersion;
        iOSVersion;
        isMozillaWebXRViewer;
        fileInfo;
        currentFrameInfo;
        videoElement = null;
        meshFrames;
        nextVideoLoadIndex;
        videoState;
        lastVideoSampleIndex;
        pendingVideoEndEvent;
        needMeshData;
        pendingVideoEndEventWaitCount;
        fallbackTextureImage;
        oldVideoSampleIndex;
        watermarkPixels;
        filledFallbackFrame;
        requestKeyframe;
        outputBufferIndex;
        static _instanceCounter = 0;
        static Version = {
            Major: MAJOR_PLACEHOLDER,
            Minor: MINOR_PLACEHOLDER,
            Patch: PATCH_PLACEHOLDER,
            String: `${MAJOR_PLACEHOLDER}.${MINOR_PLACEHOLDER}.${PATCH_PLACEHOLDER}`,
        };
        _createProgram(gl, vertexShaderSource, fragmentShaderSource, preLink) {
            function _createShader(gl, source, type) {
                var shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                return shader;
            }
            var program = gl.createProgram();
            var vshader = _createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
            gl.attachShader(program, vshader);
            gl.deleteShader(vshader);
            var fshader = _createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
            gl.attachShader(program, fshader);
            gl.deleteShader(fshader);
            if (preLink) {
                preLink(program);
            }
            gl.linkProgram(program);
            var log = gl.getProgramInfoLog(program);
            if (log) {
                this._logError(log);
            }
            log = gl.getShaderInfoLog(vshader);
            if (log) {
                this._logError(log);
            }
            log = gl.getShaderInfoLog(fshader);
            if (log) {
                this._logError(log);
            }
            return program;
        }
        _loadJSON(src, callback) {
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.onreadystatechange = () => {
                if (xobj.readyState == 4 &&
                    xobj.status == 200) {
                    callback(xobj.responseText, this);
                }
                else if (xobj.status >= 400) {
                    this._logError("_loadJSON failed for: " + src + ", XMLHttpRequest status = " + xobj.status);
                    this._onError(ErrorStates.NetworkError);
                }
            };
            xobj.onerror = () => {
                this._logError("_loadJSON XMLHttpRequest error for: " + src + ", status = " + xobj.status);
                this._onError(ErrorStates.NetworkError);
            };
            xobj.open('GET', src, true);
            xobj.send(null);
            return xobj.responseText;
        }
        _loadArrayBuffer(url, callback) {
            var xobj = new XMLHttpRequest();
            xobj.name = url.substring(url.lastIndexOf("/") + 1, url.length);
            xobj.responseType = 'arraybuffer';
            xobj.onprogress = e => {
                if (e.lengthComputable) {
                    Math.floor((e.loaded / e.total) * 100);
                }
            };
            xobj.onreadystatechange = () => {
                if (xobj.readyState == 4) {
                    if (xobj.status == 200) {
                        var arrayBuffer = xobj.response;
                        if (arrayBuffer && callback) {
                            callback(arrayBuffer);
                        }
                    }
                    else if (xobj.status >= 400) {
                        this._logError("_loadArrayBuffer failed for: " + url + ", XMLHttpRequest status = " + xobj.status);
                        this._onError(ErrorStates.NetworkError);
                    }
                    else {
                        this._logWarning("_loadArrayBuffer unexpected status = " + xobj.status);
                    }
                    if (this.httpRequest == xobj) {
                        this.httpRequest = null;
                    }
                }
            };
            xobj.ontimeout = () => {
                this._logError("_loadArrayBuffer timeout");
                this._onError(ErrorStates.NetworkError);
            };
            xobj.open('GET', url, true);
            xobj.send(null);
            this.httpRequest = xobj;
        }
        _startPlaybackIfReady() {
            if (this.state == exports.States.Opening) {
                if (this.buffersLoaded >= this.minBuffers &&
                    this.videosLoaded >= this.minVideos) {
                    this._logInfo("state -> Opened");
                    this.state = exports.States.Opened;
                    if (this.openOptions.autoplay) {
                        this.play();
                    }
                    else if (this.seekingAutoPlay) {
                        delete this.seekingAutoPlay;
                        this.play();
                    }
                }
            }
            else if (this.seekingAutoPlay) {
                if (this.buffersLoaded >= this.minBuffers &&
                    this.videosLoaded >= this.minVideos) {
                    delete this.seekingAutoPlay;
                    this.play();
                }
            }
            if (this.suspended) {
                let currentVideo = this._currentVideo();
                if ((currentVideo.paused || !currentVideo.playing) && currentVideo.preloaded) {
                    this._logInfo("video " + currentVideo.mp4Name + " was suspended, resuming");
                    this.suspended = false;
                    currentVideo.play();
                }
            }
            else if (this.state == exports.States.Playing) {
                let currentVideo = this._currentVideo();
                if (!currentVideo.playing) {
                    currentVideo.play();
                }
            }
        }
        _isBufferAlreadyLoaded(bufferIndex) {
            for (let i = 0; i < this.buffers.length; ++i) {
                if (this.buffers[i] && this.buffers[i].bufferIndex == bufferIndex) {
                    return true;
                }
            }
            return false;
        }
        _loadNextBuffer() {
            if (this.freeArrayBuffers.length == 0) {
                if (this.openOptions.keepAllMeshesInMemory) {
                    this._logInfo("All meshes loaded.");
                    return;
                }
                this._logInfo("_loadNextBuffer: Waiting for next free buffer...");
                return;
            }
            let bufferIndex = undefined;
            if (this.seekingStartBufferIndex && this.fallbackFrameBuffer) {
                bufferIndex = this.nextBufferLoadIndex = this.seekingStartBufferIndex;
                delete this.seekingStartBufferIndex;
            }
            else {
                bufferIndex = this.nextBufferLoadIndex;
            }
            if (this.seekingStartBufferIndex) {
                this.nextBufferLoadIndex = this.seekingStartBufferIndex;
                delete this.seekingStartBufferIndex;
            }
            else {
                do {
                    this.nextBufferLoadIndex = (this.nextBufferLoadIndex + 1) % (this.json.buffers.length);
                } while (this._isBufferAlreadyLoaded(this.nextBufferLoadIndex));
            }
            if (this.fallbackFrameBuffer && this.nextBufferLoadIndex == 0) {
                this.nextBufferLoadIndex = 1;
            }
            var buffer = this.json.buffers[bufferIndex];
            var bufferName = buffer.uri;
            var bufferURL = this.urlRoot + bufferName;
            buffer.loaded = false;
            var arrayBufferIndex = -1;
            if (bufferIndex == 0) {
                this._logInfo("loading preview frame buffer");
            }
            else {
                arrayBufferIndex = this.freeArrayBuffers.shift();
                this._logInfo("loading buffer: " + buffer.uri + " into slot " + arrayBufferIndex);
            }
            this.pendingBufferDownload = true;
            this._loadArrayBuffer(bufferURL, function (arrayBuffer) {
                if (!this.fallbackFrameBuffer && !this.filledFallbackFrame) {
                    this._logInfo("fallback frame buffer downloaded " + buffer.uri);
                    this.fallbackFrameBuffer = arrayBuffer;
                    this._loadNextBuffer();
                    this.pendingBufferDownload = false;
                    return;
                }
                this._logInfo("buffer loaded: " + buffer.uri + " into slot " + arrayBufferIndex);
                ++this.buffersLoaded;
                this.buffers[arrayBufferIndex] = arrayBuffer;
                arrayBuffer.bufferIndex = bufferIndex;
                buffer.arrayBufferIndex = arrayBufferIndex;
                buffer.loaded = true;
                this.pendingBufferDownload = false;
                this.needMeshData = false;
                this._startPlaybackIfReady();
                this._loadNextBuffer();
            }.bind(this));
        }
        _setSeekTarget(seekTime) {
            this.seekTargetTime = seekTime;
            this.searchStartFrame = this._computeSeekSearchFrame(this.seekTargetTime);
            this.seeking = true;
            let ext = this.json.extensions[_extName];
            let currentFrameTime = this.frameIndex / ext.framerate;
            if (this.searchStartFrame != this.lastKeyframe || this.seekTargetTime < currentFrameTime) {
                this.requestKeyframe = true;
            }
        }
        _frameIsKeyframe(frameIndex) {
            let frame = this.meshFrames[frameIndex];
            return frame.indices != undefined;
        }
        _computeSeekSearchFrame(targetTimeSec) {
            let ext = this.json.extensions[_extName];
            let keyframes = ext.keyframes;
            for (let i = keyframes.length - 1; i >= 0; --i) {
                let timestamp = keyframes[i] / ext.framerate;
                if (timestamp <= targetTimeSec) {
                    return keyframes[i];
                }
            }
            return 0;
        }
        _computeSeekSearchTime(targetTimeSec) {
            let ext = this.json.extensions[_extName];
            let keyframe = this._computeSeekSearchFrame(targetTimeSec);
            let timestamp = keyframe / ext.framerate;
            return timestamp;
        }
        _currentVideo() {
            const timeline = this.json.extensions[_extName].timeline;
            const image = this.json.images[timeline[0].image];
            const currentVideo = image.video;
            return currentVideo;
        }
        seekToTime(seekTimeMs, displayImmediately) {
            if (this.seeking) {
                this._logWarning("seekToTime: ignoring request due to prior seek in-progress");
                return;
            }
            if (this.httpRequest) {
                this.httpRequest.abort();
                this.httpRequest = null;
            }
            let currentVideo = this._currentVideo();
            let wasPlaying = false;
            if (this.state == exports.States.Playing) {
                wasPlaying = true;
                this.pause();
                currentVideo.playing = false;
                this.seekingAutoPlay = true;
            }
            this._setSeekTarget(seekTimeMs);
            let frame = this.meshFrames[this.searchStartFrame];
            const bufferViews = this.json.bufferViews;
            let bufferIndex = bufferViews[frame.indices.bufferView].buffer;
            let buffersNeeded = [];
            let index = bufferIndex;
            for (let i = 0; i < Math.min(this.openOptions.maxBuffers, this.json.buffers.length); ++i) {
                if (index == 0) {
                    index = 1;
                }
                buffersNeeded.push(index);
                index = (index + 1) % this.json.buffers.length;
            }
            let newStartBuffer = true;
            this.currentBufferIndex = -1;
            this.buffersLoaded = 0;
            let freeBuffers = [];
            for (let i = 0; i < this.buffers.length; ++i) {
                let buffer = this.buffers[i].bufferIndex;
                if (buffer == bufferIndex) {
                    newStartBuffer = false;
                    this.currentBufferIndex = i;
                }
                if (buffersNeeded.indexOf(buffer) == -1) {
                    freeBuffers.push(i);
                }
                else {
                    ++this.buffersLoaded;
                }
            }
            if (!this.openOptions.keepAllMeshesInMemory) {
                this.freeArrayBuffers = freeBuffers;
            }
            if (newStartBuffer) {
                this.seekingStartBufferIndex = bufferIndex;
            }
            if (!wasPlaying && displayImmediately) {
                this.seekingAutoPlay = true;
                this.pauseAfterSeek = true;
            }
            this.oldVideoSampleIndex = this.lastVideoSampleIndex;
            this.nextPbo = 0;
            this.lastVideoSampleIndex = -1;
            if (this.requestKeyframe) {
                this.lastKeyframe = -1;
                this.lastKeyframeIndices = null;
                this.lastKeyframeUVs = null;
                this.curMesh = null;
                this.prevMesh = null;
                this.prevPrevMesh = null;
            }
            this._setVideoStartTime(currentVideo);
            if (freeBuffers.length == 0) {
                this._startPlaybackIfReady();
            }
            else {
                this._loadNextBuffer();
            }
            this._logDebug("seekToTime: targetTime = " + seekTimeMs + ", search start = " + this.searchStartFrame + " (in buffer " + bufferIndex + ")");
        }
        _setVideoStartTime(video) {
            if (this.seekTargetTime) {
                let searchStart = this._computeSeekSearchTime(this.seekTargetTime);
                const oldTime = video.currentTime;
                if (this.requestKeyframe) {
                    video.currentTime = searchStart;
                    this._logDebug("setVideoStartTime: requestKeyframe, video.currentTime was " + oldTime + ", video.currentTime -> searchStart = " + searchStart);
                }
                else if (video.currentTime > this.seekTargetTime) {
                    video.currentTime = this.seekTargetTime;
                    this._logDebug("setVideoStartTime: back up to seekTargetTime = " + this.seekTargetTime + ", video.currentTime was " + oldTime);
                }
                else {
                    this._logDebug("setVideoStartTime: don't touch video.currentTime, was " + oldTime);
                }
                if (!video.muted) {
                    video.muted = true;
                    this.unmuteAfterSeek = true;
                }
            }
            else {
                video.currentTime = 0.0;
            }
        }
        cleanUpEventListeners = null;
        videoElementInitialized = false;
        _loadNextVideo() {
            if (this.videoElementInitialized) {
                return;
            }
            this.videoElementInitialized = true;
            const video = this.videoElement;
            var videoIndex = this.nextVideoLoadIndex;
            var numVideos = this.json.extensions[_extName].timeline.length;
            this.nextVideoLoadIndex = (this.nextVideoLoadIndex + 1) % numVideos;
            var image = this.json.images[this.json.extensions[_extName].timeline[videoIndex].image];
            image.video = video;
            video.preloaded = false;
            video.autoplay = false;
            video.muted = this.openOptions.autoplay || !this.openOptions.audioEnabled;
            if (this.isSafari) {
                video.muted = true;
            }
            video.loop = numVideos == 1 && this.openOptions.autoloop;
            video.preload = "auto";
            video.crossOrigin = "use-credentials";
            video.playing = false;
            video.preloaded = false;
            video.src = null;
            var imageExt = image.extensions[_extName];
            if (this.openOptions.streamMode === undefined) {
                this.openOptions.streamMode = StreamMode.Automatic;
            }
            let hasIOS14HLSIssue = this.iOSVersion && this.iOSVersion.major == 14 && this.iOSVersion.minor < 6;
            if (!this.iOSVersion && this.safariVersion && this.safariVersion.major < 15) {
                hasIOS14HLSIssue = true;
            }
            if ((this.openOptions.streamMode == StreamMode.HLS) ||
                (this.openOptions.streamMode == StreamMode.Automatic && ((this.isSafari || this.isMozillaWebXRViewer) && imageExt.hlsUri && !hasIOS14HLSIssue))) {
                this._setVideoStartTime(video);
                video.src = this.urlRoot + imageExt.hlsUri;
                video.mp4Name = imageExt.hlsUri;
            }
            else if ((this.openOptions.streamMode == StreamMode.Dash) ||
                (this.openOptions.streamMode == StreamMode.Automatic && (!this.isSafari && !this.isMozillaWebXRViewer && imageExt.dashUri && typeof dashjs != "undefined"))) {
                if (!this.dashPlayer) {
                    this.dashPlayer = dashjs.MediaPlayer().create();
                    this.dashPlayer.initialize();
                }
                var url = this.urlRoot + imageExt.dashUri;
                if (this.seekTargetTime) {
                    let searchStart = this._computeSeekSearchTime(this.seekTargetTime);
                    url += "#t=" + searchStart;
                    this.dashPlayer.attachView(video);
                    this.dashPlayer.attachSource(url);
                    video.currentTime = searchStart;
                    if (!video.muted) {
                        video.muted = true;
                        this.unmuteAfterSeek = true;
                    }
                }
                else {
                    this.dashPlayer.attachView(video);
                    this.dashPlayer.attachSource(url);
                }
                video.mp4Name = imageExt.dashUri;
            }
            else {
                this._setVideoStartTime(video);
                var url = this.urlRoot + image.uri;
                video.src = url;
                video.mp4Name = image.uri;
            }
            this._logInfo("loading video " + video.mp4Name);
            const hvo = this;
            const onCanPlay = () => { hvo.videoState = VideoStates.CanPlay; };
            const onPlay = () => { hvo.videoState = VideoStates.Playing; };
            const onCanPlayThrough = () => { hvo.videoState = VideoStates.CanPlayThrough; };
            const onWaiting = () => { hvo.videoState = VideoStates.Waiting; };
            const onSuspend = () => { hvo.videoState = VideoStates.Suspended; };
            const onStalled = () => { hvo.videoState = VideoStates.Stalled; };
            video.addEventListener('canplay', onCanPlay);
            video.addEventListener('play', onPlay);
            video.addEventListener('canplaythrough', onCanPlayThrough);
            video.addEventListener('waiting', onWaiting);
            video.addEventListener('suspend', onSuspend);
            video.addEventListener('stalled', onStalled);
            this.cleanUpEventListeners = () => {
                video.removeEventListener('canplay', onCanPlay);
                video.removeEventListener('play', onPlay);
                video.removeEventListener('canplaythrough', onCanPlayThrough);
                video.removeEventListener('waiting', onWaiting);
                video.removeEventListener('suspend', onSuspend);
                video.removeEventListener('stalled', onStalled);
            };
            video.canplay = () => {
                this._logInfo("video -> canplay");
                this.videoState = VideoStates.CanPlay;
            };
            video.canplaythrough = () => {
                this._logInfo("video -> canplaythrough");
                this.videoState = VideoStates.CanPlayThrough;
            };
            video.waiting = () => {
                this._logInfo("video -> waiting");
                this.videoState = VideoStates.Waiting;
            };
            video.suspend = () => {
                this._logInfo("video -> suspend");
                this.videoState = VideoStates.Suspended;
            };
            video.stalled = () => {
                this._logInfo("video -> stalled");
                this.videoState = VideoStates.Stalled;
            };
            video.onerror = (e) => {
                const target = e.target;
                this._logError("video error: " + target.error.code + " - " + target.mp4Name);
                this._onError(ErrorStates.VideoError, target.error);
            };
            video.onended = () => {
                this.pendingVideoEndEvent = true;
                this.pendingVideoEndEventWaitCount = 0;
            };
            if (this.isSafari) {
                video.onplaying = function () {
                    video.pause();
                    video.muted = this.openOptions.autoplay || !this.openOptions.audioEnabled;
                    video.preloaded = true;
                    this._logInfo("video loaded: " + video.mp4Name);
                    video.onplaying = function () {
                        this._logInfo("video playing: " + video.mp4Name);
                        video.playing = true;
                    }.bind(this);
                    ++this.videosLoaded;
                    this._startPlaybackIfReady();
                    this._loadNextVideo();
                }.bind(this);
            }
            else {
                video.onloadeddata = function () {
                    var playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                        })
                            .catch(error => {
                            video.onplaying(undefined);
                        });
                    }
                }.bind(this);
                video.onplaying = function () {
                    video.pause();
                    video.preloaded = true;
                    this._logInfo("video loaded: " + video.mp4Name);
                    video.onplaying = function () {
                        this._logInfo("video playing: " + video.mp4Name);
                        video.playing = true;
                    }.bind(this);
                    ++this.videosLoaded;
                    this._startPlaybackIfReady();
                    this._loadNextVideo();
                }.bind(this);
            }
            if (this.isSafari) {
                let playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        this._logWarning("play prevented: " + error);
                        this._onError(ErrorStates.PlaybackPrevented, error);
                    });
                }
            }
        }
        _resetFreeBuffers() {
            this.freeArrayBuffers = [];
            for (var i = 0; i < Math.min(this.openOptions.maxBuffers, this.json.buffers.length - 1); ++i) {
                this.freeArrayBuffers.push(i);
            }
        }
        rewind() {
            if (this.json) {
                this._logInfo("rewind");
                let currentVideo = this._currentVideo();
                currentVideo.pause();
                currentVideo.playing = false;
                currentVideo.currentTime = 0.0;
                this.pendingVideoEndEvent = false;
                this.state = exports.States.Opening;
                if (!this.openOptions.keepAllMeshesInMemory) {
                    this._resetFreeBuffers();
                }
                this.currentBufferIndex = 0;
                this.nextBufferLoadIndex = this.fallbackFrameBuffer ? 1 : 0;
                this.frameIndex = -1;
                this.lastKeyframe = -1;
                this.lastKeyframeIndices = null;
                this.lastKeyframeUVs = null;
                this.nextPbo = 0;
                this.lastVideoSampleIndex = -1;
                this.filledFallbackFrame = false;
                this.curMesh = null;
                this.prevMesh = null;
                this.prevPrevMesh = null;
                delete this.seekTargetTime;
                if (this.readFences) {
                    for (var i = 0; i < this.readFences.length; ++i) {
                        if (this.readFences[i]) {
                            this.gl.deleteSync(this.readFences[i]);
                            this.readFences[i] = null;
                        }
                    }
                }
                this._loadNextBuffer();
                this._loadFallbackFrame();
                this._startPlaybackIfReady();
            }
        }
        forceLoad() {
            if (this.json) {
                let currentVideo = this._currentVideo();
                if (currentVideo.playing) {
                    this._logInfo("forceLoad: video already playing");
                }
                else if (!currentVideo.preloaded) {
                    this._logInfo("forceLoad: manually starting video");
                    this.suspended = true;
                    var playPromise = currentVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            this.state = exports.States.Playing;
                        })
                            .catch(error => {
                            this._logWarning("play prevented: " + error);
                            this._onError(ErrorStates.PlaybackPrevented, error);
                        });
                    }
                }
            }
            else {
                this._logInfo("forceLoad: don't have json yet");
            }
        }
        _onVideoEnded(video) {
            this._logInfo("video ended = " + video.mp4Name);
            this.videoElementInitialized = false;
            var timeline = this.json.extensions[_extName].timeline;
            this.state = exports.States.Opened;
            if (timeline.length - 1 === 0 && !this.openOptions.autoloop) {
                this.eos = true;
                if (this.onEndOfStream) {
                    this.onEndOfStream(this);
                }
            }
            else {
                this._loadNextVideo();
                this._startPlaybackIfReady();
            }
        }
        _setupTransformFeedback() {
            var gl = this.gl;
            this.outputBufferIndex = 0;
            this.deltasBuf = gl.createBuffer();
            this.outputBuffers = [gl.createBuffer(), gl.createBuffer(), gl.createBuffer()];
            this.transformFeedbacks = [gl.createTransformFeedback(), gl.createTransformFeedback(), gl.createTransformFeedback()];
            this.vaos = [gl.createVertexArray(), gl.createVertexArray(), gl.createVertexArray()];
            gl.bindVertexArray(null);
            for (var i = 0; i < 3; ++i) {
                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[i]);
                gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.outputBuffers[i]);
            }
            this.normalsVao = gl.createVertexArray();
            this.normalsTF = gl.createTransformFeedback();
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
            var tfShaderSourcePS = `#version 300 es
            out lowp vec4 fragColor;
            void main()
            {
                fragColor = vec4(0,0,0,0);
            }
            `;
            var tfShaderSourceVS = `#version 300 es
            in vec3 inQuantized;
            in vec3 prevPos;
            in vec3 prevPrevPos;

            uniform vec3 decodeMin;
            uniform vec3 decodeMax;
            uniform int havePrevPos;
            uniform int havePrevPrevPos;

            out vec3 outPos;

            void main()
            {
                if (havePrevPos == 1)
                {
                    vec3 dm = vec3(0.0, 0.0, 0.0);

                    if (havePrevPrevPos == 1)
                    {
                        dm = prevPos - prevPrevPos;
                    }

                    vec3 delta = (decodeMax - decodeMin) * inQuantized + decodeMin;
                    outPos = prevPos + dm + delta;
                }

                else
                {
                    outPos = (decodeMax - decodeMin) * inQuantized + decodeMin;
                }
            }`;
            var tfShader = this._createProgram(gl, tfShaderSourceVS, tfShaderSourcePS, function (program) {
                gl.transformFeedbackVaryings(program, ["outPos"], gl.SEPARATE_ATTRIBS);
            });
            tfShader.havePrevPosLoc = gl.getUniformLocation(tfShader, "havePrevPos");
            tfShader.havePrevPrevPosLoc = gl.getUniformLocation(tfShader, "havePrevPrevPos");
            tfShader.decodeMinLoc = gl.getUniformLocation(tfShader, "decodeMin");
            tfShader.decodeMaxLoc = gl.getUniformLocation(tfShader, "decodeMax");
            tfShader.inQuantizedLoc = gl.getAttribLocation(tfShader, "inQuantized");
            tfShader.prevPosLoc = gl.getAttribLocation(tfShader, "prevPos");
            tfShader.prevPrevPosLoc = gl.getAttribLocation(tfShader, "prevPrevPos");
            this.tfShader = tfShader;
            var octNormalsShaderSourceVS = `#version 300 es
            in vec2 inOctNormal;
            out vec3 outNormal;

            vec3 OctDecode(vec2 f)
            {
                f = f * 2.0 - 1.0;

                // https://twitter.com/Stubbesaurus/status/937994790553227264
                vec3 n = vec3( f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
                float t = clamp(-n.z, 0.0, 1.0);
                n.x += n.x >= 0.0 ? -t : t;
                n.y += n.y >= 0.0 ? -t : t;
                return normalize(n);
            }

            void main()
            {
                outNormal = OctDecode(inOctNormal);
            }`;
            var octNormalsShader = this._createProgram(gl, octNormalsShaderSourceVS, tfShaderSourcePS, function (program) {
                gl.transformFeedbackVaryings(program, ["outNormal"], gl.SEPARATE_ATTRIBS);
            });
            octNormalsShader.inOctNormalLoc = gl.getAttribLocation(octNormalsShader, "inOctNormal");
            this.octNormalsShader = octNormalsShader;
        }
        _updateMeshTF(frame, posBuf, uvBuf, indexBuf, norBuf, sourceBuffers, updateClientBuffers, wasSeeking) {
            var gl = this.gl;
            frame.outputBuffer = this.outputBuffers[this.outputBufferIndex];
            var saveVb = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
            var saveIb = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
            var saveShader = gl.getParameter(gl.CURRENT_PROGRAM);
            var saveVa = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
            gl.useProgram(this.tfShader);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            var vertexCount = 0;
            var tfShader = this.tfShader;
            if (frame.primitives[0].extensions[_extName].attributes.POSITION) {
                this.lastKeyframe = this.frameIndex;
                if (updateClientBuffers) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sourceBuffers.indices, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, saveIb);
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.compressedUVs, gl.STATIC_DRAW);
                }
                gl.bindVertexArray(this.vaos[0]);
                this.prevMesh = null;
                this.prevPrevMesh = null;
                vertexCount = frame.compressedPos.count;
                frame.indexCount = frame.indices.count;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.deltasBuf);
                gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.compressedPos, gl.DYNAMIC_DRAW);
                gl.enableVertexAttribArray(tfShader.inQuantizedLoc);
                gl.vertexAttribPointer(tfShader.inQuantizedLoc, 3, frame.compressedPos.componentType, true, 0, 0);
                gl.disableVertexAttribArray(tfShader.prevPosLoc);
                gl.disableVertexAttribArray(tfShader.prevPrevPosLoc);
                var min = frame.compressedPos.extensions[_extName].decodeMin;
                var max = frame.compressedPos.extensions[_extName].decodeMax;
                gl.uniform3fv(tfShader.decodeMinLoc, min);
                gl.uniform3fv(tfShader.decodeMaxLoc, max);
                this.currentFrameInfo.bboxMin = min;
                this.currentFrameInfo.bboxMax = max;
                gl.uniform1i(tfShader.havePrevPosLoc, 0);
                gl.uniform1i(tfShader.havePrevPrevPosLoc, 0);
            }
            else {
                vertexCount = frame.deltas.count;
                frame.indexCount = this.prevMesh.indexCount;
                if (this.prevPrevMesh == null) {
                    gl.bindVertexArray(this.vaos[1]);
                }
                else {
                    gl.bindVertexArray(this.vaos[2]);
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.deltasBuf);
                gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.deltas, gl.DYNAMIC_DRAW);
                gl.enableVertexAttribArray(tfShader.inQuantizedLoc);
                gl.vertexAttribPointer(tfShader.inQuantizedLoc, 3, frame.deltas.componentType, true, 0, 0);
                gl.uniform3fv(tfShader.decodeMinLoc, frame.deltas.extensions[_extName].decodeMin);
                gl.uniform3fv(tfShader.decodeMaxLoc, frame.deltas.extensions[_extName].decodeMax);
                gl.uniform1i(tfShader.havePrevPosLoc, 1);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.prevMesh.outputBuffer);
                gl.enableVertexAttribArray(tfShader.prevPosLoc);
                gl.vertexAttribPointer(tfShader.prevPosLoc, 3, gl.FLOAT, false, 0, 0);
                if (this.prevPrevMesh == null) {
                    gl.uniform1i(tfShader.havePrevPrevPosLoc, 0);
                    gl.disableVertexAttribArray(tfShader.prevPrevPosLoc);
                }
                else {
                    gl.uniform1i(tfShader.havePrevPrevPosLoc, 1);
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.prevPrevMesh.outputBuffer);
                    gl.enableVertexAttribArray(tfShader.prevPrevPosLoc);
                    gl.vertexAttribPointer(tfShader.prevPrevPosLoc, 3, gl.FLOAT, false, 0, 0);
                }
            }
            var bufferSize = vertexCount * 12;
            gl.bindBuffer(gl.ARRAY_BUFFER, frame.outputBuffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[this.outputBufferIndex]);
            gl.enable(gl.RASTERIZER_DISCARD);
            gl.beginTransformFeedback(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, vertexCount);
            gl.endTransformFeedback();
            gl.disable(gl.RASTERIZER_DISCARD);
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
            if (updateClientBuffers) {
                gl.bindBuffer(gl.COPY_READ_BUFFER, frame.outputBuffer);
                gl.bindBuffer(gl.COPY_WRITE_BUFFER, posBuf);
                gl.bufferData(gl.COPY_WRITE_BUFFER, bufferSize, gl.DYNAMIC_COPY);
                gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, bufferSize);
                gl.bindBuffer(gl.COPY_READ_BUFFER, null);
                gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
                if (wasSeeking) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.lastKeyframeIndices, gl.DYNAMIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, this.lastKeyframeUVs, gl.DYNAMIC_DRAW);
                }
            }
            this.outputBufferIndex = (this.outputBufferIndex + 1) % 3;
            if (norBuf && sourceBuffers.compressedNormals && updateClientBuffers) {
                if (this.fileInfo.octEncodedNormals) {
                    gl.useProgram(this.octNormalsShader);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindVertexArray(this.normalsVao);
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.deltasBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.compressedNormals, gl.DYNAMIC_DRAW);
                    gl.enableVertexAttribArray(this.octNormalsShader.inOctNormalLoc);
                    gl.vertexAttribPointer(this.octNormalsShader.inOctNormalLoc, 2, gl.UNSIGNED_BYTE, true, 0, 0);
                    var bufferSize = vertexCount * 12;
                    gl.bindBuffer(gl.ARRAY_BUFFER, norBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.normalsTF);
                    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, norBuf);
                    gl.enable(gl.RASTERIZER_DISCARD);
                    gl.beginTransformFeedback(gl.POINTS);
                    gl.drawArrays(gl.POINTS, 0, vertexCount);
                    gl.endTransformFeedback();
                    gl.disable(gl.RASTERIZER_DISCARD);
                    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
                    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
                }
                else {
                    gl.bindBuffer(gl.ARRAY_BUFFER, norBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.compressedNormals, gl.DYNAMIC_DRAW);
                }
            }
            gl.useProgram(saveShader);
            gl.bindBuffer(gl.ARRAY_BUFFER, saveVb);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, saveIb);
            gl.bindVertexArray(saveVa);
            return true;
        }
        _updateMesh(posBuf, uvBuf, indexBuf, norBuf, updateClientBuffers = false, wasSeeking = false) {
            this.frameIndex = (this.frameIndex + 1) % this.meshFrames.length;
            var frame = this.meshFrames[this.frameIndex];
            if (!frame.ensureBuffers()) {
                return false;
            }
            if (this.prevPrevMesh) {
                this.prevPrevMesh.uncompressedPos = null;
            }
            this.prevPrevMesh = this.prevMesh;
            this.prevMesh = this.curMesh;
            this.curMesh = frame;
            var sourceBuffers = {
                indices: null,
                compressedPos: null,
                compressedUVs: null,
                compressedNormals: null,
                deltas: null
            };
            var gl = this.gl;
            var buffers = this.json.buffers;
            var bufferViews = this.json.bufferViews;
            var attributes = frame.primitives[0].extensions[_extName].attributes;
            var arrayBufferIndex = -1;
            if (attributes.POSITION) {
                arrayBufferIndex = buffers[bufferViews[frame.indices.bufferView].buffer].arrayBufferIndex;
                var indexArrayBuf = this.buffers[arrayBufferIndex];
                var posArrayBuf = this.buffers[arrayBufferIndex];
                var uvArrayBuf = this.buffers[arrayBufferIndex];
                if (frame.indices.componentType == gl.UNSIGNED_SHORT) {
                    sourceBuffers.indices = new Uint16Array(indexArrayBuf, bufferViews[frame.indices.bufferView].byteOffset + frame.indices.byteOffset, frame.indices.count);
                }
                else {
                    sourceBuffers.indices = new Uint32Array(indexArrayBuf, bufferViews[frame.indices.bufferView].byteOffset + frame.indices.byteOffset, frame.indices.count);
                }
                this.lastKeyframeIndices = sourceBuffers.indices;
                sourceBuffers.compressedPos = new Uint16Array(posArrayBuf, bufferViews[frame.compressedPos.bufferView].byteOffset + frame.compressedPos.byteOffset, frame.compressedPos.count * 3);
                this.lastKeyframeUVs = sourceBuffers.compressedUVs = new Uint16Array(uvArrayBuf, bufferViews[frame.compressedUVs.bufferView].byteOffset + frame.compressedUVs.byteOffset, frame.compressedUVs.count * 2);
            }
            else {
                arrayBufferIndex = buffers[bufferViews[frame.deltas.bufferView].buffer].arrayBufferIndex;
                var deltasArrayBuf = this.buffers[arrayBufferIndex];
                sourceBuffers.deltas = new Uint8Array(deltasArrayBuf, bufferViews[frame.deltas.bufferView].byteOffset + frame.deltas.byteOffset, frame.deltas.count * 3);
            }
            if (arrayBufferIndex != this.currentBufferIndex) {
                if (this.currentBufferIndex == -1) {
                    this.currentBufferIndex = arrayBufferIndex;
                }
                else {
                    this._logInfo("currentBufferIndex -> " + arrayBufferIndex);
                    if (!this.openOptions.keepAllMeshesInMemory) {
                        this.freeArrayBuffers.push(this.currentBufferIndex);
                    }
                    this.currentBufferIndex = arrayBufferIndex;
                    if (!this.pendingBufferDownload) {
                        this._loadNextBuffer();
                    }
                }
            }
            if (frame.compressedNormals != null) {
                var norArrayBuf = this.buffers[buffers[bufferViews[frame.compressedNormals.bufferView].buffer].arrayBufferIndex];
                if (frame.compressedNormals.type == "VEC2") {
                    sourceBuffers.compressedNormals = new Uint8Array(norArrayBuf, bufferViews[frame.compressedNormals.bufferView].byteOffset + frame.compressedNormals.byteOffset, frame.compressedNormals.count * 2);
                }
                else if (frame.compressedNormals.type == "VEC3") {
                    sourceBuffers.compressedNormals = new Uint16Array(norArrayBuf, bufferViews[frame.compressedNormals.bufferView].byteOffset + frame.compressedNormals.byteOffset, frame.compressedNormals.count * 3);
                }
            }
            if (this.caps.webgl2 && !this.caps.badTF) {
                return this._updateMeshTF(frame, posBuf, uvBuf, indexBuf, norBuf, sourceBuffers, updateClientBuffers, wasSeeking);
            }
            var saveVb = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
            var saveIb = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
            if (frame.primitives[0].extensions[_extName].attributes.POSITION) {
                this.lastKeyframe = this.frameIndex;
                if (this.prevMesh) {
                    this.prevMesh.uncompressedPos = null;
                    this.prevMesh = null;
                }
                if (this.prevPrevMesh) {
                    this.prevPrevMesh.uncompressedPos = null;
                    this.prevPrevMesh = null;
                }
                if (updateClientBuffers) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sourceBuffers.indices, gl.DYNAMIC_DRAW);
                }
                frame.indexCount = frame.indices.count;
                {
                    const count = frame.compressedPos.count;
                    frame.uncompressedPos = new Float32Array(count * 3);
                    var min = frame.compressedPos.extensions[_extName].decodeMin;
                    var max = frame.compressedPos.extensions[_extName].decodeMax;
                    this.currentFrameInfo.bboxMin = min;
                    this.currentFrameInfo.bboxMax = max;
                    var bboxdx = (max[0] - min[0]) / 65535.0;
                    var bboxdy = (max[1] - min[1]) / 65535.0;
                    var bboxdz = (max[2] - min[2]) / 65535.0;
                    for (var i = 0; i < count; ++i) {
                        var i0 = 3 * i;
                        var i1 = i0 + 1;
                        var i2 = i0 + 2;
                        frame.uncompressedPos[i0] = sourceBuffers.compressedPos[i0] * bboxdx + min[0];
                        frame.uncompressedPos[i1] = sourceBuffers.compressedPos[i1] * bboxdy + min[1];
                        frame.uncompressedPos[i2] = sourceBuffers.compressedPos[i2] * bboxdz + min[2];
                    }
                    if (updateClientBuffers) {
                        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
                        gl.bufferData(gl.ARRAY_BUFFER, frame.uncompressedPos, gl.DYNAMIC_DRAW);
                    }
                }
                if (updateClientBuffers) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.compressedUVs, gl.DYNAMIC_DRAW);
                }
            }
            else {
                var count = frame.deltas.count;
                frame.uncompressedPos = new Float32Array(count * 3);
                frame.indexCount = this.prevMesh.indexCount;
                var min = frame.deltas.extensions[_extName].decodeMin;
                var max = frame.deltas.extensions[_extName].decodeMax;
                var bboxdx = (max[0] - min[0]) / 255.0;
                var bboxdy = (max[1] - min[1]) / 255.0;
                var bboxdz = (max[2] - min[2]) / 255.0;
                var deltas = sourceBuffers.deltas;
                if (this.prevPrevMesh == null) {
                    for (var i = 0; i < count; ++i) {
                        var i0 = 3 * i;
                        var i1 = i0 + 1;
                        var i2 = i0 + 2;
                        var x = this.prevMesh.uncompressedPos[i0];
                        var y = this.prevMesh.uncompressedPos[i1];
                        var z = this.prevMesh.uncompressedPos[i2];
                        var deltaX = deltas[i0] * bboxdx + min[0];
                        var deltaY = deltas[i1] * bboxdy + min[1];
                        var deltaZ = deltas[i2] * bboxdz + min[2];
                        x += deltaX;
                        y += deltaY;
                        z += deltaZ;
                        frame.uncompressedPos[i0] = x;
                        frame.uncompressedPos[i1] = y;
                        frame.uncompressedPos[i2] = z;
                    }
                }
                else {
                    for (var i = 0; i < count; ++i) {
                        var i0 = 3 * i;
                        var i1 = i0 + 1;
                        var i2 = i0 + 2;
                        var x = this.prevMesh.uncompressedPos[i0];
                        var y = this.prevMesh.uncompressedPos[i1];
                        var z = this.prevMesh.uncompressedPos[i2];
                        var dx = x - this.prevPrevMesh.uncompressedPos[i0];
                        var dy = y - this.prevPrevMesh.uncompressedPos[i1];
                        var dz = z - this.prevPrevMesh.uncompressedPos[i2];
                        x += dx;
                        y += dy;
                        z += dz;
                        var deltaX = deltas[i0] * bboxdx + min[0];
                        var deltaY = deltas[i1] * bboxdy + min[1];
                        var deltaZ = deltas[i2] * bboxdz + min[2];
                        x += deltaX;
                        y += deltaY;
                        z += deltaZ;
                        frame.uncompressedPos[i0] = x;
                        frame.uncompressedPos[i1] = y;
                        frame.uncompressedPos[i2] = z;
                    }
                }
                if (updateClientBuffers) {
                    if (wasSeeking) {
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.lastKeyframeIndices, gl.DYNAMIC_DRAW);
                        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
                        gl.bufferData(gl.ARRAY_BUFFER, this.lastKeyframeUVs, gl.DYNAMIC_DRAW);
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, frame.uncompressedPos, gl.DYNAMIC_DRAW);
                }
            }
            if (norBuf && sourceBuffers.compressedNormals && updateClientBuffers) {
                if (this.fileInfo.octEncodedNormals) {
                    const count = sourceBuffers.compressedNormals.length;
                    var uncompressedNormals = new Float32Array(3 * count);
                    var abs = Math.abs;
                    for (var i = 0; i < count; ++i) {
                        let x = sourceBuffers.compressedNormals[2 * i];
                        let y = sourceBuffers.compressedNormals[2 * i + 1];
                        x = -1.0 + x * 0.0078125;
                        y = -1.0 + y * 0.0078125;
                        let z = 1.0 - abs(x) - abs(y);
                        var t = clamp(-z, 0.0, 1.0);
                        x += x >= 0.0 ? -t : t;
                        y += y >= 0.0 ? -t : t;
                        var invLen = 1.0 / Math.sqrt(x * x + y * y + z * z);
                        uncompressedNormals[3 * i] = x * invLen;
                        uncompressedNormals[3 * i + 1] = y * invLen;
                        uncompressedNormals[3 * i + 2] = z * invLen;
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, norBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, uncompressedNormals, gl.DYNAMIC_DRAW);
                }
                else {
                    gl.bindBuffer(gl.ARRAY_BUFFER, norBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, sourceBuffers.compressedNormals, gl.DYNAMIC_DRAW);
                }
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, saveVb);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, saveIb);
            return true;
        }
        _setupMeshFrames() {
            const json = this.json;
            const accessors = json.accessors;
            const numFrames = json.meshes.length;
            const arrayBuffers = this.buffers;
            const hvo = this;
            const ensureBuffers = function () {
                var bufferViews = json.bufferViews;
                var buffers = json.buffers;
                if (this.primitives[0].extensions[_extName].attributes.POSITION) {
                    var indexBufferView = bufferViews[this.indices.bufferView];
                    if (buffers[indexBufferView.buffer].arrayBufferIndex == undefined ||
                        arrayBuffers[buffers[indexBufferView.buffer].arrayBufferIndex].bufferIndex != indexBufferView.buffer) {
                        hvo._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + buffers[indexBufferView.buffer].uri);
                        return false;
                    }
                    var posBufferView = bufferViews[this.compressedPos.bufferView];
                    if (buffers[posBufferView.buffer].arrayBufferIndex == undefined ||
                        arrayBuffers[buffers[posBufferView.buffer].arrayBufferIndex].bufferIndex != posBufferView.buffer) {
                        hvo._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + buffers[posBufferView.buffer].uri);
                        return false;
                    }
                    var uvBufferView = bufferViews[this.compressedUVs.bufferView];
                    if (buffers[uvBufferView.buffer].arrayBufferIndex == undefined ||
                        arrayBuffers[buffers[uvBufferView.buffer].arrayBufferIndex].bufferIndex != uvBufferView.buffer) {
                        hvo._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + buffers[uvBufferView.buffer].uri);
                        return false;
                    }
                }
                else {
                    var deltaBufferView = bufferViews[this.deltas.bufferView];
                    if (buffers[deltaBufferView.buffer].arrayBufferIndex == undefined ||
                        arrayBuffers[buffers[deltaBufferView.buffer].arrayBufferIndex].bufferIndex != deltaBufferView.buffer) {
                        hvo._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + buffers[deltaBufferView.buffer].uri);
                        return false;
                    }
                }
                if (this.compressedNormals) {
                    var norBufferView = bufferViews[this.compressedNormals.bufferView];
                    if (buffers[norBufferView.buffer].arrayBufferIndex == undefined ||
                        arrayBuffers[buffers[norBufferView.buffer].arrayBufferIndex].bufferIndex != norBufferView.buffer) {
                        hvo._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + buffers[norBufferView.buffer].uri);
                        return false;
                    }
                }
                return true;
            };
            for (var i = 0; i < numFrames; ++i) {
                var meshFrame = this.json.meshes[i];
                meshFrame.frameIndex = i;
                meshFrame.ensureBuffers = ensureBuffers;
                var attributes = meshFrame.primitives[0].extensions[_extName].attributes;
                if (attributes.POSITION) {
                    meshFrame.indices = accessors[meshFrame.primitives[0].extensions[_extName].indices];
                    meshFrame.compressedUVs = accessors[attributes.TEXCOORD_0];
                    meshFrame.compressedPos = accessors[attributes.POSITION];
                }
                else {
                    meshFrame.deltas = accessors[attributes._DELTA];
                }
                if (attributes.NORMAL != null) {
                    this.fileInfo.haveNormals = true;
                    meshFrame.compressedNormals = accessors[attributes.NORMAL];
                    if (meshFrame.compressedNormals.type == "VEC2") {
                        this.fileInfo.octEncodedNormals = true;
                    }
                }
                this.meshFrames.push(meshFrame);
            }
        }
        _onJsonLoaded(response) {
            this._logInfo(this.capsStr);
            this._logInfo("got json");
            this.json = JSON.parse(response);
            if (this.openOptions.keepAllMeshesInMemory) {
                this.openOptions.maxBuffers = this.json.buffers.length - 1;
            }
            this.minBuffers = Math.min(this.openOptions.minBuffers, this.json.buffers.length - 1);
            var timeline = this.json.extensions[_extName].timeline;
            this.minVideos = Math.min(2, timeline.length);
            this.buffers = [null, null, null];
            this.videoElement = this.videoElement ?? document.createElement('video');
            this.videoElement.setAttribute('playsinline', 'playsinline');
            this.videoElement.volume = this.audioVolume;
            for (var i = 0; i < Math.min(this.openOptions.maxBuffers, this.json.buffers.length - 1); ++i) {
                this.freeArrayBuffers.push(i);
            }
            if (this.openOptions.startTime) {
                this._setSeekTarget(this.openOptions.startTime);
                this.seekingAutoPlay = true;
                this.pauseAfterSeek = true;
            }
            this._setupMeshFrames();
            this._loadNextVideo();
            if (this.seekTargetTime) {
                let frame = this.meshFrames[this.searchStartFrame];
                const bufferViews = this.json.bufferViews;
                this.seekingStartBufferIndex = bufferViews[frame.indices.bufferView].buffer;
                this._loadNextBuffer();
            }
            else {
                this._loadNextBuffer();
            }
            this.currentBufferIndex = 0;
            var image = this.json.images[1].extensions[_extName];
            this.fileInfo.videoWidth = image.width;
            this.fileInfo.videoHeight = image.height;
            var ext = this.json.extensions[_extName];
            this.fileInfo.maxVertexCount = ext.maxVertexCount;
            this.fileInfo.maxIndexCount = ext.maxIndexCount;
            this.fileInfo.boundingBox = {
                min: ext.boundingMin,
                max: ext.boundingMax,
            };
            if (this.onLoaded) {
                this.onLoaded(this.fileInfo);
            }
            if (this.outputBuffers) {
                var gl = this.gl;
                var saveVb = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
                for (var i = 0; i < 3; ++i) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.outputBuffers[i]);
                    gl.bufferData(gl.ARRAY_BUFFER, 12 * ext.maxVertexCount, gl.STREAM_COPY);
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, saveVb);
            }
        }
        _getChromeVersion() {
            var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
            return raw ? parseInt(raw[2], 10) : false;
        }
        _getIOSVersion() {
            var agent = window.navigator.userAgent;
            if (agent.indexOf('iPhone') > 0 || agent.indexOf('iPad') > 0 || agent.indexOf('iPod') > 0) {
                var raw = agent.match(/OS (\d+)_(\d+)_?(\d+)?/);
                if (raw) {
                    return {
                        major: parseInt(raw[1] || '0', 10),
                        minor: parseInt(raw[2] || '0', 10),
                        patch: parseInt(raw[3] || '0', 10)
                    };
                }
            }
            return false;
        }
        _getSafariVersion() {
            var agent = window.navigator.userAgent;
            var raw = agent.match(/Version\/(\d+).(\d+).?(\d+)?/);
            if (raw) {
                return {
                    major: parseInt(raw[1] || '0', 10),
                    minor: parseInt(raw[2] || '0', 10),
                    patch: parseInt(raw[3] || '0', 10)
                };
            }
            return false;
        }
        _logDebug(message, force) {
            if (this.logLevel >= 3) {
                var id = this.id;
                console.log(`[${id}] ` + message);
            }
        }
        _logInfo(message, force) {
            if (this.logLevel >= 2 || force) {
                var id = this.id;
                console.log(`[${id}] ` + message);
            }
        }
        _logWarning(message) {
            if (this.logLevel >= 1) {
                var id = this.id;
                console.log(`[${id}] ` + message);
            }
        }
        _logError(message) {
            if (this.logLevel >= 0) {
                var id = this.id;
                console.log(`[${id}] ` + message);
            }
        }
        _onError(type, info) {
            if (this.errorCallback) {
                this.errorCallback(type, info);
            }
        }
        _initializeWebGLResources(gl) {
            var caps = {};
            var version = gl.getParameter(gl.VERSION);
            caps.webgl2 = version.indexOf("WebGL 2.") != -1;
            caps.badTF = false;
            this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            this.safariVersion = this._getSafariVersion();
            this.iOSVersion = this._getIOSVersion();
            this.isMozillaWebXRViewer = this.iOSVersion && navigator.userAgent.includes("WebXRViewer");
            if (navigator.userAgent.includes('Mobile') &&
                navigator.platform != "iPhone" &&
                navigator.platform != "iPad" &&
                navigator.platform != "iPod") {
                this.isSafari = false;
            }
            if (this.isSafari || this.isMozillaWebXRViewer) {
                caps.webgl2 = false;
            }
            var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                caps.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                caps.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                caps.isSafari = this.isSafari;
                caps.iOSVersion = this.iOSVersion;
                if (caps.renderer.indexOf("Mali") != -1) {
                    caps.badTF = true;
                }
            }
            this.capsStr = JSON.stringify(caps, null, 4);
            this.caps = caps;
            this.fbo1 = gl.createFramebuffer();
            if (this.caps.webgl2) {
                this.caps.supports32BitIndices = true;
                if (!this.caps.badTF) {
                    this._setupTransformFeedback();
                }
                if (this.createOptions.disableAsyncDecode) {
                    this.textures = [null];
                }
                else {
                    this.fbo2 = gl.createFramebuffer();
                    this.textures = new Array(this.createOptions.numAsyncFrames);
                    this.pixelBuffers = new Array(this.createOptions.numAsyncFrames);
                    this.readFences = new Array(this.createOptions.numAsyncFrames);
                    this.nextPbo = 0;
                }
            }
            else {
                this.caps.supports32BitIndices = gl.getExtension("OES_element_index_uint") != null;
                if (!this.caps.supports32BitIndices) {
                    this._logWarning("WebGL1: extension 'OES_element_index_uint' not supported, captures w/32-bit index data will not be playable");
                }
                this.textures = [null];
                this.fbo2 = gl.createFramebuffer();
            }
            const psSource = `#version 100
        precision highp float;

        uniform lowp sampler2D textureSampler;
        uniform bool useGammaCorrection;

        vec3 toLinear(vec3 color) { return pow(color, vec3(2.2)); }

        varying mediump vec2 uv;
        void main()
        {
            vec3 color = texture2D(textureSampler, uv).xyz;

            vec3 adjustedColor = useGammaCorrection
                ? toLinear(color)
                : color;

            gl_FragColor = vec4(adjustedColor, 1.0);
        }
        `;
            const vsSource = `#version 100
        attribute mediump vec2 pos;
        varying mediump vec2 uv;
        void main()
        {
            uv = (0.5 * pos + vec2(0.5, 0.5));
            gl_Position = vec4(pos, 0.0, 1.0);
        }
        `;
            const texCopyVertexAttribLoc = 0;
            const prelink = (program) => {
                gl.bindAttribLocation(program, texCopyVertexAttribLoc, 'pos');
            };
            const texCopyShader = this._createProgram(gl, vsSource, psSource, prelink);
            texCopyShader.useGammaCorrectionLoc = gl.getUniformLocation(texCopyShader, 'useGammaCorrection');
            texCopyShader.vertexAttribLoc = texCopyVertexAttribLoc;
            texCopyShader.textureSamplerLoc = gl.getUniformLocation(texCopyShader, 'textureSampler');
            this.texCopyShader = texCopyShader;
            this.texCopyShader.vertexAttribLoc = texCopyVertexAttribLoc;
            this.texCopyVerts = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCopyVerts);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, 3.0, 3.0, -1.0, -1.0, -1.0]), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            var saveTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
            for (var i = 0; i < this.textures.length; ++i) {
                this.textures[i] = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.bindTexture(gl.TEXTURE_2D, saveTex);
        }
        _releaseWebGLResources(gl) {
            if (this.caps.webgl2 && !this.caps.badTF) {
                gl.deleteBuffer(this.deltasBuf);
                for (var i = 0; i < 3; ++i) {
                    gl.deleteBuffer(this.outputBuffers[i]);
                    this.outputBuffers[i] = null;
                    gl.deleteTransformFeedback(this.transformFeedbacks[i]);
                    this.transformFeedbacks[i] = null;
                    gl.deleteVertexArray(this.vaos[i]);
                    this.vaos[i] = null;
                }
                gl.deleteTransformFeedback(this.normalsTF);
                this.normalsTF = null;
                gl.deleteVertexArray(this.normalsVao);
                this.normalsVao = null;
                gl.deleteProgram(this.tfShader);
                this.tfShader = null;
                gl.deleteProgram(this.octNormalsShader);
                this.octNormalsShader = null;
            }
            if (this.texCopyShader) {
                gl.deleteProgram(this.texCopyShader);
                this.texCopyShader = null;
            }
            if (this.texCopyVerts) {
                gl.deleteBuffer(this.texCopyVerts);
                this.texCopyVerts = null;
            }
            if (this.pixelBuffers) {
                for (var i = 0; i < this.pixelBuffers.length; ++i) {
                    gl.deleteBuffer(this.pixelBuffers[i]);
                    this.pixelBuffers[i] = null;
                }
            }
            if (this.readFences) {
                for (var i = 0; i < this.readFences.length; ++i) {
                    gl.deleteSync(this.readFences[i]);
                    this.readFences[i] = null;
                }
            }
            this.nextPbo = 0;
            for (var i = 0; i < this.textures.length; ++i) {
                gl.deleteTexture(this.textures[i]);
            }
            if (this.fbo1) {
                gl.deleteFramebuffer(this.fbo1);
                this.fbo1 = null;
            }
            if (this.fbo2) {
                gl.deleteFramebuffer(this.fbo2);
                this.fbo2 = null;
            }
        }
        constructor(gl, createOptions, errorCallback) {
            this.id = HoloVideoObject._instanceCounter++;
            this.state = exports.States.Empty;
            this.suspended = false;
            this.gl = gl;
            this.errorCallback = errorCallback;
            if (createOptions) {
                this.createOptions = createOptions;
                if (createOptions.numAsyncFrames < 2) {
                    this._logWarning("numAsyncFrames must be at least 2 (" + createOptions.numAsyncFrames + " specified)");
                    this.createOptions.numAsyncFrames = 2;
                }
            }
            else {
                this.createOptions = {};
            }
            if (!this.createOptions.numAsyncFrames) {
                this.createOptions.numAsyncFrames = 3;
            }
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    if (this.state == exports.States.Playing) {
                        this.wasPlaying = true;
                        this._logInfo("document hidden -> pausing playback");
                        this.pause();
                    }
                    else {
                        this.wasPlaying = false;
                    }
                }
                else if (this.wasPlaying) {
                    this.wasPlaying = false;
                    this._logInfo("document visible -> resuming playback");
                    this.play();
                }
            }.bind(this));
            var canvas = gl.canvas;
            canvas.addEventListener("webglcontextlost", function (event) {
                this.contextLost = true;
                this.wasPlaying = this.state == exports.States.Playing;
                this.pause();
                this._logInfo("webglcontextlost -> pausing playback");
                this._releaseWebGLResources(gl);
            }.bind(this), false);
            canvas.addEventListener("webglcontextrestored", function (event) {
                this._initializeWebGLResources(this.gl);
                if (this.json && this.outputBuffers) {
                    var ext = this.json.extensions[_extName];
                    var gl = this.gl;
                    var saveVb = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
                    for (var i = 0; i < 3; ++i) {
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.outputBuffers[i]);
                        gl.bufferData(gl.ARRAY_BUFFER, 12 * ext.maxVertexCount, gl.STREAM_COPY);
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, saveVb);
                }
                this.contextLost = false;
                if (this.wasPlaying) {
                    this.wasPlaying = false;
                    this._logInfo("webglcontextrestored -> resuming playback");
                    this.play();
                }
            }.bind(this), false);
            console.log("HoloVideoObject version " + HoloVideoObject.Version.String);
            this._initializeWebGLResources(gl);
        }
        getLoadProgress() {
            if (this.minBuffers == undefined) {
                return 0;
            }
            if (this.state >= exports.States.Opened) {
                return 1.0;
            }
            return (this.buffersLoaded + this.videosLoaded) / (this.minBuffers + this.minVideos);
        }
        setBuffers(posBuf, indexBuf, uvBuf, norBuf, tex) {
            const clientBuffers = {
                posBuf,
                indexBuf,
                uvBuf,
                norBuf,
                tex,
            };
            this.clientBuffers = clientBuffers;
        }
        updateToLastKeyframe() {
            if (this.lastKeyframe != -1) {
                this.frameIndex = this.lastKeyframe - 1;
                this.curMesh = null;
                this.prevMesh = null;
                this.prevPrevMesh = null;
            }
        }
        getSrgbTextureFormat() {
            const { gl, caps } = this;
            if (caps.webgl2) {
                return {
                    internal: gl.SRGB8_ALPHA8,
                    external: gl.RGBA,
                };
            }
            const extension = gl.getExtension('EXT_sRGB');
            return {
                internal: extension.SRGB_EXT,
                external: extension.SRGB_EXT,
            };
        }
        _loadFallbackFrame() {
            if (this.json && this.fallbackFrameBuffer) {
                if (!this.fallbackTextureImage) {
                    this.fallbackTextureImage = new Image();
                    var encode = function (input) {
                        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                        var output = "";
                        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                        var i = 0;
                        while (i < input.length) {
                            chr1 = input[i++];
                            chr2 = i < input.length ? input[i++] : Number.NaN;
                            chr3 = i < input.length ? input[i++] : Number.NaN;
                            enc1 = chr1 >> 2;
                            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                            enc4 = chr3 & 63;
                            if (isNaN(chr2)) {
                                enc3 = enc4 = 64;
                            }
                            else if (isNaN(chr3)) {
                                enc4 = 64;
                            }
                            output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                                keyStr.charAt(enc3) + keyStr.charAt(enc4);
                        }
                        return output;
                    };
                    var fallbackImage = this.json.images[0];
                    var bufferView = this.json.bufferViews[fallbackImage.bufferView];
                    this.fallbackTextureImage.src = 'data:image/jpeg;base64,' + encode(new Uint8Array(this.fallbackFrameBuffer, bufferView.byteOffset, bufferView.byteLength));
                    this.fallbackTextureImage.onload = function () {
                        this._logInfo("fallback image loaded");
                        this.fallbackTextureImage.loaded = true;
                    }.bind(this);
                }
                if (this.fallbackTextureImage &&
                    this.fallbackTextureImage.loaded &&
                    !this.filledFallbackFrame &&
                    this.clientBuffers &&
                    this.clientBuffers.posBuf) {
                    var gl = this.gl;
                    var fallbackPrim = this.json.meshes[0].primitives[0];
                    var saveVb = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
                    var saveIb = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
                    var posAccesor = this.json.accessors[fallbackPrim.attributes.POSITION];
                    var posBufferView = this.json.bufferViews[posAccesor.bufferView];
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.clientBuffers.posBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.fallbackFrameBuffer, posBufferView.byteOffset + posAccesor.byteOffset, posAccesor.count * 3), gl.STATIC_DRAW);
                    if (this.clientBuffers.norBuf && this.fileInfo.haveNormals) {
                        var norAccesor = this.json.accessors[fallbackPrim.attributes.NORMAL];
                        var norBufferView = this.json.bufferViews[norAccesor.bufferView];
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.clientBuffers.norBuf);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.fallbackFrameBuffer, norBufferView.byteOffset + norAccesor.byteOffset, norAccesor.count * 3), gl.STATIC_DRAW);
                    }
                    var uvAccesor = this.json.accessors[fallbackPrim.attributes.TEXCOORD_0];
                    var uvBufferView = this.json.bufferViews[uvAccesor.bufferView];
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.clientBuffers.uvBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(this.fallbackFrameBuffer, uvBufferView.byteOffset + uvAccesor.byteOffset, uvAccesor.count * 2), gl.STATIC_DRAW);
                    var indexAccessor = this.json.accessors[fallbackPrim.indices];
                    var indexBufferView = this.json.bufferViews[indexAccessor.bufferView];
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.clientBuffers.indexBuf);
                    if (indexAccessor.componentType == gl.UNSIGNED_SHORT) {
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fallbackFrameBuffer, indexBufferView.byteOffset + indexAccessor.byteOffset, indexAccessor.count), gl.STATIC_DRAW);
                    }
                    else {
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fallbackFrameBuffer, indexBufferView.byteOffset + indexAccessor.byteOffset, indexAccessor.count), gl.STATIC_DRAW);
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, saveVb);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, saveIb);
                    gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                    var saveTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
                    gl.bindTexture(gl.TEXTURE_2D, this.clientBuffers.tex);
                    const useGammaCorrection = !!this.createOptions.outputLinearTextures;
                    const srgbFormat = this.getSrgbTextureFormat();
                    const defaultFormat = { internal: gl.RGBA, external: gl.RGBA };
                    const format = useGammaCorrection ? srgbFormat : defaultFormat;
                    gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, format.external, gl.UNSIGNED_BYTE, this.fallbackTextureImage);
                    gl.bindTexture(gl.TEXTURE_2D, saveTex);
                    this.currentFrameInfo.primCount = indexAccessor.count;
                    posAccesor = this.json.accessors[fallbackPrim.extensions[_extName].attributes.POSITION];
                    var min = posAccesor.extensions[_extName].decodeMin;
                    var max = posAccesor.extensions[_extName].decodeMax;
                    this.currentFrameInfo.bboxMin = min;
                    this.currentFrameInfo.bboxMax = max;
                    this.filledFallbackFrame = true;
                }
                return this.filledFallbackFrame;
            }
        }
        copyTexture(source, destination, width, height, useGammaCorrection) {
            const { gl, texCopyShader } = this;
            const saveVb = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
            const saveShader = gl.getParameter(gl.CURRENT_PROGRAM);
            const saveViewport = gl.getParameter(gl.VIEWPORT);
            const saveScissor = gl.isEnabled(gl.SCISSOR_TEST);
            const saveCulling = gl.isEnabled(gl.CULL_FACE);
            const saveBlend = gl.isEnabled(gl.BLEND);
            const saveActiveTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
            const saveVertexAttribBufferBiding = gl.getVertexAttrib(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
            const saveVertexAttribEnabled = gl.getVertexAttrib(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
            const saveVertexAttribArraySize = gl.getVertexAttrib(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_SIZE);
            const saveVertexAttribArrayType = gl.getVertexAttrib(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_TYPE);
            const saveVertexAttribNormalized = gl.getVertexAttrib(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED);
            const saveVertexAttribArrayStride = gl.getVertexAttrib(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_STRIDE);
            const saveVertexAttribOffset = gl.getVertexAttribOffset(texCopyShader.vertexAttribLoc, gl.VERTEX_ATTRIB_ARRAY_POINTER);
            gl.activeTexture(gl.TEXTURE0);
            if (useGammaCorrection) {
                gl.bindTexture(gl.TEXTURE_2D, destination);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo2);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, destination, 0);
            gl.viewport(0, 0, width, height);
            gl.disable(gl.SCISSOR_TEST);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindTexture(gl.TEXTURE_2D, source);
            gl.useProgram(texCopyShader);
            gl.uniform1i(texCopyShader.textureSamplerLoc, 0);
            gl.uniform1i(texCopyShader.useGammaCorrectionLoc, Number(useGammaCorrection));
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCopyVerts);
            gl.enableVertexAttribArray(texCopyShader.vertexAttribLoc);
            gl.vertexAttribPointer(texCopyShader.vertexAttribLoc, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.useProgram(saveShader);
            gl.bindBuffer(gl.ARRAY_BUFFER, saveVertexAttribBufferBiding);
            gl.vertexAttribPointer(texCopyShader.vertexAttribLoc, saveVertexAttribArraySize, saveVertexAttribArrayType, saveVertexAttribNormalized, saveVertexAttribArrayStride, saveVertexAttribOffset);
            if (saveVertexAttribEnabled) {
                gl.enableVertexAttribArray(texCopyShader.vertexAttribLoc);
            }
            else {
                gl.disableVertexAttribArray(texCopyShader.vertexAttribLoc);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, saveVb);
            gl.viewport(saveViewport[0], saveViewport[1], saveViewport[2], saveViewport[3]);
            if (saveScissor) {
                gl.enable(gl.SCISSOR_TEST);
            }
            if (saveBlend) {
                gl.enable(gl.BLEND);
            }
            if (saveCulling) {
                gl.enable(gl.CULL_FACE);
            }
            gl.activeTexture(saveActiveTexture);
        }
        updateBuffers() {
            if (this.contextLost) {
                return false;
            }
            if (!this.filledFallbackFrame && !this.seekTargetTime) {
                return this._loadFallbackFrame();
            }
            if (!this.json) {
                return false;
            }
            const timeline = this.json.extensions[_extName].timeline;
            const image = this.json.images[timeline[0].image];
            const currentVideo = image.video;
            let forceEndOfStream = false;
            if (currentVideo && currentVideo.playing && !this.suspended) {
                var now = window.performance.now();
                var videoNow = currentVideo.currentTime * 1000;
                if (now - this.lastUpdate < 20.0) {
                    return false;
                }
                this.lastVideoTime = videoNow;
                this.lastUpdate = now;
                const gl = this.gl;
                if (!this.watermarkPixels) {
                    this.watermarkPixels = new Uint8Array(image.extensions[_extName].width * 4);
                }
                var videoSampleIndex = -1;
                const saveFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
                const saveTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
                const useAsyncDecode = this.caps.webgl2 && !this.createOptions.disableAsyncDecode;
                if (useAsyncDecode) {
                    const savePbo = gl.getParameter(gl.PIXEL_PACK_BUFFER_BINDING);
                    let error = gl.getError();
                    if (error != gl.NO_ERROR) {
                        this._logWarning("HoloVideoObject.updateBuffers discarding prior webgl error: " + error);
                    }
                    var readPbo = (this.nextPbo + 1) % this.pixelBuffers.length;
                    if (this.readFences[readPbo] != null) {
                        gl.getSyncParameter(this.readFences[readPbo], gl.SYNC_STATUS);
                        gl.deleteSync(this.readFences[readPbo]);
                        this.readFences[readPbo] = null;
                        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.pixelBuffers[readPbo]);
                        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this.watermarkPixels, 0, this.watermarkPixels.byteLength);
                        var blockSize = image.extensions[_extName].blockSize * 4;
                        videoSampleIndex = 0;
                        for (var i = 0; i < 16; ++i) {
                            if (this.watermarkPixels[blockSize * i + 0] > 128 || this.watermarkPixels[blockSize * i + 4] > 128) {
                                videoSampleIndex += 1 << i;
                            }
                        }
                    }
                    if (!this.pixelBuffers[this.nextPbo]) {
                        this.pixelBuffers[this.nextPbo] = gl.createBuffer();
                        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.pixelBuffers[this.nextPbo]);
                        gl.bufferData(gl.PIXEL_PACK_BUFFER, this.watermarkPixels.byteLength, gl.DYNAMIC_READ);
                    }
                    gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.nextPbo]);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currentVideo);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo1);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[this.nextPbo], 0);
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.pixelBuffers[this.nextPbo]);
                    gl.readPixels(0, 0, this.watermarkPixels.byteLength / 4, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    if (gl.getError() == gl.NO_ERROR) {
                        this.readFences[this.nextPbo] = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
                        this.nextPbo = (this.nextPbo + 1) % this.pixelBuffers.length;
                    }
                    else {
                        this._logWarning("webgl error: " + error + " skipping video texture read");
                    }
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, savePbo);
                }
                else {
                    gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currentVideo);
                    var error = gl.getError();
                    if (error == gl.NO_ERROR) {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo1);
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[0], 0);
                        gl.readPixels(0, 0, this.watermarkPixels.byteLength / 4, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.watermarkPixels);
                        var blockSize = image.extensions[_extName].blockSize * 4;
                        videoSampleIndex = 0;
                        for (var i = 0; i < 16; ++i) {
                            if (this.watermarkPixels[blockSize * i + 0] > 128 || this.watermarkPixels[blockSize * i + 4] > 128) {
                                videoSampleIndex += 1 << i;
                            }
                        }
                        var allBlack = true;
                        if (videoSampleIndex == 0 && videoSampleIndex < this.lastVideoSampleIndex) {
                            for (var i = 0; i < this.watermarkPixels.byteLength; ++i) {
                                if (this.watermarkPixels[i] != 0) {
                                    allBlack = false;
                                    break;
                                }
                            }
                            if (allBlack) {
                                this._logWarning("dropping empty/black video frame");
                                this.currentFrameInfo.primCount = 0;
                                return true;
                            }
                        }
                    }
                    else {
                        this._logWarning("webgl error: " + error + " skipping video texture read");
                    }
                }
                if (videoSampleIndex > -1 && videoSampleIndex != this.oldVideoSampleIndex) {
                    let readMesh = true;
                    if (this.seeking && this.requestKeyframe) {
                        if (this._frameIsKeyframe(videoSampleIndex)) {
                            this.requestKeyframe = false;
                            this.frameIndex = videoSampleIndex - 1;
                            this._logDebug("seeking found keyframe -> " + videoSampleIndex);
                        }
                        else {
                            this._logDebug("seeking wait for keyframe -> " + videoSampleIndex);
                            readMesh = false;
                        }
                    }
                    if (readMesh && (this.curMesh == null || this.curMesh.frameIndex != videoSampleIndex)) {
                        let wasSeeking = this.seeking;
                        if (this.seeking) {
                            const ext = this.json.extensions[_extName];
                            let frameTimestamp = videoSampleIndex / ext.framerate;
                            if (frameTimestamp < this.seekTargetTime) ;
                            else {
                                this.seeking = false;
                                this._logDebug("seeking finished at frame " + videoSampleIndex);
                                if (this.unmuteAfterSeek) {
                                    currentVideo.muted = false;
                                }
                            }
                        }
                        if (!this.seeking && this.pauseAfterSeek && !this.seekingAutoPlay) {
                            this.pause();
                            currentVideo.playing = false;
                            delete this.pauseAfterSeek;
                        }
                        const updateClientBuffers = !this.seeking;
                        if (this.meshFrames[videoSampleIndex].ensureBuffers()) {
                            if (videoSampleIndex < this.lastVideoSampleIndex) {
                                this.frameIndex = -1;
                                this._updateMesh(this.clientBuffers.posBuf, this.clientBuffers.uvBuf, this.clientBuffers.indexBuf, this.clientBuffers.norBuf, updateClientBuffers, wasSeeking);
                                this._logInfo("loop detected, videoSampleIndex = " + videoSampleIndex + ", curMesh.frameIndex = " + this.curMesh.frameIndex);
                            }
                            while (this.curMesh == null || this.curMesh.frameIndex < videoSampleIndex) {
                                if (!this._updateMesh(this.clientBuffers.posBuf, this.clientBuffers.uvBuf, this.clientBuffers.indexBuf, this.clientBuffers.norBuf, updateClientBuffers, wasSeeking)) {
                                    break;
                                }
                            }
                            this._logDebug("updated to frame index = " + videoSampleIndex);
                            if (this.curMesh.frameIndex == videoSampleIndex && updateClientBuffers) {
                                const { videoWidth, videoHeight } = currentVideo;
                                const useGammaCorrection = !!this.createOptions.outputLinearTextures;
                                const textureSource = useAsyncDecode
                                    ? this.textures[readPbo]
                                    : this.textures[0];
                                this.copyTexture(textureSource, this.clientBuffers.tex, videoWidth, videoHeight, useGammaCorrection);
                            }
                            if (this.curMesh && this.curMesh.frameIndex != videoSampleIndex) {
                                this._logInfo("texture (" + videoSampleIndex + ") <-> mesh (" + this.curMesh.frameIndex + ") mismatch");
                            }
                            this.lastVideoSampleIndex = videoSampleIndex;
                        }
                        else {
                            this._logWarning("ran out of mesh data, suspending video " + currentVideo.mp4Name);
                            currentVideo.pause();
                            this.suspended = true;
                            this.needMeshData = true;
                            if (!this.pendingBufferDownload) {
                                this._loadNextBuffer();
                            }
                        }
                    }
                    else {
                        if (this.pendingVideoEndEvent && this.state == exports.States.Playing) {
                            this.pendingVideoEndEventWaitCount++;
                            forceEndOfStream = this.pendingVideoEndEventWaitCount > 3;
                        }
                    }
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, saveFbo);
                gl.bindTexture(gl.TEXTURE_2D, saveTex);
            }
            if (this.pendingVideoEndEvent && (this.lastVideoSampleIndex == this.meshFrames.length - 1 || forceEndOfStream)) {
                currentVideo.playing = false;
                this._onVideoEnded(currentVideo);
                this.pendingVideoEndEvent = false;
            }
            if (this.curMesh && !this.seeking) {
                this.currentFrameInfo.primCount = this.curMesh.indexCount;
                this.currentFrameInfo.frameIndex = this.curMesh.frameIndex;
                if (this.onUpdateCurrentFrame) {
                    this.onUpdateCurrentFrame(this.curMesh.frameIndex);
                }
                return true;
            }
            return false;
        }
        close() {
            if (this.httpRequest) {
                this.httpRequest.abort();
                this.httpRequest = null;
            }
            if (this.dashPlayer) {
                this.dashPlayer.reset();
            }
            this.cleanUpEventListeners?.();
            this.videoElement.pause();
            this.videoElement.removeAttribute('src');
            this.videoElement.remove();
            this.state = exports.States.Closed;
        }
        pause() {
            if (this.videoElement) {
                this.videoElement.pause();
                this.state = exports.States.Paused;
            }
        }
        setAudioVolume(volume) {
            this.audioVolume = volume;
            this.videoElement.volume = volume;
        }
        setAutoLooping(loop) {
            this.openOptions.autoloop = loop;
            this.videoElement.loop = loop;
        }
        setAudioEnabled(enabled) {
            this.videoElement.muted = !enabled;
        }
        audioEnabled() {
            return !this.videoElement.muted;
        }
        play() {
            if (this.isSafari) {
                this.videoElement.pause();
            }
            const playPromise = this.videoElement.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => { this.state = exports.States.Playing; })
                    .catch((error) => {
                    this._logWarning(`play prevented ${error}`);
                    this._onError(ErrorStates.PlaybackPrevented, error);
                });
            }
        }
        open(gltfURL, options) {
            if (this.state >= exports.States.Opening) {
                this.close();
            }
            this.state = exports.States.Opening;
            this.urlRoot = gltfURL.substring(0, gltfURL.lastIndexOf("/") + 1);
            this.meshFrames = [];
            this.buffersLoaded = 0;
            this.videosLoaded = 0;
            this.freeArrayBuffers = [];
            this.buffers = [];
            this.nextVideoLoadIndex = 0;
            this.nextBufferLoadIndex = 0;
            this.videoState = VideoStates.Undefined;
            this.currentFrameInfo = {
                primCount: 0
            };
            this.currentBufferIndex = -1;
            this.lastVideoTime = 0;
            this.lastUpdate = 0;
            this.json = null;
            this.fileInfo = {
                haveNormals: false,
                octEncodedNormals: false,
            };
            if (options) {
                this.openOptions = options;
            }
            else {
                this.openOptions = {};
            }
            if (!this.openOptions.minBuffers) {
                this.openOptions.minBuffers = 2;
            }
            if (!this.openOptions.maxBuffers) {
                this.openOptions.maxBuffers = 3;
            }
            if (this.readFences) {
                for (var i = 0; i < this.readFences.length; ++i) {
                    if (this.readFences[i]) {
                        this.gl.deleteSync(this.readFences[i]);
                        this.readFences[i] = null;
                    }
                }
            }
            this.nextPbo = 0;
            this.curMesh = null;
            this.prevMesh = null;
            this.prevPrevMesh = null;
            this.frameIndex = -1;
            this.lastKeyframe = -1;
            this.lastKeyframeIndices = null;
            this.lastKeyframeUVs = null;
            this.lastVideoSampleIndex = -1;
            this.filledFallbackFrame = false;
            this.fallbackFrameBuffer = null;
            this.fallbackTextureImage = null;
            this.eos = false;
            delete this.seekTargetTime;
            delete this.searchStartFrame;
            this._loadJSON(gltfURL, this._onJsonLoaded.bind(this));
        }
    }

    class HoloVideoObjectThreeJS {
        onEndOfStream;
        hvo;
        renderer;
        state;
        mesh;
        bufferGeometry;
        fileInfo;
        _hvoOnEndOfStream(hvo) {
            if (this.onEndOfStream) {
                this.onEndOfStream(this);
            }
        }
        constructor(renderer, callback, createOptions, updateCurrentFrameCallback, errorCallback) {
            const useGammaCorrection = renderer.outputEncoding === Three__namespace.sRGBEncoding;
            const adjustedCreateOptions = {
                outputLinearTextures: useGammaCorrection,
                ...createOptions,
            };
            const hvo = new HoloVideoObject(renderer.getContext(), adjustedCreateOptions, errorCallback);
            this.hvo = hvo;
            this.renderer = renderer;
            hvo.onEndOfStream = this._hvoOnEndOfStream.bind(this);
            hvo.onUpdateCurrentFrame = updateCurrentFrameCallback;
            hvo.onLoaded = (fileInfo) => {
                this.fileInfo = fileInfo;
                var useNormals = fileInfo.haveNormals;
                var unlitMaterial = new Three__namespace.MeshBasicMaterial({ map: null, transparent: false, side: Three__namespace.DoubleSide });
                var litMaterial = new Three__namespace.MeshPhysicalMaterial({ map: null, transparent: false, side: Three__namespace.FrontSide, roughness: 1, metalness: 0 });
                var indexType = this.hvo.meshFrames[0].indices.componentType;
                var gl = renderer.getContext();
                if (this.mesh) {
                    var indexAt = this.mesh.geometry.getIndex();
                    var normalAt = this.mesh.geometry.getAttribute('normal');
                    var haveNormals = normalAt != undefined;
                    if (indexAt.type != indexType || haveNormals != useNormals) {
                        this.mesh = null;
                    }
                    else {
                        var material = useNormals ? litMaterial : unlitMaterial;
                        material.map = this.mesh.material.map;
                        this.mesh.material = material;
                    }
                }
                if (!this.mesh) {
                    var bufferGeometry = new Three__namespace.BufferGeometry();
                    bufferGeometry.boundingSphere = new Three__namespace.Sphere();
                    bufferGeometry.boundingSphere.set(new Three__namespace.Vector3(), Infinity);
                    bufferGeometry.boundingBox = new Three__namespace.Box3();
                    bufferGeometry.boundingBox.set(new Three__namespace.Vector3(-Infinity, -Infinity, -Infinity), new Three__namespace.Vector3(+Infinity, +Infinity, +Infinity));
                    var posBuf = gl.createBuffer();
                    const revision = Number(Three__namespace.REVISION);
                    var posAttr = revision >= 120
                        ? new Three__namespace.GLBufferAttribute(posBuf, gl.FLOAT, 3, 0)
                        : new Three__namespace.GLBufferAttribute(gl, posBuf, gl.FLOAT, 3, 0);
                    bufferGeometry.setAttribute('position', posAttr);
                    var norBuf = null;
                    if (useNormals) {
                        norBuf = gl.createBuffer();
                        var norAttr = revision >= 120
                            ? new Three__namespace.GLBufferAttribute(norBuf, gl.FLOAT, 3, 0)
                            : new Three__namespace.GLBufferAttribute(gl, norBuf, gl.FLOAT, 3, 0);
                        bufferGeometry.setAttribute('normal', norAttr);
                    }
                    var uvBuf = gl.createBuffer();
                    var uvAttr = revision >= 120
                        ? new Three__namespace.GLBufferAttribute(uvBuf, gl.UNSIGNED_SHORT, 2, 0)
                        : new Three__namespace.GLBufferAttribute(gl, uvBuf, gl.UNSIGNED_SHORT, 2, 0);
                    uvAttr.normalized = true;
                    bufferGeometry.setAttribute('uv', uvAttr);
                    var indexBuf = gl.createBuffer();
                    var indAttr = revision >= 120
                        ? new Three__namespace.GLBufferAttribute(indexBuf, indexType, 0, 0)
                        : new Three__namespace.GLBufferAttribute(gl, indexBuf, indexType, 0, 0);
                    bufferGeometry.setIndex(indAttr);
                    var texture = new Three__namespace.Texture();
                    var texProps = renderer.properties.get(texture);
                    texProps.__webglTexture = gl.createTexture();
                    var saveTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
                    gl.bindTexture(gl.TEXTURE_2D, texProps.__webglTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fileInfo.videoWidth, fileInfo.videoHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.bindTexture(gl.TEXTURE_2D, saveTex);
                    var material = useNormals ? litMaterial : unlitMaterial;
                    material.map = texture;
                    var mesh = new Three__namespace.Mesh(bufferGeometry, material);
                    mesh.scale.x = 0.001;
                    mesh.scale.y = 0.001;
                    mesh.scale.z = 0.001;
                    hvo.setBuffers(posBuf, indexBuf, uvBuf, norBuf, texProps.__webglTexture);
                    this.mesh = mesh;
                    this.bufferGeometry = bufferGeometry;
                }
                this.state = this.hvo.state;
                callback(this.mesh);
            };
            var gl = renderer.getContext();
            var canvas = gl.canvas;
            canvas.addEventListener("webglcontextlost", function (event) {
                if (this.mesh) {
                    var texid = this.mesh.material.map.__webglTexture;
                    gl.deleteTexture(texid);
                }
            }.bind(this), false);
            canvas.addEventListener("webglcontextrestored", function (event) {
                if (this.mesh) {
                    var bufferGeometry = this.mesh.geometry;
                    var posBuf = null;
                    var norBuf = null;
                    var uvBuf = null;
                    var indexBuf = null;
                    posBuf = gl.createBuffer();
                    const revision = Number(Three__namespace.REVISION);
                    var posAt = revision >= 120
                        ? new Three__namespace.GLBufferAttribute(posBuf, gl.FLOAT, 3, 0)
                        : new Three__namespace.GLBufferAttribute(gl, posBuf, gl.FLOAT, 3, 0);
                    bufferGeometry.setAttribute('position', posAt);
                    var norAt = bufferGeometry.attributes['normal'];
                    if (norAt) {
                        norBuf = gl.createBuffer();
                        norAt = revision >= 120
                            ? new Three__namespace.GLBufferAttribute(norBuf, gl.FLOAT, 3, 0)
                            : new Three__namespace.GLBufferAttribute(gl, norBuf, gl.FLOAT, 3, 0);
                        bufferGeometry.setAttribute('normal', norAt);
                    }
                    uvBuf = gl.createBuffer();
                    var uvAt = revision >= 120
                        ? new Three__namespace.GLBufferAttribute(uvBuf, gl.UNSIGNED_SHORT, 2, 0)
                        : new Three__namespace.GLBufferAttribute(gl, uvBuf, gl.UNSIGNED_SHORT, 2, 0);
                    uvAt.normalized = true;
                    bufferGeometry.setAttribute('uv', uvAt);
                    var indexType = this.hvo.meshFrames[0].indices.componentType;
                    indexBuf = gl.createBuffer();
                    var indAt = revision >= 120
                        ? new Three__namespace.GLBufferAttribute(indexBuf, indexType, 0, 0)
                        : new Three__namespace.GLBufferAttribute(gl, indexBuf, indexType, 0, 0);
                    bufferGeometry.setIndex(indAt);
                    var texture = new Three__namespace.Texture();
                    texture.encoding = Three__namespace.sRGBEncoding;
                    var texProps = renderer.properties.get(texture);
                    texProps.__webglTexture = gl.createTexture();
                    var saveTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
                    gl.bindTexture(gl.TEXTURE_2D, texProps.__webglTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.fileInfo.videoWidth, this.fileInfo.videoHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.bindTexture(gl.TEXTURE_2D, saveTex);
                    this.mesh.material.map = texture;
                    this.mesh.material.needsUpdate = true;
                    this.hvo.setBuffers(posBuf, indexBuf, uvBuf, norBuf, texProps.__webglTexture);
                    this.hvo.updateToLastKeyframe();
                    this.bufferGeometry.index.count = 0;
                }
            }.bind(this), false);
        }
        open(url, options) {
            if (this.state > exports.States.Empty) {
                this.close();
            }
            this.hvo.open(url, options);
            this.state = this.hvo.state;
        }
        update() {
            if (this.hvo && this.mesh) {
                this.state = this.hvo.state;
            }
            if (this.hvo.updateBuffers()) {
                var min = this.hvo.currentFrameInfo.bboxMin;
                var max = this.hvo.currentFrameInfo.bboxMax;
                var bufferGeometry = this.bufferGeometry;
                bufferGeometry.boundingBox.min.x = min[0];
                bufferGeometry.boundingBox.min.y = min[1];
                bufferGeometry.boundingBox.min.z = min[2];
                bufferGeometry.boundingBox.max.x = max[0];
                bufferGeometry.boundingBox.max.y = max[1];
                bufferGeometry.boundingBox.max.z = max[2];
                bufferGeometry.boundingBox.getCenter(bufferGeometry.boundingSphere.center);
                var maxSide = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
                bufferGeometry.boundingSphere.radius = maxSide * 0.5;
                bufferGeometry.index.count = this.hvo.currentFrameInfo.primCount;
            }
        }
        rewind() {
            this.hvo.rewind();
        }
        seekToTime(seekTime, displayImmediately) {
            this.hvo.seekToTime(seekTime, displayImmediately);
        }
        play() {
            if (this.hvo.state == exports.States.Opening) {
                this.hvo.forceLoad();
            }
            else if (this.hvo.state >= exports.States.Opened &&
                this.hvo.state != exports.States.Playing) {
                this.hvo.play();
            }
        }
        close() {
            if (this.bufferGeometry) {
                this.bufferGeometry.index.count = 0;
            }
            this.hvo.close();
        }
        pause() {
            this.hvo.pause();
        }
        setLogLevel(level) {
            this.hvo.logLevel = level;
        }
        setAudioEnabled(enabled) {
            this.hvo.setAudioEnabled(enabled);
        }
        audioEnabled() {
            return this.hvo.audioEnabled();
        }
        setAudioVolume(volume) {
            this.hvo.setAudioVolume(volume);
        }
        setAutoLooping(loop) {
            this.hvo.setAutoLooping(loop);
        }
    }

    exports.HoloVideoObject = HoloVideoObject;
    exports.HoloVideoObjectThreeJS = HoloVideoObjectThreeJS;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
