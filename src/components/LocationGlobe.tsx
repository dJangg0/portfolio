import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import * as THREE from 'three';

const HOME_LONGITUDE = 122.559;
const HOME_LATITUDE = 10.717;
const HOME_DISTANCE = 3.25;
const MIN_DISTANCE = 1.85;
const MAX_DISTANCE = 5.4;
const MAX_LATITUDE = 1.15;
const HOME_ROTATION = new THREE.Vector2(THREE.MathUtils.degToRad(HOME_LATITUDE), -Math.PI / 2 - THREE.MathUtils.degToRad(HOME_LONGITUDE));
const HOME_POSITION = new THREE.Vector3(
  Math.cos(THREE.MathUtils.degToRad(HOME_LATITUDE)) * Math.cos(THREE.MathUtils.degToRad(HOME_LONGITUDE)),
  Math.sin(THREE.MathUtils.degToRad(HOME_LATITUDE)),
  -Math.cos(THREE.MathUtils.degToRad(HOME_LATITUDE)) * Math.sin(THREE.MathUtils.degToRad(HOME_LONGITUDE)),
);

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const earthShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uCloud;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 eye = normalize(cameraPosition - vPosition);
    float light = dot(normal, uSun);
    float daylight = smoothstep(-0.18, 0.25, light);
    vec3 day = texture2D(uDay, vUv).rgb;
    vec3 night = texture2D(uNight, vUv).rgb;
    float cloudShadow = texture2D(uCloud, vUv + vec2(0.003, 0.001)).r;
    vec3 surface = day * (0.26 + max(light, 0.0) * 1.12);
    surface *= 1.0 - cloudShadow * 0.13;
    vec3 dark = day * 0.045 + night * vec3(1.1, 0.92, 0.65) * 1.4;
    vec3 color = mix(dark, surface, daylight);
    float ocean = 1.0 - smoothstep(0.11, 0.3, day.r + day.g);
    float glint = pow(max(dot(reflect(-uSun, normal), eye), 0.0), 52.0);
    color += vec3(0.36, 0.58, 0.54) * glint * ocean * daylight * 0.28;
    float rim = pow(1.0 - max(dot(normal, eye), 0.0), 3.6);
    color += vec3(0.04, 0.20, 0.18) * rim * (0.35 + daylight * 0.65);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const cloudShader = /* glsl */ `
  uniform sampler2D uCloud;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    float cloud = texture2D(uCloud, vUv).r;
    float light = smoothstep(-0.18, 0.6, dot(normalize(vNormal), uSun));
    gl_FragColor = vec4(mix(vec3(0.07, 0.13, 0.14), vec3(0.92, 0.99, 0.96), light), cloud * 0.58);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 eye = normalize(cameraPosition - vPosition);
    float edge = pow(1.0 - abs(dot(normalize(vNormal), eye)), 3.7);
    gl_FragColor = vec4(0.15, 0.68, 0.53, edge * 0.22);
  }
`;

type EarthTextures = { day: THREE.Texture; night: THREE.Texture; cloud: THREE.Texture };
type Motion = {
  rotation: THREE.Vector2;
  rotationTarget: THREE.Vector2;
  rotationSpring: THREE.Vector2;
  inertia: THREE.Vector2;
  zoom: number;
  zoomTarget: number;
  zoomSpring: number;
  dragging: boolean;
  flight: { from: THREE.Vector2; elapsed: number; duration: number } | null;
};

// A critically damped spring settles without the sharp stop of linear easing.
function spring(value: number, target: number, velocity: number, frequency: number, dt: number): [number, number] {
  const offset = value - target;
  const decay = Math.exp(-frequency * dt);
  return [target + (offset * (1 + frequency * dt) + velocity * dt) * decay,
    (velocity * (1 - frequency * dt) - offset * frequency * frequency * dt) * decay];
}

function GlobeScene({ textures, motion, label, reduced }: {
  textures: EarthTextures;
  motion: Motion;
  label: React.RefObject<HTMLDivElement | null>;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const clock = useRef(0);
  const ready = useRef(false);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const markerRotation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), HOME_POSITION), []);
  const uniforms = useMemo(() => ({
    uDay: { value: textures.day },
    uNight: { value: textures.night },
    uCloud: { value: textures.cloud },
    uSun: { value: new THREE.Vector3(-1.8, 1.3, 3.4).normalize() },
  }), [textures]);
  const starPositions = useMemo(() => {
    const points = new Float32Array(230 * 3);
    for (let i = 0; i < 230; i += 1) {
      const seed = Math.sin(i * 127.1 + 31.7) * 43758.5453;
      const seed2 = Math.sin(i * 269.5 + 73.1) * 18371.131;
      points[i * 3] = ((seed - Math.floor(seed)) - 0.5) * 15;
      points[i * 3 + 1] = ((seed2 - Math.floor(seed2)) - 0.5) * 13;
      points[i * 3 + 2] = -3 - (i % 9) * 0.2;
    }
    return points;
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    clock.current += dt;
    if (reduced) {
      motion.zoom = Math.log(motion.zoomTarget);
      motion.zoomSpring = 0;
    } else {
      [motion.zoom, motion.zoomSpring] = spring(motion.zoom, Math.log(motion.zoomTarget), motion.zoomSpring, 10, dt);
      const bounded = THREE.MathUtils.clamp(motion.zoom, Math.log(MIN_DISTANCE), Math.log(MAX_DISTANCE));
      if (bounded !== motion.zoom) { motion.zoom = bounded; motion.zoomSpring = 0; }
    }
    camera.position.z = Math.exp(motion.zoom);
    camera.updateMatrixWorld();
    let zoom = 1;
    if (motion.flight) {
      motion.flight.elapsed += dt;
      const progress = reduced ? 1 : Math.min(1, motion.flight.elapsed / motion.flight.duration);
      const ease = progress * progress * (3 - 2 * progress);
      motion.rotation.lerpVectors(motion.flight.from, HOME_ROTATION, ease);
      motion.rotationTarget.copy(motion.rotation);
      motion.rotationSpring.set(0, 0);
      zoom = 1 - Math.sin(progress * Math.PI) * 0.08;
      if (progress === 1) motion.flight = null;
    } else {
      if (!motion.dragging && !reduced) {
        motion.rotationTarget.addScaledVector(motion.inertia, dt);
        motion.inertia.multiplyScalar(Math.exp(-dt * 5.5));
      }
      motion.rotationTarget.x = THREE.MathUtils.clamp(motion.rotationTarget.x, -MAX_LATITUDE, MAX_LATITUDE);
      if (reduced) {
        motion.rotation.copy(motion.rotationTarget);
        motion.rotationSpring.set(0, 0);
        motion.inertia.set(0, 0);
      } else {
        [motion.rotation.x, motion.rotationSpring.x] = spring(motion.rotation.x, motion.rotationTarget.x, motion.rotationSpring.x, 17, dt);
        [motion.rotation.y, motion.rotationSpring.y] = spring(motion.rotation.y, motion.rotationTarget.y, motion.rotationSpring.y, 17, dt);
      }
    }
    const boundedPitch = THREE.MathUtils.clamp(motion.rotation.x, -MAX_LATITUDE, MAX_LATITUDE);
    if (boundedPitch !== motion.rotation.x) { motion.rotation.x = boundedPitch; motion.rotationSpring.x = 0; }
    const drift = !reduced && !motion.dragging && motion.inertia.lengthSq() < 0.00001 ? Math.sin(clock.current * 0.18) * 0.016 : 0;
    group.current.rotation.set(motion.rotation.x, motion.rotation.y + drift, 0);
    group.current.scale.setScalar(zoom);
    if (clouds.current && !reduced) clouds.current.rotation.y = clock.current * 0.004;
    if (pulse.current) {
      const phase = reduced ? 0.4 : (clock.current * 0.42) % 1;
      pulse.current.scale.setScalar(1 + phase * 2);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.6;
    }
    group.current.updateMatrixWorld();
    projected.copy(HOME_POSITION).multiplyScalar(1.025).applyMatrix4(group.current.matrixWorld);
    const facing = projected.z > 0.33;
    projected.project(camera);
    if (label.current) {
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      label.current.style.opacity = facing && Math.abs(projected.x) < 0.85 ? '1' : '0';
      label.current.style.transform = `translate(${x}px, ${y}px)`;
    }
    if (!ready.current) {
      ready.current = true;
      window.dispatchEvent(new CustomEvent('portfolio:globe-ready'));
    }
  });

  return <>
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[starPositions, 3]} /></bufferGeometry>
      <pointsMaterial color="#b9e8d6" size={0.011} sizeAttenuation transparent opacity={0.58} depthWrite={false} />
    </points>
    <group ref={group} position={[0, 0.05, 0]}>
      <mesh>
        <sphereGeometry args={[1, 96, 64]} />
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={earthShader} />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[1.009, 80, 48]} />
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={cloudShader} transparent depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.035, 80, 48]} />
        <shaderMaterial vertexShader={vertexShader} fragmentShader={atmosphereShader} transparent side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group position={HOME_POSITION.clone().multiplyScalar(1.018)} quaternion={markerRotation}>
        <mesh><circleGeometry args={[0.009, 24]} /><meshBasicMaterial color="#effff5" toneMapped={false} /></mesh>
        <mesh><ringGeometry args={[0.018, 0.022, 48]} /><meshBasicMaterial color="#59ffad" toneMapped={false} /></mesh>
        <mesh ref={pulse}><ringGeometry args={[0.023, 0.025, 48]} /><meshBasicMaterial color="#59ffad" transparent opacity={0.5} toneMapped={false} depthWrite={false} /></mesh>
      </group>
    </group>
  </>;
}

const fill: CSSProperties = { position: 'absolute', inset: 0 };

function StaticEarth() {
  return <div style={{ ...fill, display: 'grid', placeItems: 'center' }}>
    <div style={{ width: 'min(78%, 350px)', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, transparent 25%, rgba(0,8,7,.84) 88%), url(/textures/earth-day.jpg) 73% center / auto 100%', boxShadow: 'inset -18px -8px 35px #020c09, 0 0 22px #31c39733' }} />
  </div>;
}

class GlobeBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <StaticEarth /> : this.props.children; }
}

export default function LocationGlobe() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; time: number; pointer: number; touch: boolean; speed: THREE.Vector2 } | null>(null);
  const renderFrame = useRef<() => void>(() => {});
  const motion = useRef<Motion>({
    rotation: new THREE.Vector2(HOME_ROTATION.x - 0.1, HOME_ROTATION.y + 0.95),
    rotationTarget: new THREE.Vector2(HOME_ROTATION.x - 0.1, HOME_ROTATION.y + 0.95),
    rotationSpring: new THREE.Vector2(), inertia: new THREE.Vector2(),
    zoom: Math.log(HOME_DISTANCE), zoomTarget: HOME_DISTANCE, zoomSpring: 0,
    dragging: false, flight: null,
  });
  const [textures, setTextures] = useState<EarthTextures | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let disposed = false;
    let loadingFailed = false;
    let inView = false;
    let loaded: THREE.Texture[] = [];
    const element = root.current;
    if (!element) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReduced(media.matches);
      if (media.matches) {
        motion.current.rotation.copy(HOME_ROTATION);
        motion.current.rotationTarget.copy(HOME_ROTATION);
        motion.current.rotationSpring.set(0, 0);
        motion.current.inertia.set(0, 0);
        motion.current.flight = null;
      }
    };
    updateMotion();
    media.addEventListener('change', updateMotion);
    const updateVisibility = () => setActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateVisibility(); }, { threshold: 0.08 });
    observer.observe(element);
    document.addEventListener('visibilitychange', updateVisibility);
    const goHome = () => {
      motion.current.inertia.set(0, 0);
      motion.current.rotationSpring.set(0, 0);
      motion.current.zoomTarget = HOME_DISTANCE;
      const angle = motion.current.rotation.y;
      motion.current.rotation.y = HOME_ROTATION.y + THREE.MathUtils.euclideanModulo(angle - HOME_ROTATION.y + Math.PI, Math.PI * 2) - Math.PI;
      motion.current.rotationTarget.copy(motion.current.rotation);
      motion.current.flight = { from: motion.current.rotation.clone(), elapsed: 0, duration: 2.6 };
      if (media.matches) { motion.current.rotation.copy(HOME_ROTATION); motion.current.rotationTarget.copy(HOME_ROTATION); motion.current.flight = null; }
      renderFrame.current();
    };
    window.addEventListener('portfolio:globe-home', goHome);
    const testCanvas = document.createElement('canvas');
    const testContext = testCanvas.getContext('webgl2');
    if (!testContext) setFailed(true);
    else {
      testContext.getExtension('WEBGL_lose_context')?.loseContext();
      const loader = new THREE.TextureLoader();
      const load = async (path: string) => {
        const texture = await loader.loadAsync(path);
        if (disposed || loadingFailed) texture.dispose();
        else loaded.push(texture);
        return texture;
      };
      Promise.all(['/textures/earth-day.jpg', '/textures/earth-night.jpg', '/textures/earth-clouds.jpg'].map(load)).then(([day, night, cloud]) => {
        if (disposed) return;
        day.colorSpace = THREE.SRGBColorSpace;
        night.colorSpace = THREE.SRGBColorSpace;
        loaded.forEach(texture => { texture.anisotropy = 4; });
        setTextures({ day, night, cloud });
        if (!media.matches) motion.current.flight = { from: motion.current.rotation.clone(), elapsed: 0, duration: 3.8 };
      }).catch(() => {
        loadingFailed = true;
        loaded.forEach(texture => texture.dispose());
        loaded = [];
        if (!disposed) setFailed(true);
      });
    }
    return () => {
      disposed = true;
      observer.disconnect();
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      window.removeEventListener('portfolio:globe-home', goHome);
      loaded.forEach(texture => texture.dispose());
      loaded = [];
    };
  }, []);

  useEffect(() => {
    if (active) renderFrame.current();
  }, [active, reduced, textures]);

  useEffect(() => {
    if (failed) window.dispatchEvent(new CustomEvent('portfolio:globe-fallback'));
  }, [failed]);

  useEffect(() => {
    const element = root.current;
    if (!element || failed) return;
    const wheelZoom = (event: WheelEvent) => {
      if (!event.deltaY) return;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? element.clientHeight : 1;
      const delta = THREE.MathUtils.clamp(event.deltaY * unit, -160, 160);
      const next = THREE.MathUtils.clamp(motion.current.zoomTarget * Math.exp(delta * 0.00065), MIN_DISTANCE, MAX_DISTANCE);
      if (next === motion.current.zoomTarget) return;
      event.preventDefault();
      motion.current.zoomTarget = next;
      renderFrame.current();
    };
    element.addEventListener('wheel', wheelZoom, { passive: false });
    return () => element.removeEventListener('wheel', wheelZoom);
  }, [failed]);

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (failed || event.button !== 0 || !event.isPrimary) return;
    drag.current = { x: event.clientX, y: event.clientY, time: performance.now(), pointer: event.pointerId, touch: event.pointerType === 'touch', speed: new THREE.Vector2() };
    motion.current.dragging = true;
    motion.current.flight = null;
    motion.current.rotationTarget.copy(motion.current.rotation);
    motion.current.rotationSpring.set(0, 0);
    motion.current.inertia.set(0, 0);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = 'grabbing';
    renderFrame.current();
  };
  const release = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer !== event.pointerId) return;
    const last = drag.current;
    motion.current.inertia.copy(last.speed);
    if (event.type !== 'pointerup' || performance.now() - last.time > 90) motion.current.inertia.set(0, 0);
    drag.current = null;
    motion.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.style.cursor = 'grab';
    renderFrame.current();
  };

  return <div ref={root} role={failed ? 'img' : 'group'} tabIndex={failed ? undefined : 0} aria-label={failed ? 'Earth view. Home base: Iloilo City, Philippines.' : 'Interactive Earth, focused on Iloilo, Philippines. Drag to rotate, scroll to zoom, use arrow keys to explore, plus and minus to zoom, or press Home to return to Iloilo.'}
    style={{ ...fill, overflow: 'hidden', touchAction: 'pan-y', cursor: failed ? 'default' : 'grab' }}
    onPointerDown={pointerDown} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onPointerMove={event => {
      const last = drag.current;
      if (!last || last.pointer !== event.pointerId) return;
      const elapsed = Math.max(8, performance.now() - last.time) / 1000;
      const dx = (event.clientX - last.x) * 0.0045;
      const dy = last.touch ? 0 : (event.clientY - last.y) * 0.0038;
      motion.current.rotationTarget.y += dx;
      motion.current.rotationTarget.x = THREE.MathUtils.clamp(motion.current.rotationTarget.x + dy, -MAX_LATITUDE, MAX_LATITUDE);
      last.speed.lerp(new THREE.Vector2(dy / elapsed, dx / elapsed).clampLength(0, 1.8), 1 - Math.exp(-elapsed * 18));
      last.x = event.clientX; last.y = event.clientY;
      last.time = performance.now();
      renderFrame.current();
    }}
    onKeyDown={event => {
      if (failed || !['Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) return;
      event.preventDefault();
      motion.current.flight = null;
      motion.current.inertia.set(0, 0);
      if (event.key === 'Home') window.dispatchEvent(new CustomEvent('portfolio:globe-home'));
      if (event.key === 'ArrowLeft') motion.current.rotationTarget.y -= 0.13;
      if (event.key === 'ArrowRight') motion.current.rotationTarget.y += 0.13;
      if (event.key === 'ArrowUp') motion.current.rotationTarget.x -= 0.1;
      if (event.key === 'ArrowDown') motion.current.rotationTarget.x += 0.1;
      if (event.key === '+' || event.key === '=') motion.current.zoomTarget = Math.max(MIN_DISTANCE, motion.current.zoomTarget / 1.2);
      if (event.key === '-') motion.current.zoomTarget = Math.min(MAX_DISTANCE, motion.current.zoomTarget * 1.2);
      renderFrame.current();
    }}>
    {failed ? <StaticEarth /> : textures ? <GlobeBoundary onFailure={() => setFailed(true)}>
      <Canvas camera={{ position: [0, 0, HOME_DISTANCE], fov: 42, near: 0.1, far: 30 }} frameloop={active ? reduced ? 'demand' : 'always' : 'never'} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} style={fill} aria-hidden="true" onCreated={({ gl, invalidate }) => {
        renderFrame.current = invalidate;
        gl.setClearColor('#060d0b', 0);
        gl.domElement.addEventListener('webglcontextlost', () => setFailed(true), { once: true });
      }}>
        <GlobeScene textures={textures} motion={motion.current} label={label} reduced={reduced} />
      </Canvas>
    </GlobeBoundary> : <StaticEarth />}
    {!failed && <div ref={label} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: 0, transition: 'opacity .35s', willChange: 'transform', zIndex: 1 }}>
      <span style={{ position: 'absolute', left: 7, bottom: 7, width: 19, height: 1, background: '#86ffc6', transform: 'rotate(-43deg)', transformOrigin: 'left center' }} />
      <span style={{ display: 'block', position: 'absolute', left: 20, bottom: 19, whiteSpace: 'nowrap', padding: '0 4px 5px', borderBottom: '1px solid #68e9a8', color: '#effff5', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(11px, 2.3vw, 16px)', letterSpacing: '.06em', textShadow: '0 1px 8px #000, 0 1px 3px #000' }}>ILOILO CITY<span style={{ display: 'block', color: '#91c4ab', fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 400, letterSpacing: '.12em', marginTop: 2 }}>HOME BASE · PHILIPPINES</span></span>
    </div>}
  </div>;
}
