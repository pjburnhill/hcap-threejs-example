import { HoloVideoObject, States } from '@MixedRealityCaptureStudios/holo-video-object';
import { vec3, mat4 } from 'gl-matrix';

let hvo: HoloVideoObject;

type Gl = WebGL2RenderingContext | WebGLRenderingContext;

type Program = WebGLProgram & {
    projLoc: WebGLUniformLocation;
    viewLoc: WebGLUniformLocation;
    worldLoc: WebGLUniformLocation;
    texSamplerLoc: WebGLUniformLocation;
    posLoc: WebGLUniformLocation;
    texCoordLoc: WebGLUniformLocation;
    norLoc: WebGLUniformLocation;
    colorLoc: WebGLUniformLocation;
};

function createProgram(gl: Gl, vertexShaderSource, fragmentShaderSource, preLink?): Program {
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
        console.log(log);
    }

    log = gl.getShaderInfoLog(vshader);
    if (log) {
        console.log(log);
    }

    log = gl.getShaderInfoLog(fshader);
    if (log) {
        console.log(log);
    }

    return program as Program;
}

const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;

function setCanvasSize() {
    var size = Math.min(1024, window.innerWidth*0.9, window.innerHeight*0.9);
    canvas.width = size;
    canvas.height = size;
    canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
    canvas.style.top = (window.innerHeight - canvas.height) / 2 +  "px";
    canvas.style.position = "absolute";
}

setCanvasSize();

canvas.addEventListener("webglcontextlost", function(event) {
    console.log("webglcontextlost");
    event.preventDefault();
    cancelAnimationFrame(animReq);
    destroyGraphics();
}, false);

canvas.addEventListener("webglcontextrestored", function(event) {
    console.log("webglcontextrestored");
    initGraphics();

    onCaptureOpened(fileInfo);

    if (hvo) {
        hvo.setBuffers(posBuf, indexBuf, uvBuf, norBuf, tex);
        hvo.updateToLastKeyframe();
        indexCount = 0;
    }

    animReq = requestAnimationFrame(render);
}, false);

var gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
var extLoseContext: WEBGL_lose_context = null;

function initContext() {

    gl = canvas.getContext('webgl2');

    if (!gl) {

        gl = canvas.getContext('webgl');

        if (!gl) {

            gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext;

            if (!gl) {
                alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            }
        }
    }

    extLoseContext = gl.getExtension('WEBGL_lose_context');
}

initContext();

if (extLoseContext)
{
    var loseCtxBtn = document.getElementById('loseCtx');
    if (loseCtxBtn) {
        loseCtxBtn.addEventListener('click', function() {
            if (loseCtxBtn.textContent == "Lose WebGL Context") {
                extLoseContext.loseContext();
                loseCtxBtn.textContent  = "Restore WebGL Context";
            }
            else {
                extLoseContext.restoreContext();
                loseCtxBtn.textContent  = "Lose WebGL Context";
            }
        });
    }
}

var fileInfo = null;

function onCaptureOpened(fileInfo) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fileInfo.videoWidth, fileInfo.videoHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    if (fileInfo.haveNormals) {
        norBuf = gl.createBuffer();
    }

    hvo.setBuffers(posBuf, indexBuf, uvBuf, norBuf, tex);
}

function openHCapObject(url) {
    hvo = new HoloVideoObject(gl);

    hvo.onLoaded = function(inFileInfo) {
        fileInfo = inFileInfo;
        onCaptureOpened(fileInfo);
    };

    hvo.open(url, { autoloop: true });
}

var rot = 0.0;
var trans = vec3.create();
var scale = 1.0;
var animate = true;
var lastPos = { x: 0, y: 0 };
var lastTouches = [];

// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, {passive:false});

document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, {passive:false});

document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
}, {passive:false});

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.addEventListener("mousemove", function (e) {
    var pos = getMousePos(e);
    var dx = pos.x - lastPos.x;
    var dy = pos.y - lastPos.y;
    if (e.buttons == 1) {
        rot += -0.015 * dx;
    }

    else if (e.buttons == 4) {
        trans[0] += dx * 10;
        trans[1] -= dy * 10;
    }
    lastPos = pos;
});

var lastTouches = [];
function updateLastTouches(e) {
    lastTouches = [];
    for (var i = 0 ; i < e.touches.length ; ++i) {
        var touch = e.touches[i];
        var pos = getMousePos(touch);
        lastTouches[i] = pos;
    }
}

canvas.addEventListener("touchstart", function (e) {
    if (hvo.state != States.Playing) {
        hvo.play();
    }

    updateLastTouches(e);
}, false);

canvas.addEventListener("touchmove", function (e) {

    if (e.touches.length == 1 && lastTouches.length == 1) {
        var pos = getMousePos(e.touches[0]);
        var lastPos = lastTouches[0];
        var dx = pos.x - lastPos.x;
        //var dy = pos.y - lastPos.y;
        rot += 0.015 * dx;
    }

    else if (e.touches.length == 2) {
        if (lastTouches.length == 2) {
            var pos1 = getMousePos(e.touches[0]);
            var pos2 = getMousePos(e.touches[1]);
            var dx = pos2.x - pos1.x;
            var dy = pos2.y - pos1.y;
            var dist = Math.sqrt(dx*dx+dy*dy);

            pos1 = lastTouches[0];
            pos2 = lastTouches[1];
            dx = pos2.x - pos1.x;
            dy = pos2.y - pos1.y;
            var lastDist = Math.sqrt(dx*dx+dy*dy);

            var delta = dist - lastDist;
            scale += delta * 0.003;
            scale = Math.max(Math.min(scale, 10.0), 0.1);
        }
    }

    updateLastTouches(e);

}, false);

var indexCount = 0;

canvas.addEventListener("mousedown", function (e) {

    if (hvo.state != States.Playing)
    {
        hvo.play();
    }

    if (e.buttons == 2) {
        if (!animate) {
            hvo._updateMesh(posBuf, uvBuf, indexBuf, norBuf);
            indexCount = hvo.curMesh.indexCount;
        }
    }
});

canvas.addEventListener('wheel', (e: WheelEvent) => {
    scale += e.deltaY * -0.0003;
    scale = Math.max(Math.min(scale, 10.0), 0.1);
});

const vsSource = `
    uniform mat4 world;
    uniform mat4 view;
    uniform mat4 projection;

    attribute vec3 posIn;
    attribute vec3 norIn;
    attribute mediump vec2 texCoordIn;

    varying mediump vec2 texCoordOut;
    varying mediump vec3 norOut;

    void main()
    {
        texCoordOut = texCoordIn;

        vec3 n = norIn;

        norOut = (world * vec4(n, 0.0)).xyz;
        vec4 posW = world * vec4(posIn, 1.0);
        vec4 posV = view * posW;
        gl_Position = projection * posV;
    }
`;

const psSource = `
    varying mediump vec2 texCoordOut;
    varying mediump vec3 norOut;
    precision mediump float;
    uniform sampler2D texSampler;
    
    void main() {
        vec3 color = texture2D(texSampler, texCoordOut).xyz;
        gl_FragColor = vec4(color, 1.0);
        //float c = dot(normalize(norOut), normalize(vec3(0, -1, 1)));
        //gl_FragColor = vec4(abs(norOut), 1.0);
        //gl_FragColor = vec4(c, c, c, 1.0);
    }
`;

var progressBarVS = `
    attribute vec3 inPos;
    void main()
    {
        gl_Position = vec4(inPos, 1.0);
    }
`;

var progressBarPS = `
    precision lowp float;
    uniform vec3 uColor;
    void main()
    {
        gl_FragColor = vec4(uColor, 1.0);
    }
`;

let tex: WebGLTexture;
let posBuf: WebGLBuffer;
let uvBuf: WebGLBuffer;
let indexBuf: WebGLBuffer;
let norBuf: WebGLBuffer;
let shader: Program;
let progressBarShader: Program;

function initGraphics() {
    tex = gl.createTexture();
    posBuf = gl.createBuffer();
    uvBuf = gl.createBuffer();
    indexBuf = gl.createBuffer();
    norBuf = null;

    shader = createProgram(gl, vsSource, psSource);
    shader.projLoc = gl.getUniformLocation(shader, "projection");
    shader.viewLoc = gl.getUniformLocation(shader, "view");
    shader.worldLoc = gl.getUniformLocation(shader, "world");
    shader.texSamplerLoc = gl.getUniformLocation(shader, "texSampler");
    shader.posLoc = gl.getAttribLocation(shader, "posIn");
    shader.texCoordLoc = gl.getAttribLocation(shader, "texCoordIn");
    shader.norLoc = gl.getAttribLocation(shader, "norIn");

    progressBarShader = createProgram(gl, progressBarVS, progressBarPS);
    progressBarShader.colorLoc = gl.getUniformLocation(progressBarShader, "uColor");
    progressBarShader.posLoc = gl.getAttribLocation(progressBarShader, "inPos");
}

function destroyGraphics() {
    gl.deleteTexture(tex);
    gl.deleteBuffer(posBuf);
    gl.deleteBuffer(uvBuf);
    gl.deleteBuffer(norBuf);
    gl.deleteBuffer(indexBuf);
    gl.deleteProgram(progressBarShader);
    gl.deleteProgram(shader);
}

initGraphics();

hvo = null;
openHCapObject("../captures/soccer_normals/soccer_normals.hcap");

var projMatrix = mat4.create();
mat4.perspective(projMatrix, 1.05, gl.drawingBufferWidth / gl.drawingBufferHeight, 100, 5000.0);

var viewMatrix = mat4.create();
mat4.lookAt(viewMatrix, vec3.fromValues(0.0, 1000.0, -3000.0), vec3.fromValues(0.0, 1000.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0));

var worldMatrix = mat4.create();

var progressBarVerts = new Float32Array(3*4);
var progressBarIndices = new Int16Array([0, 1, 2, 1, 3, 2]);

function drawRectangle(x1, x2, y1, y2, color) {
    progressBarVerts[3*0+0] = x1;
    progressBarVerts[3*0+1] = y2;
    progressBarVerts[3*0+2] = 0.0;

    progressBarVerts[3*1+0] = x2;
    progressBarVerts[3*1+1] = y2;
    progressBarVerts[3*1+2] = 0.0;

    progressBarVerts[3*2+0] = x1;
    progressBarVerts[3*2+1] = y1;
    progressBarVerts[3*2+2] = 0.0;

    progressBarVerts[3*3+0] = x2;
    progressBarVerts[3*3+1] = y1;
    progressBarVerts[3*3+2] = 0.0;

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, progressBarVerts, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, progressBarIndices, gl.DYNAMIC_DRAW);

    gl.uniform3fv(progressBarShader.colorLoc, color);

    gl.enableVertexAttribArray(progressBarShader.posLoc as number);
    gl.vertexAttribPointer(progressBarShader.posLoc as number, 3, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

// Draw the scene repeatedly
var then = 0;
var elapsed = 0;

function render(now) {
    //if(now - then < 33) {
      //  return requestAnimationFrame(render);
    //}

    const deltaTime = now - then;
    elapsed += deltaTime;
    then = now;

    gl.clearColor(0.278, 0.278, 0.278, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (hvo) {
        if (hvo.state >= States.Opened) {

            if (animate) {
                if (hvo.updateBuffers()) {
                    indexCount = hvo.currentFrameInfo.primCount;
                }
            }

            if (indexCount > 0) {
                mat4.fromScaling(worldMatrix, vec3.fromValues(-scale, scale, scale));
                mat4.rotateY(worldMatrix, worldMatrix, rot);
                worldMatrix[12] = trans[0];
                worldMatrix[13] = trans[1];
                worldMatrix[14] = trans[2];

                gl.useProgram(shader);
                gl.enable(gl.DEPTH_TEST);

                gl.uniformMatrix4fv(shader.projLoc, false, projMatrix);
                gl.uniformMatrix4fv(shader.viewLoc, false, viewMatrix);
                gl.uniformMatrix4fv(shader.worldLoc, false, worldMatrix);

                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.uniform1i(shader.texSamplerLoc, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
                gl.enableVertexAttribArray(shader.posLoc as number);
                gl.vertexAttribPointer(shader.posLoc as number, 3, gl.FLOAT, false, 0, 0);

                if (shader.texCoordLoc != -1) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
                    gl.enableVertexAttribArray(shader.texCoordLoc as number);
                    gl.vertexAttribPointer(shader.texCoordLoc as number, 2, gl.UNSIGNED_SHORT, true, 0, 0);
                }

                if (norBuf != null && shader.norLoc != -1) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, norBuf);
                    gl.enableVertexAttribArray(shader.norLoc as number);
                    gl.vertexAttribPointer(shader.norLoc as number, 3, gl.FLOAT, true, 0, 0);
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
                gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
            }
        }

        else {
            gl.useProgram(progressBarShader);

            var y1 = -0.075;
            var y2 = 0.075;

            drawRectangle(-0.5, 0.5, y1, y2, [1.0, 1.0, 1.0]);

            var progress = hvo.getLoadProgress();
            drawRectangle(-0.5, -0.5 + progress, y1, y2, [0.39, 0.58, 0.93]);
        }
    }

    animReq = requestAnimationFrame(render);
}

var animReq = requestAnimationFrame(render);