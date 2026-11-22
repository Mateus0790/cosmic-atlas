/**
 * Cosmic Atlas - React Three Fiber Scene Setup
 * Main canvas, camera, controls, and scene composition
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Stars,
  ContactShadows,
  Html,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls as THREEOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Extend Three.js with custom objects
extend(THREE as any);

// ============================================================================
// CAMERA & CONTROLS
// ============================================================================

/**
 * Custom camera with astronomical scale support
 */
interface AstronomicalCameraProps {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

export const AstronomicalCamera: React.FC<AstronomicalCameraProps> = ({
  position = [0, 0, 100],
  fov = 50,
  near = 0.1,
  far = 1e12,
}) => {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov, near, far]);

  return null;
};

/**
 * Custom orbit controls for astronomical navigation
 */
interface AstronomicalControlsProps {
  enableKeys?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  onChange?: (state: any) => void;
}

export const AstronomicalControls: React.FC<AstronomicalControlsProps> = ({
  enableKeys = true,
  enablePan = true,
  enableZoom = true,
  enableRotate = true,
  minDistance = 1,
  maxDistance = 1e15,
  onChange,
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<InstanceType<typeof THREEOrbitControls>>(null);

  useFrame((state, delta) => {
    if (controlsRef.current) {
      controlsRef.current.update(delta);
    }
  });

  useEffect(() => {
    const controls = new THREEOrbitControls(camera, gl.domElement);
    controls.enablePan = enablePan;
    controls.enableZoom = enableZoom;
    controls.enableRotate = enableRotate;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 0.8;
    controls.panSpeed = 0.5;

    // Auto-rotate very slowly for cinematic effect
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.1;

    controlsRef.current = controls;

    controls.addEventListener('change', () => {
      if (onChange) {
        onChange({
          position: camera.position.toArray(),
          target: controls.target.toArray(),
          zoom: camera.zoom,
        });
      }
    });

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, enableKeys, enablePan, enableZoom, enableRotate, minDistance, maxDistance, onChange]);

  return null;
};

// ============================================================================
// MAIN SCENE COMPONENT
// ============================================================================

interface SceneProps {
  children: React.ReactNode;
  timeScale?: number;
  onCameraChange?: (state: any) => void;
}

export const CosmicScene: React.FC<SceneProps> = ({
  children,
  timeScale = 1,
  onCameraChange,
}) => {
  const [renderSettings, setRenderSettings] = useState({
    toneMapping: 'aces-filmic',
    exposure: 1,
    bloom: true,
  });

  return (
    <Canvas
      camera={{ position: [0, 0, 100], fov: 50, near: 0.1, far: 1e12 }}
      gl={{
        logarithmicDepthBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <AstronomicalCamera />
      <AstronomicalControls onChange={onCameraChange} />
      <ColorAttachments>
        <Environment
          background={false}
          files={['textures/environment/px.png', 'textures/environment/nx.png', 'textures/environment/py.png', 'textures/environment/ny.png', 'textures/environment/pz.png', 'textures/environment/nz.png']}
          path="textures/environment/"
        />
        <Stars radius={1e6} depth={100} factor={100} saturation={0.5} />
        {children}
        <ContactShadows opacity={0.3} scale={100} />
      </ColorAttachments>
    </Canvas>
  );
};

// Color management wrapper
const ColorAttachments: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  return <>{children}</>;
};

// ============================================================================
// EARTH COMPONENT
// ============================================================================

interface EarthProps {
  radius?: number;
  showAtmosphere?: boolean;
  showClouds?: boolean;
  showNightLights?: boolean;
  rotationSpeed?: number;
  tilt?: number;
  onLoad?: (group: THREE.Group) => void;
}

export const Earth: React.FC<EarthProps> = ({
  radius = 10,
  showAtmosphere = true,
  showClouds = true,
  showNightLights = true,
  rotationSpeed = 1,
  tilt = 23.44,
  onLoad,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, clock } = useThree();

  // Load textures
  const dayTexture = useTexture('textures/earth/day.jpg');
  const nightTexture = useTexture('textures/earth/night.jpg');
  const specularTexture = useTexture('textures/earth/specular.jpg');
  const normalTexture = useTexture('textures/earth/normal.jpg');
  const cloudTexture = useTexture('textures/earth/clouds.png');
  const elevationTexture = useTexture('textures/earth/elevation.jpg');

  // Earth mesh
  const earthGeometry = useMemo(
    () => new THREE.SphereGeometry(radius, 128, 128),
    [radius]
  );

  const earthMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughnessMap: specularTexture,
      roughness: 0.7,
      metalness: 0.1,
      displacementMap: elevationTexture,
      displacementScale: radius * 0.01,
    });
    return mat;
  }, [dayTexture, normalTexture, specularTexture, elevationTexture, radius]);

  // Cloud layer
  const cloudGeometry = useMemo(
    () => new THREE.SphereGeometry(radius * 1.005, 64, 64),
    [radius]
  );

  const cloudMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return mat;
  }, [cloudTexture]);

  // Atmosphere (glow effect)
  const atmosphereGeometry = useMemo(
    () => new THREE.SphereGeometry(radius * 1.025, 64, 64),
    [radius]
  );

  const atmosphereMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        uniform vec3 atmosphereColor;
        uniform float atmosphereDensity;
        void main() {
          float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(atmosphereColor, intensity * atmosphereDensity);
        }
      `,
      uniforms: {
        atmosphereColor: { value: new THREE.Color(0x3366ff) },
        atmosphereDensity: { value: 0.5 },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return mat;
  }, []);

  // Night lights shader
  const nightMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform vec3 sunDirection;
        void main() {
          float dayFactor = max(0.0, dot(vNormal, normalize(sunDirection)));
          vec3 dayColor = texture2D(dayMap, vUv).rgb;
          vec3 nightColor = texture2D(nightMap, vUv).rgb;
          vec3 color = mix(nightColor, dayColor, dayFactor);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        dayMap: { value: dayTexture },
        nightMap: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
    });
    return mat;
  }, [dayTexture, nightTexture]);

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return;

    const delta = state.clock.getDelta();
    const elapsed = state.clock.getElapsedTime();

    // Rotate Earth
    groupRef.current.rotation.y += delta * rotationSpeed * 0.01;

    // Update sun direction for day/night cycle
    // Simplified: sun rotates around Earth
    const sunAngle = elapsed * 0.1;
    nightMaterial.uniforms.sunDirection.value.set(
      Math.cos(sunAngle),
      0,
      Math.sin(sunAngle)
    );

    // Clouds rotate slightly faster
    if (groupRef.current.children[1]) {
      groupRef.current.children[1].rotation.y += delta * rotationSpeed * 0.012;
    }
  });

  // Initialize
  useEffect(() => {
    if (groupRef.current && onLoad) {
      onLoad(groupRef.current);
    }
  }, [onLoad]);

  return (
    <group ref={groupRef} rotation={[-tilt * Math.PI / 180, 0, 0]}>
      {/* Earth surface with day/night shader */}
      <mesh
        geometry={earthGeometry}
        material={showNightLights ? nightMaterial : earthMaterial}
        receiveShadow
        castShadow
      />
      {/* Clouds */}
      {showClouds && (
        <mesh
          geometry={cloudGeometry}
          material={cloudMaterial}
        />
      )}
      {/* Atmosphere glow */}
      {showAtmosphere && (
        <mesh
          geometry={atmosphereGeometry}
          material={atmosphereMaterial}
        />
      )}
    </group>
  );
};

// ============================================================================
// SUN COMPONENT
// ============================================================================

interface SunProps {
  radius?: number;
  temperature?: number;
  onLoad?: (light: THREE.PointLight) => void;
}

export const Sun: React.FC<SunProps> = ({
  radius = 20,
  temperature = 5778,
  onLoad,
}) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { clock } = useThree();

  // Blackbody color from temperature
  const color = useMemo(() => {
    return new THREE.Color().setHSL(
      Math.max(0, Math.min(1, (temperature - 2000) / 10000)),
      0.8,
      0.6
    );
  }, [temperature]);

  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 64, 64), [radius]);

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1,
    });
    return mat;
  }, [color]);

  // Corona/glow effect
  const coronaGeometry = useMemo(
    () => new THREE.SphereGeometry(radius * 1.5, 32, 32),
    [radius]
  );

  const coronaMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 coronaColor;
        void main() {
          float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(coronaColor, intensity * 0.3);
        }
      `,
      uniforms: {
        coronaColor: { value: color },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return mat;
  }, [color]);

  // Point light for illumination
  useEffect(() => {
    if (lightRef.current && onLoad) {
      onLoad(lightRef.current);
    }
  }, [onLoad]);

  return (
    <group>
      <mesh geometry={geometry} material={material}>
        <pointLight
          ref={lightRef}
          color={color}
          intensity={3}
          distance={0}
          decay={2}
        />
      </mesh>
      <mesh geometry={coronaGeometry} material={coronaMaterial} />
    </group>
  );
};

// ============================================================================
// ORBIT VISUALIZATION
// ============================================================================

interface OrbitProps {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  argumentOfPeriapsis: number;
  color?: number;
  opacity?: number;
  lineWidth?: number;
  segments?: number;
  showPeriapsis?: boolean;
  showApoapsis?: boolean;
}

export const Orbit: React.FC<OrbitProps> = ({
  semiMajorAxis,
  eccentricity,
  inclination,
  longitudeOfAscendingNode,
  argumentOfPeriapsis,
  color = 0x888888,
  opacity = 0.5,
  lineWidth = 1,
  segments = 360,
  showPeriapsis = false,
  showApoapsis = false,
}) => {
  const pointsRef = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    // Generate orbit points in perifocal frame
    const points: THREE.Vector3[] = [];
    const a = semiMajorAxis;
    const e = eccentricity;
    const p = a * (1 - e * e);

    for (let i = 0; i <= segments; i++) {
      const nu = (i / segments) * 2 * Math.PI;
      const r = p / (1 + e * Math.cos(nu));
      points.push(new THREE.Vector3(
        r * Math.cos(nu),
        r * Math.sin(nu),
        0
      ));
    }

    // Rotation matrices
    const Omega = longitudeOfAscendingNode * Math.PI / 180;
    const i = inclination * Math.PI / 180;
    const omega = argumentOfPeriapsis * Math.PI / 180;

    const cosOmega = Math.cos(Omega);
    const sinOmega = Math.sin(Omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    const cosOmega2 = Math.cos(omega);
    const sinOmega2 = Math.sin(omega);

    // Combined rotation matrix
    pointsRef.current = points.map(v => {
      // R_z(-Omega) * R_x(-i) * R_z(-omega)
      let x = v.x * cosOmega2 - v.y * sinOmega2;
      let y = v.x * sinOmega2 + v.y * cosOmega2;
      let z = v.z;

      const x2 = x;
      const y2 = y * cosI - z * sinI;
      const z2 = y * sinI + z * cosI;

      x = x2 * cosOmega - y2 * sinOmega;
      y = x2 * sinOmega + y2 * cosOmega;
      z = z2;

      return new THREE.Vector3(x, y, z);
    });
  }, [semiMajorAxis, eccentricity, inclination, longitudeOfAscendingNode, argumentOfPeriapsis, segments]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setFromPoints(pointsRef.current);
    return geom;
  }, [pointsRef.current.length]);

  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color,
    opacity,
    transparent: opacity < 1,
    linewidth: lineWidth,
  }), [color, opacity, lineWidth]);

  return (
    <group>
      <primitive object={new THREE.Line(lineGeometry, lineMaterial)} />
      {showPeriapsis && (
        <mesh
          position={pointsRef.current[0]}
          geometry={new THREE.SphereGeometry(semiMajorAxis * 0.01, 8, 8)}
          material={new THREE.MeshBasicMaterial({ color: 0x00ff00 })}
        />
      )}
      {showApoapsis && (
        <mesh
          position={pointsRef.current[Math.floor(segments / 2)]}
          geometry={new THREE.SphereGeometry(semiMajorAxis * 0.01, 8, 8)}
          material={new THREE.MeshBasicMaterial({ color: 0xff0000 })}
        />
      )}
    </group>
  );
};

// ============================================================================
// SATELLITE COMPONENT
// ============================================================================

interface SatelliteProps {
  tleLine1: string;
  tleLine2: string;
  modelScale?: number;
  showOrbit?: boolean;
  showLabel?: boolean;
  onPositionUpdate?: (pos: THREE.Vector3, vel: THREE.Vector3) => void;
}

export const Satellite: React.FC<SatelliteProps> = ({
  tleLine1,
  tleLine2,
  modelScale = 1,
  showOrbit = true,
  showLabel = true,
  onPositionUpdate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  // Simple satellite model (box with solar panels)
  const geometry = useMemo(() => {
    const group = new THREE.Group();

    // Main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 })
    );
    group.add(body);

    // Solar panels
    const panelGeom = new THREE.PlaneGeometry(6, 2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x003366,
      side: THREE.DoubleSide,
      metalness: 0.5,
      roughness: 0.3,
    });

    const panel1 = new THREE.Mesh(panelGeom, panelMat);
    panel1.position.set(-4, 0, 0);
    panel1.rotation.y = Math.PI / 2;
    group.add(panel1);

    const panel2 = new THREE.Mesh(panelGeom, panelMat);
    panel2.position.set(4, 0, 0);
    panel2.rotation.y = -Math.PI / 2;
    group.add(panel2);

    // Scale
    group.scale.setScalar(modelScale * 0.5);

    return group;
  }, [modelScale]);

  // Propagate orbit using SGP4 (simplified - would use worker in production)
  useFrame((state) => {
    if (!meshRef.current) return;

    // This is a placeholder - real implementation would use SGP4 from web worker
    const time = state.clock.getElapsedTime();

    // Simple circular orbit for demo
    const radius = 15;
    meshRef.current.position.set(
      Math.cos(time * 0.5) * radius,
      Math.sin(time * 0.1) * radius * 0.5,
      Math.sin(time * 0.5) * radius
    );

    // Orient to velocity
    meshRef.current.lookAt(
      new THREE.Vector3(
        -Math.sin(time * 0.5) * radius,
        Math.cos(time * 0.1) * radius * 0.5,
        Math.cos(time * 0.5) * radius
      )
    );

    if (onPositionUpdate) {
      onPositionUpdate(meshRef.current.position, new THREE.Vector3());
    }
  });

  return (
    <primitive object={geometry} ref={meshRef} />
  );
};

// ============================================================================
// STAR FIELD (BACKGROUND)
// ============================================================================

interface StarFieldProps {
  starCount?: number;
  radius?: number;
  magnitudeLimit?: number;
  seed?: number;
}

export const StarField: React.FC<StarFieldProps> = ({
  starCount = 10000,
  radius = 1e6,
  magnitudeLimit = 6.5,
  seed = 42,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const magnitudes = new Float32Array(starCount);

    // Seeded random
    let rngState = seed;
    const random = () => {
      rngState = (rngState * 1664525 + 1013904223) % 4294967296;
      return rngState / 4294967296;
    };

    for (let i = 0; i < starCount; i++) {
      // Uniform distribution on sphere
      const u = random();
      const v = random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const r = radius * (0.9 + 0.1 * random());
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star color from temperature (blackbody approximation)
      const temp = 2000 + random() * 30000; // 2000K - 32000K
      const color = new THREE.Color();
      if (temp < 4000) color.setHSL(0.05, 0.8, 0.5);      // Red
      else if (temp < 5500) color.setHSL(0.08, 0.7, 0.6);  // Orange
      else if (temp < 7000) color.setHSL(0.12, 0.5, 0.7);  // Yellow
      else if (temp < 10000) color.setHSL(0.55, 0.3, 0.8); // White
      else color.setHSL(0.6, 0.5, 0.9);                    // Blue

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size based on magnitude
      const mag = random() * magnitudeLimit;
      magnitudes[i] = mag;
      sizes[i] = Math.max(0.5, (magnitudeLimit - mag) * 2);
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('magnitude', new THREE.BufferAttribute(magnitudes, 1));

    return geom;
  }, [starCount, radius, magnitudeLimit, seed]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    depthWrite: false,
  }), []);

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// ============================================================================
// LABEL/ANNOTATION SYSTEM
// ============================================================================

interface LabelProps {
  position: THREE.Vector3;
  text: string;
  fontSize?: number;
  color?: number;
  backgroundColor?: number;
  showBackground?: boolean;
  distanceFadeStart?: number;
  distanceFadeEnd?: number;
  camera?: THREE.Camera;
}

export const Label: React.FC<LabelProps> = ({
  position,
  text,
  fontSize = 14,
  color = 0xffffff,
  backgroundColor = 0x000000,
  showBackground = true,
  distanceFadeStart = 100,
  distanceFadeEnd = 1000,
  camera,
}) => {
  const { camera: sceneCamera, size } = useThree();
  const cam = camera || sceneCamera;
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(true);

  // Check if label is behind camera or too far
  useFrame(() => {
    if (!cam) return;

    const screenPos = position.clone().project(cam);
    const distance = cam.position.distanceTo(position);

    // Behind camera
    if (screenPos.z > 1) {
      setVisible(false);
      return;
    }
    setVisible(true);

    // Distance fade
    if (distance > distanceFadeEnd) {
      setOpacity(0);
    } else if (distance > distanceFadeStart) {
      setOpacity(1 - (distance - distanceFadeStart) / (distanceFadeEnd - distanceFadeStart));
    } else {
      setOpacity(1);
    }
  });

  if (!visible || opacity === 0) return null;

  const screenPos = position.clone().project(cam);
  const x = (screenPos.x * 0.5 + 0.5) * size.width;
  const y = (-screenPos.y * 0.5 + 0.5) * size.height;

  return (
    <Html
      transform
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity,
        transition: 'opacity 0.2s',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          color: `#${color.toString(16).padStart(6, '0')}`,
          backgroundColor: showBackground ? `#${backgroundColor.toString(16).padStart(6, '0')}` : 'transparent',
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'system-ui, sans-serif',
          whiteSpace: 'nowrap',
          textShadow: '0 0 4px #000',
        }}
      >
        {text}
      </div>
    </Html>
  );
};

export default CosmicScene;