import { createRoot } from 'react-dom/client';
import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from 'react';
import { useControls } from 'leva';
import { Canvas, extend, useFrame, useThree, Object3DNode } from '@react-three/fiber';
import * as Three from 'three';
import { HoloVideoObjectThreeJS } from '@MixedRealityCaptureStudios/holo-video-object-three';
import { HoloVideoObject } from '@MixedRealityCaptureStudios/holo-video-object-r3f';
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

const tuple = <T extends any[]>(...args: T): T => args;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

const CameraControls = () => {
  const controls = useRef<OrbitControls>(null);
  const { camera, gl } = useThree();

  // Set our initial target only when this component mounts.
  useEffect(() => {
    if (!controls.current) {
      return;
    }

    controls.current.target = new Three.Vector3(0, 10, 0);
  }, [])

  useFrame(() => { controls.current?.update(); });

  return (
    <orbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
    />
  );
};

type VideoControlsRef = {
  setTime: (currentTime: number, totalTime: number) => void;
};

type VideoControlsProps = {
  playing: boolean;
  muted: boolean;
  onClickPlayButton: () => void;
  onClickMuteButton: () => void;
  onSeek: (percent: number) => void;
};

const VideoControls = React.forwardRef((props: VideoControlsProps, ref) => {
  const {
    playing,
    muted,
    onClickPlayButton,
    onClickMuteButton,
    onSeek,
  } = props;

  const timeLabel = useRef<HTMLLabelElement>(null);
  const progressBarContainer = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  useImperativeHandle<unknown, VideoControlsRef>(ref, () => ({
    setTime: (currentTime, totalTime) => {
      if (!progressBar.current || !timeLabel.current) {
        return;
      }

      progressBar.current.style.width = `${(currentTime / totalTime) * 100}%`;

      const toLabel = (time: number) => {
        const seconds = time / 1000;
        const secondsLabel = `${Math.round(seconds % 60)}`.padStart(2, '0');
        const minutes = Math.round(seconds / 60);
        const minutesLabel = `${minutes}`.padStart(2, '0');
        return `${minutesLabel}:${secondsLabel}`;
      };

      timeLabel.current.textContent = `${toLabel(currentTime)} / ${toLabel(totalTime)}`;
    },
  }));

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        bottom: '50px',
        width: '100%',
      }}
    >
      <div
        style={{
          backgroundColor: '#333333',
          display: 'flex',
          width: '50%',
          pointerEvents: 'all',
          flexDirection: 'row',
          alignContent:' center',
          justifyContent: 'center',
          alignItems:' center',
          padding: '13px 12px 13px 9px',
          borderRadius:' 4px',
          gap: '8px',
        }}
      >
        <button
          style={{
            backgroundColor: 'unset',
            borderColor: 'unset',
            lineHeight: '0',
            border: 'unset',
            fontSize: 'larger',
            padding: 0,
            margin: 0,
          }}
          onClick={onClickPlayButton}
        >
          {playing ? '⏸' : '▶️'}
        </button>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', gap: '8px' }}>
          <div
            ref={progressBarContainer}
            style={{
              height: '11px',
              backgroundColor: 'gray',
              display: 'flex',
              flexGrow: 1,
              border: '#001526 solid',
            }}
            onClick={(event) => {
              if (!progressBar.current || !progressBarContainer.current) {
                return;
              }

              const deltaX = event.pageX - progressBar.current.offsetLeft;
              const percent = deltaX / progressBarContainer.current.clientWidth;
              onSeek(percent);
            }}
          >
            <div
              ref={progressBar}
              style={{ backgroundColor: '#0078d7', width: 0 }}
            />
          </div>
          <label
            ref={timeLabel}
            style={{ fontFamily: 'sans-serif', color: 'white', fontSize: 'small' }}
          >
            00:00 / 00:00
          </label>
          <button
            onClick={onClickMuteButton}
            style={{
              width: '26px',
              backgroundColor: 'unset',
              borderColor: 'unset',
              lineHeight: '0',
              border: 'unset',
              fontSize: 'larger',
              padding: 0,
              margin: 0,
            }}
          >
            {muted ? '🔈' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  );
});

type SunlightProps = {
  enabled: boolean;
  animated: boolean;
  ambientIntensity: number;
  altitude: number;
  azimuth: number;
};

const Sunlight = (props: SunlightProps) => {
  const {
    enabled,
    animated,
    ambientIntensity = 0.5,
    azimuth,
    altitude,
  } = props;

  const sunlight = useRef<Three.DirectionalLight>(null);
  const animatedRef = useRef(animated);

  useEffect(() => { animatedRef.current = animated; }, [animated]);

  useFrame(() => {
    if (!animatedRef.current) {
      return;
    }

    const time = performance.now();
    const animatedTime = time * 0.001;
    const x = Math.sin(animatedTime);
    const z = Math.cos(animatedTime);
    sunlight.current?.position.set(x * 20, 20, z * 20);
  });
  
  const phi = ((90 - altitude) * Math.PI) / 180.0;
  const theta = (azimuth * Math.PI) / 180.0;

  const adjustedPosition = tuple(
    100 * Math.sin(phi) * Math.cos(theta),
    100 * Math.cos(phi),
    100 * Math.sin(phi) * Math.sin(theta),
  );

  return (
    <>
      <mesh position={adjustedPosition} scale={[1, 1, 1]}>
        <sphereGeometry />
        <meshPhysicalMaterial />
      </mesh>
      <ambientLight
        intensity={ambientIntensity}
        color={new Three.Color(1, 1, 1).convertSRGBToLinear()}
      />
      <directionalLight
        ref={sunlight}
        castShadow
        intensity={enabled ? 1.0 : 0.0}
        position={adjustedPosition}
        shadowBias={-0.001}
        shadow-mapSize-height={256}
        shadow-mapSize-width={256}
        shadow-camera-far={600}
        shadow-camera-top={20}
        shadow-camera-right={20}
        shadow-camera-bottom={-20}
        shadow-camera-left={-20}
      />
    </>
  );
};

const soccerPath = '../captures/soccer_normals/soccer_normals.hcap';

const App = () => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const { scene } = useControls({
    scene: {
      value: soccerPath,
      options: { Soccer: soccerPath },
      onChange: () => { setPlaying(false); },
      transient: false,
    },
  });

  // TODO(Jordan): Using multiple hvo's causes our playhead to only
  // affect the most recently created hvo. It would be good to
  // keep a handle to each hvo so we can control all of them.
  const hvoCount = 1;
  /*
  const { count: hvoCount } = useControls({
    count: { value: 1, min: 1, max: 16, step: 1 },
  });
  */

  const sunlight = useControls('sunlight', {
    enabled: true,
    animated: false,
    azimuth: { value: 32.0, min: 0, max: 360 },
    altitude: { value: 30.6, min: 0, max: 90 },
    ambientIntensity: { value: 1.0, min: 0.0, max: 10.0 },
  });

  const hvoRef = useRef<HoloVideoObjectThreeJS | null>(null);
  const videoControls = useRef<VideoControlsRef>(null);

  const onUpdate = (currentTime: number, totalTime: number) => {
    videoControls.current?.setTime(currentTime, totalTime);
  };

  const countRoot = Math.ceil(Math.sqrt(hvoCount));
  const spacing = 5;
  const halfRoot = countRoot / 2;
  const hvoPositions = [...Array(hvoCount)]
    .map((_, index) => [(index / countRoot) - halfRoot, (index % countRoot) - halfRoot]);

  const hvoElements = hvoPositions.map(([x, z], index) => (
    <HoloVideoObject
      key={index}
      ref={hvoRef}
      path={scene}
      playing={playing}
      muted={muted}
      onUpdate={onUpdate}
      meshProps={{ position: [x * spacing, 0, z * spacing] }}
    />
  ));

  return (
    <div>
      <VideoControls
        ref={videoControls}
        playing={playing}
        muted={muted}
        onSeek={(percent) => {
          if (!hvoRef.current || !hvoRef.current.hvo || !hvoRef.current.hvo.videoElement) {
            return;
          }

          const time = Math.round(percent * hvoRef.current.hvo.videoElement?.duration);
          hvoRef.current.seekToTime(time, true);
        }}
        onClickPlayButton={() => { setPlaying(!playing); }}
        onClickMuteButton={() => { setMuted(!muted); }}
      />
      <Canvas
        shadows={{ type: Three.PCFSoftShadowMap }}
        camera={{ position: [0, 20, -20], fov: 70 }}
      >
        <Sunlight
          enabled={sunlight.enabled}
          animated={sunlight.animated}
          altitude={sunlight.altitude}
          azimuth={sunlight.azimuth}
          ambientIntensity={sunlight.ambientIntensity}
        />
        
        {hvoElements}

        <mesh
          castShadow
          receiveShadow
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[1000, 32]} />
          <meshPhysicalMaterial />
        </mesh>

        <CameraControls />

        <EffectComposer>
          <Vignette eskil={false} offset={0.3} darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);