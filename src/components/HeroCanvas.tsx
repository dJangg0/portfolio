import { Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const NODE_COUNT = 360;
const GLOBE_RADIUS = 1.9;

type NetworkData = {
  positions: Float32Array;
  edges: Float32Array;
};

function makeNetwork(): NetworkData {
  const nodes: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < NODE_COUNT; index += 1) {
    const y = 1 - (index / (NODE_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;

    nodes.push(
      new THREE.Vector3(
        Math.cos(angle) * radius * GLOBE_RADIUS,
        y * GLOBE_RADIUS,
        Math.sin(angle) * radius * GLOBE_RADIUS,
      ),
    );
  }

  const connections = new Set<string>();
  for (let index = 0; index < nodes.length; index += 1) {
    const nearest = nodes
      .map((node, candidate) => ({ candidate, distance: nodes[index].distanceToSquared(node) }))
      .filter(({ candidate }) => candidate !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    for (const { candidate } of nearest) {
      const [left, right] = index < candidate ? [index, candidate] : [candidate, index];
      connections.add(`${left}:${right}`);
    }
  }

  const positions = new Float32Array(nodes.length * 3);
  nodes.forEach((node, index) => node.toArray(positions, index * 3));

  const edges = new Float32Array(connections.size * 6);
  let edgeOffset = 0;
  for (const connection of connections) {
    const [from, to] = connection.split(':').map(Number);
    nodes[from].toArray(edges, edgeOffset);
    nodes[to].toArray(edges, edgeOffset + 3);
    edgeOffset += 6;
  }

  return { positions, edges };
}

function NetworkScene() {
  const group = useRef<THREE.Group>(null);
  const scrollProgress = useRef(0);
  const pointer = useRef(new THREE.Vector2(2, 2));
  const { camera } = useThree();
  const network = useMemo(makeNetwork, []);
  const scratch = useMemo(
    () => ({ color: new THREE.Color(), local: new THREE.Vector3(), projected: new THREE.Vector3() }),
    [],
  );

  const pointGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(network.positions, 3));

    const colors = new Float32Array(NODE_COUNT * 3);
    for (let index = 0; index < NODE_COUNT; index += 1) {
      colors[index * 3] = 0.18;
      colors[index * 3 + 1] = 0.64;
      colors[index * 3 + 2] = 0.68;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [network]);

  const edgeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(network.edges, 3));
    return geometry;
  }, [network]);

  useEffect(() => {
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      scrollProgress.current = Number.isFinite(detail) ? detail : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };

    const initial = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--scene-progress'),
    );
    if (Number.isFinite(initial)) scrollProgress.current = initial;

    window.addEventListener('portfolio:scene-progress', onProgress);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('portfolio:scene-progress', onProgress);
      window.removeEventListener('pointermove', onPointerMove);
      pointGeometry.dispose();
      edgeGeometry.dispose();
    };
  }, [edgeGeometry, pointGeometry]);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const progress = scrollProgress.current;
    const elapsed = clock.elapsedTime;
    group.current.rotation.y = elapsed * 0.055 + progress * 0.42;
    group.current.rotation.x = 0.13 + Math.sin(elapsed * 0.18) * 0.035;
    group.current.position.x = 1.28 + pointer.current.x * 0.075;
    group.current.position.y = pointer.current.y * 0.045;
    group.current.updateMatrixWorld();

    camera.position.set(
      0.08 + progress * 1.2,
      Math.sin(progress * Math.PI * 2) * 0.18,
      5.9 - progress * 6.25,
    );
    camera.lookAt(1.28, 0, 0);

    const colors = pointGeometry.getAttribute('color') as THREE.BufferAttribute;
    const positions = pointGeometry.getAttribute('position') as THREE.BufferAttribute;
    const { color, local, projected } = scratch;

    for (let index = 0; index < NODE_COUNT; index += 1) {
      local.fromBufferAttribute(positions, index);
      projected.copy(local).applyMatrix4(group.current.matrixWorld).project(camera);
      const distance = Math.hypot(projected.x - pointer.current.x, projected.y - pointer.current.y);
      const glow = Math.max(0, 1 - distance / 0.18);
      const pulse = 0.035 * (0.5 + 0.5 * Math.sin(elapsed * 1.7 + index * 0.23));

      color.setRGB(0.12 + glow * 0.74 + pulse, 0.55 + glow * 0.4 + pulse, 0.61 + glow * 0.36 + pulse);
      colors.setXYZ(index, color.r, color.g, color.b);
    }
    colors.needsUpdate = true;
  }, [scratch]);

  return (
    <group ref={group} position={[1.28, 0, 0]}>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color="#72e4dd" transparent opacity={0.16} />
      </lineSegments>
      <points geometry={pointGeometry}>
        <pointsMaterial
          size={0.036}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 28, 20]} />
        <meshBasicMaterial color="#59cfc9" wireframe transparent opacity={0.045} />
      </mesh>
      <mesh rotation={[0.92, 0.16, 0.12]}>
        <torusGeometry args={[GLOBE_RADIUS * 1.16, 0.006, 4, 160]} />
        <meshBasicMaterial color="#8cf3da" transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[0.22, 0.82, 1.05]}>
        <torusGeometry args={[GLOBE_RADIUS * 1.26, 0.004, 4, 160]} />
        <meshBasicMaterial color="#67b9ea" transparent opacity={0.17} />
      </mesh>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0.08, 0, 5.9], fov: 46, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ alpha: false, antialias: false, powerPreference: 'low-power' }}
      performance={{ min: 0.55 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor('#050a10', 1)}
    >
      <color attach="background" args={['#050a10']} />
      <fog attach="fog" args={['#050a10', 8, 24]} />
      <ambientLight intensity={0.45} />
      <Stars radius={44} depth={30} count={520} factor={1.65} saturation={0.18} fade speed={0.22} />
      <NetworkScene />
    </Canvas>
  );
}
