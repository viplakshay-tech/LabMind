"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, useGLTF } from "@react-three/drei";

export type HardwarePosition = [number, number, number];

// Reusable color palette for breadboard jumper wires
const WIRE_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#a855f7",
  "#06b6d4",
  "#f43f5e",
];

function getWireColor(
  s: HardwarePosition,
  e: HardwarePosition
) {
  const hash = Math.abs(
    Math.floor(
      (s[0] * 17 +
        s[1] * 31 +
        s[2] * 47 +
        e[0] * 53 +
        e[1] * 71 +
        e[2] * 89) *
        100
    )
  );

  return WIRE_COLORS[hash % WIRE_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  Virtual LED                                                       */
/* ------------------------------------------------------------------ */

export function VirtualLed({
  position,
  active,
  label,
}: {
  position: HardwarePosition;
  active: boolean;
  label: string;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!matRef.current) return;

    if (active) {
      const pulse =
        1.0 + Math.sin(clock.elapsedTime * 6) * 0.12;

      matRef.current.emissiveIntensity =
        3.2 * pulse;

      if (lightRef.current) {
        lightRef.current.intensity =
          1.8 * pulse;
      }
    } else {
      matRef.current.emissiveIntensity = 0;
    }
  });

  const { cylGeom, sphereGeom } = useMemo(() => {
    return {
      cylGeom: new THREE.CylinderGeometry(
        0.1,
        0.11,
        0.12,
        20
      ),
      sphereGeom: new THREE.SphereGeometry(
        0.1,
        20,
        12,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
    };
  }, []);

  const ledMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: active
          ? "#67e8f9"
          : "#475569",
        emissive: active
          ? "#06b6d4"
          : "#000000",
        emissiveIntensity: active
          ? 3.2
          : 0,
        metalness: 0.1,
        roughness: 0.15,
        transparent: true,
        opacity: active
          ? 0.95
          : 0.65,
      }),
    [active]
  );

  return (
    <group position={position}>
      {active && (
        <pointLight
          ref={lightRef}
          color="#22d3ee"
          distance={1.4}
          intensity={1.8}
          decay={2}
          position={[0, 0.14, 0]}
        />
      )}

      <mesh
        geometry={cylGeom}
        material={ledMaterial}
        ref={matRef}
        position={[0, 0.06, 0]}
      />

      <mesh
        geometry={sphereGeom}
        material={ledMaterial}
        position={[0, 0.12, 0]}
      />

      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry
          args={[0.12, 0.12, 0.025, 20]}
        />
        <meshStandardMaterial
          color={
            active
              ? "#22d3ee"
              : "#334155"
          }
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      <mesh
        position={[0.04, -0.1, 0]}
      >
        <cylinderGeometry
          args={[0.012, 0.012, 0.2, 10]}
        />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      <mesh
        position={[-0.04, -0.15, 0]}
      >
        <cylinderGeometry
          args={[0.012, 0.012, 0.3, 10]}
        />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      <Text
        position={[0, -0.32, 0]}
        fontSize={0.085}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtual Resistor                                                  */
/* ------------------------------------------------------------------ */

export function VirtualResistor({
  position,
  active = false,
  label = "220Ω",
}: {
  position: HardwarePosition;
  active?: boolean;
  label?: string;
}) {
  const { bodyGeom, bandGeom } = useMemo(
    () => ({
      bodyGeom:
        new THREE.CylinderGeometry(
          0.062,
          0.062,
          0.36,
          16
        ),
      bandGeom:
        new THREE.CylinderGeometry(
          0.064,
          0.064,
          0.038,
          16
        ),
    }),
    []
  );

  return (
    <group position={position}>
      <group
        rotation={[0, 0, Math.PI / 2]}
      >
        <mesh geometry={bodyGeom}>
          <meshStandardMaterial
            color="#d4c5a9"
            metalness={0.05}
            roughness={0.65}
            emissive={
              active
                ? "#22d3ee"
                : "#000000"
            }
            emissiveIntensity={
              active ? 0.4 : 0
            }
          />
        </mesh>

        <mesh
          geometry={bandGeom}
          position={[0, 0.1, 0]}
        >
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.5}
          />
        </mesh>

        <mesh
          geometry={bandGeom}
          position={[0, 0.02, 0]}
        >
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.5}
          />
        </mesh>

        <mesh
          geometry={bandGeom}
          position={[0, -0.06, 0]}
        >
          <meshStandardMaterial
            color="#78350f"
            roughness={0.5}
          />
        </mesh>

        <mesh
          geometry={bandGeom}
          position={[0, -0.13, 0]}
        >
          <meshStandardMaterial
            color="#d97706"
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
      </group>

      <mesh
        position={[-0.27, 0, 0]}
        rotation={[
          0,
          0,
          Math.PI / 2,
        ]}
      >
        <cylinderGeometry
          args={[0.014, 0.014, 0.2, 10]}
        />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      <mesh
        position={[0.27, 0, 0]}
        rotation={[
          0,
          0,
          Math.PI / 2,
        ]}
      >
        <cylinderGeometry
          args={[0.014, 0.014, 0.2, 10]}
        />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      <Text
        position={[0, -0.14, 0]}
        fontSize={0.065}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtual Switch                                                    */
/* ------------------------------------------------------------------ */

export function VirtualSwitch({
  position,
  value,
  label,
  onToggle,
}: {
  position: HardwarePosition;
  value: number;
  label: string;
  onToggle: () => void;
}) {
  const [hovered, setHovered] =
    useState(false);

  const actuatorRef =
    useRef<THREE.Group>(null);

  const targetZ = value
    ? -0.07
    : 0.07;

  useEffect(() => {
    document.body.style.cursor =
      hovered
        ? "pointer"
        : "auto";

    return () => {
      document.body.style.cursor =
        "auto";
    };
  }, [hovered]);

  useFrame((_, delta) => {
    if (!actuatorRef.current) {
      return;
    }

    actuatorRef.current.position.z =
      THREE.MathUtils.lerp(
        actuatorRef.current.position.z,
        targetZ,
        delta * 14
      );
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <RoundedBox
        args={[0.5, 0.2, 0.36]}
        radius={0.035}
        smoothness={4}
      >
        <meshStandardMaterial
          color={
            value
              ? "#0e2c38"
              : "#18181b"
          }
          emissive={
            value
              ? "#0891b2"
              : "#000000"
          }
          emissiveIntensity={
            value ? 0.8 : 0
          }
          metalness={0.35}
          roughness={0.4}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.101, 0]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[0.16, 0.24]}
        />
        <meshStandardMaterial
          color={
            value
              ? "#065f46"
              : "#450a0a"
          }
          roughness={0.8}
        />
      </mesh>

      <group
        ref={actuatorRef}
        position={[
          0,
          0.14,
          targetZ,
        ]}
      >
        <RoundedBox
          args={[0.16, 0.1, 0.12]}
          radius={0.02}
          smoothness={3}
        >
          <meshStandardMaterial
            color={
              value
                ? "#38bdf8"
                : "#64748b"
            }
            metalness={0.5}
            roughness={0.25}
          />
        </RoundedBox>
      </group>

      <Text
        position={[0, 0.105, -0.11]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.045}
        color={
          value
            ? "#4ade80"
            : "#52525b"
        }
        anchorX="center"
        anchorY="middle"
      >
        ON
      </Text>

      <Text
        position={[0, 0.105, 0.11]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.045}
        color={
          !value
            ? "#f87171"
            : "#52525b"
        }
        anchorX="center"
        anchorY="middle"
      >
        OFF
      </Text>

      <Text
        position={[0, -0.22, 0]}
        fontSize={0.085}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Blender DIP asset mapping                                         */
/* ------------------------------------------------------------------ */

const DIP_GLB_PATHS: Record<
  string,
  string
> = {
  "7486":
    "/assets/hardware/ic/DIP14_7486.glb",
  "7408":
    "/assets/hardware/ic/DIP14_7408.glb",
  "7432":
    "/assets/hardware/ic/DIP14_7432.glb",
  "7400":
    "/assets/hardware/ic/DIP14_7400.glb",
  "7402":
    "/assets/hardware/ic/DIP14_7402.glb",
  "7404":
    "/assets/hardware/ic/DIP14_7404.glb",
  "74153":
    "/assets/hardware/ic/DIP16_74153.glb",
};

function normalizePartNumber(
  partNumber: string
) {
  return partNumber
    .replace(/^SN74/i, "")
    .trim();
}

function getDipGlbPath(
  partNumber: string
) {
  return DIP_GLB_PATHS[
    normalizePartNumber(partNumber)
  ];
}

/* ------------------------------------------------------------------ */
/*  Procedural fallback DIP IC                                        */
/* ------------------------------------------------------------------ */

function ProceduralDipFallback({
  position,
  partNumber,
  description,
  pinCount = 14,
}: {
  position: HardwarePosition;
  partNumber: string;
  description?: string;
  pinCount?: number;
}) {
  const pinsPerSide =
    Math.ceil(pinCount / 2);

  const widthX = 1.48;
  const heightY = 0.26;
  const depthZ = 0.76;

  return (
    <group position={position}>
      <RoundedBox
        args={[
          widthX,
          heightY,
          depthZ,
        ]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#151922"
          metalness={0.15}
          roughness={0.7}
        />
      </RoundedBox>

      <mesh
        position={[
          -widthX / 2 + 0.01,
          heightY / 2,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.07,
            0.07,
            0.03,
            16,
            1,
            false,
            0,
            Math.PI,
          ]}
        />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      <mesh
        position={[
          -widthX / 2 + 0.18,
          heightY / 2 + 0.002,
          -depthZ / 2 + 0.14,
        ]}
      >
        <cylinderGeometry
          args={[
            0.032,
            0.032,
            0.005,
            12,
          ]}
        />
        <meshStandardMaterial
          color="#020617"
          roughness={0.9}
        />
      </mesh>

      <Text
        position={[
          0,
          heightY / 2 + 0.004,
          -0.04,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.13}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        {partNumber}
      </Text>

      {description && (
        <Text
          position={[
            0,
            heightY / 2 + 0.004,
            0.15,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.055}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {description}
        </Text>
      )}

      {Array.from({
        length: pinCount,
      }).map((_, index) => {
        const leftSide =
          index < pinsPerSide;

        const sideIndex = leftSide
          ? index
          : index - pinsPerSide;

        const z =
          -0.28 +
          sideIndex *
            (0.56 /
              Math.max(
                pinsPerSide - 1,
                1
              ));

        const xPos = leftSide
          ? -widthX / 2
          : widthX / 2;

        const xDir = leftSide
          ? -1
          : 1;

        return (
          <group
            key={index}
            position={[
              xPos,
              -0.06,
              z,
            ]}
          >
            <mesh
              position={[
                xDir * 0.055,
                0,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.11,
                  0.022,
                  0.042,
                ]}
              />
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>

            <mesh
              position={[
                xDir * 0.105,
                -0.06,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.022,
                  0.12,
                  0.042,
                ]}
              />
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>

            <Text
              position={[
                xDir * 0.16,
                0,
                0,
              ]}
              rotation={[
                0,
                leftSide
                  ? Math.PI / 2
                  : -Math.PI / 2,
                0,
              ]}
              fontSize={0.035}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {index + 1}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Blender GLB DIP model                                             */
/* ------------------------------------------------------------------ */

function BlenderDipModel({
  position,
  partNumber,
  description,
  pinCount,
}: {
  position: HardwarePosition;
  partNumber: string;
  description?: string;
  pinCount: number;
}) {
  const glbPath =
    getDipGlbPath(partNumber);

  if (!glbPath) {
    return (
      <ProceduralDipFallback
        position={position}
        partNumber={partNumber}
        description={description}
        pinCount={pinCount}
      />
    );
  }

  const { scene } =
    useGLTF(glbPath);

  const model = useMemo(
    () => scene.clone(true),
    [scene]
  );

  const modelScale: [
    number,
    number,
    number
  ] = [
    0.03938,
    0.23307,
    0.07429,
  ];

  return (
    <group
      position={position}
      rotation={[
        0,
        Math.PI / 2,
        0,
      ]}
      scale={modelScale}
    >
      <primitive object={model} />

      {description && (
        <Text
          position={[
            0,
            3.56,
            5.0,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.055}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {description}
        </Text>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Generic hardware asset error boundary                             */
/* ------------------------------------------------------------------ */

class DipAssetErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
  },
  { hasError: boolean }
> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(): {
    hasError: boolean;
  } {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo
  ) {
    console.warn(
      "LabMind hardware GLB load failed; using procedural fallback.",
      {
        error,
        info,
      }
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Virtual DIP IC                                                    */
/* ------------------------------------------------------------------ */

export function VirtualDipIc({
  position,
  partNumber,
  description,
  pinCount = 14,
}: {
  position: HardwarePosition;
  partNumber: string;
  description?: string;
  pinCount?: number;
}) {
  const fallback = (
    <ProceduralDipFallback
      position={position}
      partNumber={partNumber}
      description={description}
      pinCount={pinCount}
    />
  );

  const glbPath =
    getDipGlbPath(partNumber);

  if (!glbPath) {
    return fallback;
  }

  return (
    <DipAssetErrorBoundary
      fallback={fallback}
    >
      <Suspense fallback={fallback}>
        <BlenderDipModel
          position={position}
          partNumber={partNumber}
          description={description}
          pinCount={pinCount}
        />
      </Suspense>
    </DipAssetErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Procedural Breadboard fallback                                    */
/* ------------------------------------------------------------------ */

function ProceduralBreadboard() {
  const holes = useMemo(() => {
    const result: HardwarePosition[] = [];

    for (let row = 0; row < 10; row += 1) {
      for (
        let column = 0;
        column < 24;
        column += 1
      ) {
        result.push([
          -2.3 + column * 0.2,
          0.12,
          -0.75 + row * 0.17,
        ]);
      }
    }

    return result;
  }, []);

  const holeGeom = useMemo(
    () =>
      new THREE.CylinderGeometry(
        0.022,
        0.022,
        0.018,
        10
      ),
    []
  );

  const holeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#05070d",
        metalness: 0.4,
        roughness: 0.5,
      }),
    []
  );

  return (
    <group>
      <RoundedBox
        args={[5.4, 0.24, 2.2]}
        radius={0.08}
        smoothness={6}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#ece8e1"
          metalness={0.04}
          roughness={0.7}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.12, 0.015]}
      >
        <boxGeometry
          args={[
            5.0,
            0.015,
            0.08,
          ]}
        />
        <meshStandardMaterial
          color="#d4cec4"
          roughness={0.9}
        />
      </mesh>

      {[-1.08, 1.08].map(
        (z) => (
          <group
            key={z}
            position={[
              0,
              0.12,
              z,
            ]}
          >
            <mesh
              position={[
                0,
                0,
                0.02,
              ]}
            >
              <boxGeometry
                args={[
                  4.8,
                  0.008,
                  0.01,
                ]}
              />
              <meshStandardMaterial
                color="#ded7cd"
                roughness={0.9}
              />
            </mesh>

            <mesh
              position={[
                0,
                0,
                -0.02,
              ]}
            >
              <boxGeometry
                args={[
                  4.8,
                  0.008,
                  0.01,
                ]}
              />
              <meshStandardMaterial
                color="#ded7cd"
                roughness={0.9}
              />
            </mesh>
          </group>
        )
      )}

      {[
        "a",
        "b",
        "c",
        "d",
        "e",
      ].map((letter, i) => (
        <Text
          key={letter}
          position={[
            -2.55,
            0.125,
            -0.75 +
              i * 0.17,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.06}
          color="#64748b"
        >
          {letter}
        </Text>
      ))}

      {[
        "f",
        "g",
        "h",
        "i",
        "j",
      ].map((letter, i) => (
        <Text
          key={letter}
          position={[
            -2.55,
            0.125,
            0.1 +
              i * 0.17,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          fontSize={0.06}
          color="#64748b"
        >
          {letter}
        </Text>
      ))}

      {[1, 5, 10, 15, 20].map(
        (col) => (
          <Text
            key={col}
            position={[
              -2.3 +
                (col - 1) *
                  0.2,
              0.125,
              -0.94,
            ]}
            rotation={[
              -Math.PI / 2,
              0,
              0,
            ]}
            fontSize={0.055}
            color="#64748b"
          >
            {col}
          </Text>
        )
      )}

      <VirtualPowerRail
        position={[
          0,
          0.13,
          -1.02,
        ]}
        label="+VCC"
        positive
      />

      <VirtualPowerRail
        position={[
          0,
          0.13,
          1.02,
        ]}
        label="GND"
        positive={false}
      />

      {holes.map(
        (pos, index) => (
          <mesh
            key={index}
            position={pos}
            geometry={holeGeom}
            material={holeMaterial}
          />
        )
      )}

      <Text
        position={[
          0,
          0.125,
          0.88,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.08}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        LABMIND SYNTHETIC HARDWARE LAB
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Blender Breadboard Digital Twin                                  */
/* ------------------------------------------------------------------ */

function BlenderBreadboardModel() {
  const { scene } = useGLTF(
    "/assets/hardware/Breadboard_24x10.glb"
  );

  const model = useMemo(
    () => scene.clone(true),
    [scene]
  );

  /*
   * Blender asset dimensions:
   *   X ≈ 65.00 mm
   *   Y ≈ 32.00 mm
   *   Z ≈ 7.56 mm
   *
   * Existing Smart Lab breadboard:
   *   X ≈ 5.40 units
   *   Y ≈ 0.24 units
   *   Z ≈ 2.20 units
   *
   * Blender Z becomes Smart Lab Y.
   * Blender Y becomes Smart Lab Z.
   *
   * The -90° X rotation also places the socket surface
   * at approximately the same Y level as the existing
   * virtual wiring grid.
   */

  const modelScale: [
    number,
    number,
    number
  ] = [
    5.4 / 65.0,
    2.2 / 32.0,
    0.24 / 7.56,
  ];

  return (
    <group
      position={[
        0,
        -0.078,
        0,
      ]}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      scale={modelScale}
    >
      <primitive object={model} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtual Breadboard                                                */
/* ------------------------------------------------------------------ */

export function VirtualBreadboard() {
  return (
    <DipAssetErrorBoundary
      fallback={
        <ProceduralBreadboard />
      }
    >
      <Suspense
        fallback={
          <ProceduralBreadboard />
        }
      >
        <BlenderBreadboardModel />
      </Suspense>
    </DipAssetErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtual Wire                                                      */
/* ------------------------------------------------------------------ */

export function VirtualWire({
  start,
  end,
  active = false,
}: {
  start: HardwarePosition;
  end: HardwarePosition;
  active?: boolean;
}) {
  const { curve, color } =
    useMemo(() => {
      const maxY = Math.max(
        start[1],
        end[1]
      );

      const rise = 0.16;

      const p1 =
        new THREE.Vector3(
          ...start
        );

      const p2 =
        new THREE.Vector3(
          start[0],
          maxY + rise,
          start[2]
        );

      const p3 =
        new THREE.Vector3(
          end[0],
          maxY + rise,
          end[2]
        );

      const p4 =
        new THREE.Vector3(
          ...end
        );

      const c =
        new THREE.CatmullRomCurve3(
          [p1, p2, p3, p4],
          false,
          "catmullrom",
          0.15
        );

      return {
        curve: c,
        color: getWireColor(
          start,
          end
        ),
      };
    }, [start, end]);

  const tubeGeom = useMemo(
    () =>
      new THREE.TubeGeometry(
        curve,
        20,
        0.018,
        8,
        false
      ),
    [curve]
  );

  return (
    <mesh geometry={tubeGeom}>
      <meshStandardMaterial
        color={
          active
            ? "#22d3ee"
            : color
        }
        emissive={
          active
            ? "#22d3ee"
            : "#000000"
        }
        emissiveIntensity={
          active ? 1.6 : 0
        }
        metalness={0.15}
        roughness={0.5}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtual Power Rail                                                */
/* ------------------------------------------------------------------ */

export function VirtualPowerRail({
  position,
  label,
  positive = true,
}: {
  position: HardwarePosition;
  label: string;
  positive?: boolean;
}) {
  const contacts = useMemo(() => {
    const arr: number[] = [];

    for (let i = 0; i < 12; i++) {
      arr.push(
        -2.2 + i * 0.4
      );
    }

    return arr;
  }, []);

  return (
    <group position={position}>
      <mesh
        position={[
          0,
          -0.015,
          0,
        ]}
      >
        <boxGeometry
          args={[
            4.9,
            0.02,
            0.1,
          ]}
        />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.8}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.005,
          positive
            ? -0.035
            : 0.035,
        ]}
      >
        <boxGeometry
          args={[
            4.8,
            0.01,
            0.015,
          ]}
        />
        <meshStandardMaterial
          color={
            positive
              ? "#ef4444"
              : "#1d4ed8"
          }
        />
      </mesh>

      {contacts.map(
        (x, i) => (
          <mesh
            key={i}
            position={[
              x,
              -0.005,
              0,
            ]}
          >
            <boxGeometry
              args={[
                0.038,
                0.01,
                0.038,
              ]}
            />
            <meshStandardMaterial
              color="#94a3b8"
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>
        )
      )}

      <Text
        position={[
          2.65,
          0.02,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.07}
        color={
          positive
            ? "#ef4444"
            : "#3b82f6"
        }
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
}