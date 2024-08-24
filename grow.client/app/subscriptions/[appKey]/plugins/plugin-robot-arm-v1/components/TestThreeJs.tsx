import React, { useCallback, useRef, useState, useLayoutEffect, useEffect } from "react";
import { Canvas, useFrame } from '@react-three/fiber'
import { Group, Mesh, Line, Vector3 } from "three";
import { Slider, TextField } from "@mui/material";
import { IInverseKinematics, CalculateInverseKinematics } from "./InverseKinematics";

const degressToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;
const scaleToDegrees = (value: number) => (value-50) / 100 * 360;

export default function TestThreeJs({l1, l2, l3, x, y, z, onTargetChange}) {

  const reach_radius = l1 + l2;

  const target = { x, y, z };

  // const [angles, setAngles] = useState({ j1: degressToRadians(-90), j2: degressToRadians(90), j3: degressToRadians(0) });
  const [world, setWorld] = useState<{ rx: number; ry: number; rz: number }>({ rx: 75/360*100, ry: 0, rz: 30/360*100, });

  const [scaleTarget, setScaleTarget] = useState<{x:number, y:number, z:number}>({ x: x/(reach_radius/100), y: (reach_radius/2)/(reach_radius/100), z: z/(reach_radius/100) });

  const [ik, setIk] = useState<IInverseKinematics>(
    CalculateInverseKinematics(l1, l2, l3, target)
  );

  const setScaleTargetX = useCallback((x: number) => setScaleTarget((t) => ({ ...t, x })), []);
  const setScaleTargetY = useCallback((y: number) => setScaleTarget((t) => ({ ...t, y })), []);
  const setScaleTargetZ = useCallback((z: number) => setScaleTarget((t) => ({ ...t, z })), []);

  const setTargetX = useCallback((x: number) => onTargetChange({ ...target, x }), []);
  const setTargetY = useCallback((y: number) => onTargetChange({ ...target, y }), []);
  const setTargetZ = useCallback((z: number) => onTargetChange({ ...target, z }), []);

  const setWorldRx = useCallback((rx: string) => setWorld((w) => ({ ...w, rx: Number(rx) })), []);
  const setWorldRy = useCallback((ry: string) => setWorld((w) => ({ ...w, ry: Number(ry) })), []);
  const setWorldRz = useCallback((rz: string) => setWorld((w) => ({ ...w, rz: Number(rz) })), []);

  useEffect(() => {
    if (
      isNaN(Number(target.x)) ||
      isNaN(Number(target.y)) ||
      isNaN(Number(target.z))
    )
      return;

    setIk(CalculateInverseKinematics(l1, l2, l3, target));
  }, [l1, l2, l3, target.x, target.y, target.z]);

  return (
    <>
      <Controls
        {...{
          l1,
          l2,
          l3,
          target,
          scaleTarget,
          world,
          ik,
          setScaleTargetX,
          setScaleTargetY,
          setScaleTargetZ,
          setTargetX,
          setTargetY,
          setTargetZ,
          setWorldRx,
          setWorldRy,
          setWorldRz,
        }}
      />
      <Simulation {...{l1, l2, l3, world, ik}} />
    </>
  );
}

interface ISimulationProps {
  l1: number;
  l2: number;
  l3: number;
  world: { rx: number; ry: number; rz: number };
  ik: IInverseKinematics;
}

function Simulation({
  l1,
  l2,
  l3,
  world,
  ik,
}: ISimulationProps) {

  const reach_radius = l1 + l2;

  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      {/* <group rotation={[-Math.PI / 2, -Math.PI / 8, -Math.PI / 8]}> */}
      <group
        // rotation={[-Math.PI / 2.5, 0, Math.PI / 16]}
        // rotation={[-Math.PI / 2.5, 0, -Math.PI / 8]}
        rotation={[
          degressToRadians(-scaleToDegrees(world.rx)),
          degressToRadians(-scaleToDegrees(world.ry)),
          degressToRadians(-scaleToDegrees(world.rz)),
        ]}
        position={[0, 0, 0]}
      >
        <group scale={1 / 75}>
          <group rotation={[0, 0, ik.j0]}>
            <Joint angle={-ik.j1}>
              <UpperArm length={l1} />
              <Joint position={[l1, 0, 0]} angle={ik.j2}>
                <UpperArm length={l2} />
                <Joint position={[l2, 0, 0]} angle={ik.j3}>
                  <PrintHead length={l3}/>
                </Joint>
              </Joint>
            </Joint>
          </group>

          <mesh>
            <circleGeometry args={[reach_radius, 50]} />
            <meshBasicMaterial
              color={"dimgray"}
              transparent={true}
              opacity={0.75}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[reach_radius, 50, 50]} />
            <meshBasicMaterial
              color={"white"}
              transparent={true}
              opacity={0.2}
            />
          </mesh>

          <ReferenceLine
            start={[0, 0, 0]}
            end={[ik.target_x, ik.target_y, ik.target_z]}
            color={"gray"}
          />
          <ReferenceLine
            start={[0, 0, 0]}
            end={[ik.target_x, ik.target_y, ik.target_z2]}
            color={"gray"}
          />
        </group>

        <mesh>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial color={"white"} />
        </mesh>
        <Axis start={[0, 0, 0]} end={[1, 0, 0]} color={"red"} />
        <Axis start={[0, 0, 0]} end={[0, 1, 0]} color={"green"} />
        <Axis start={[0, 0, 0]} end={[0, 0, 1]} color={"blue"} />
      </group>
    </Canvas>
  );
}

function Joint(props) {
  // This reference will give us direct access to the mesh
  const groupRef = useRef<Group>();
  const meshRef = useRef<Mesh>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    // if (groupRef?.current) {
    //   // console.log(delta);
    //   groupRef.current.rotation.y += delta / 2;
    // }
    if (groupRef?.current) {
      // console.log(delta);
      groupRef.current.rotation.y = props.angle;
    }
  });
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <group ref={groupRef} {...props}>
      {props.children}
    </group>
  );
}

function UpperArm(props) {
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[20, 20, 60, 32]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
      <mesh position={[props.length/2, 0, 0]}>
        <boxGeometry args={[props.length, 20, 20]} />
        <meshStandardMaterial color={"gray"} />
      </mesh>
    </group>
  );
}

function PrintHead(props) {
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[20, 20, 40, 32]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
      <mesh position={[props.length / 2, 0, 0]}>
        <boxGeometry args={[props.length, 15, 15]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
    </group>
  );
}

function Axis({ start, end, color }) {
  const ref = useRef<any>();

  useLayoutEffect(() => {
    if (!ref.current || !ref.current.geometry) return;
    ref.current.geometry.setFromPoints(
      [start, end].map((point) => new Vector3(...point))
    );
  }, [start, end]);

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineDashedMaterial color={color} scale={1} linewidth={1} dashSize={1} gapSize={3} />
    </line>
  );
}

function ReferenceLine({ start, end, color }) {
  const ref = useRef<any>();

  useLayoutEffect(() => {
    if (!ref.current || !ref.current.geometry) return;
    ref.current.geometry.setFromPoints(
      [start, end].map((point) => new Vector3(...point))
    );
  }, [start, end]);

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineDashedMaterial color={color} scale={1} linewidth={1} dashSize={1} gapSize={3} />
    </line>
  );
}

interface IControlProps {
  l1: number;
  l2: number;
  l3: number;
  target: { x: number; y: number; z: number };
  scaleTarget: { x: number; y: number; z: number };
  world: { rx: number; ry: number; rz: number };
  ik: IInverseKinematics;
  setScaleTargetX: (x: number) => void;
  setScaleTargetY: (y: number) => void;
  setScaleTargetZ: (z: number) => void;
  setTargetX: (x: number) => void;
  setTargetY: (y: number) => void;
  setTargetZ: (z: number) => void;
  setWorldRx: (rx: string) => void;
  setWorldRy: (ry: string) => void;
  setWorldRz: (rz: string) => void;
}

function Controls({
  l1,
  l2,
  l3,
  target,
  scaleTarget,
  world,
  ik,
  setScaleTargetX,
  setScaleTargetY,
  setScaleTargetZ,
  setTargetX,
  setTargetY,
  setTargetZ,
  setWorldRx,
  setWorldRy,
  setWorldRz,
}: IControlProps) {

  const reach_radius = l1 + l2;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 50,
        width: 400,
        height: "calc(100vh - 40px)",
        padding: 16,
        border: "1px solid gray",
        zIndex: 100,
        backgroundColor: "black",
        color: "white",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ flex: 3 }}>
          <Slider
            value={scaleTarget.x}
            scale={(value) => value * 3}
            onChange={(e) => {
              setTargetX((Number(e.target.value) * reach_radius) / 100);
              setScaleTargetX(e.target.value);
            }}
            valueLabelDisplay="auto"
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            type="number"
            label="X"
            value={target.x}
            onChange={(e) => {
              setTargetX(Number(e.target.value));
              setScaleTargetX(Number(e.target.value) / reach_radius / 100);
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 3 }}>
          <Slider
            value={scaleTarget.y}
            scale={(value) => (value * reach_radius) / 100 - reach_radius / 2}
            onChange={(e) => {
              setTargetY(
                (Number(e.target.value) * reach_radius) / 100 - reach_radius / 2
              );
              setScaleTargetY(e.target.value);
            }}
            valueLabelDisplay="auto"
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            label="Y"
            value={target.y}
            onChange={(e) => {
              setTargetY(Number(e.target.value));
              setScaleTargetY(
                (Number(e.target.value) + reach_radius / 2) /
                  (reach_radius / 100)
              );
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 3 }}>
          <Slider
            value={scaleTarget.z}
            scale={(value) => (value * reach_radius) / 100}
            onChange={(e) => {
              setTargetZ((Number(e.target.value) * reach_radius) / 100);
              setScaleTargetZ(e.target.value);
            }}
            valueLabelDisplay="auto"
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            type="number"
            label="Z"
            value={target.z}
            onChange={(e) => {
              setTargetZ(Number(e.target.value));
              setScaleTargetZ(Number(e.target.value) / reach_radius / 100);
            }}
          />
        </div>
      </div>
      <div>
        <Slider
          value={world.rz}
          scale={(value) => Math.round((360 / 100) * value)}
          onChange={(e) => setWorldRz(e.target.value)}
          valueLabelDisplay="auto"
        />
      </div>
      <div>
        <Slider
          value={world.rx}
          scale={(value) => Math.round((360 / 100) * value)}
          onChange={(e) => setWorldRx(e.target.value)}
          valueLabelDisplay="auto"
        />
      </div>
      <div>
        <Slider
          value={world.ry}
          scale={(value) => Math.round((360 / 100) * value)}
          onChange={(e) => setWorldRy(e.target.value)}
          valueLabelDisplay="auto"
        />
      </div>

      <div style={{ fontSize: 16 }}>
        {Object.entries(ik).map(([key, value]) => {
          const angleKeys = [
            "j0",
            "j1",
            "j2",
            "j3",
            "alpha1",
            "alpha2",
            "beta1",
            "gamma1",
            "gamma2",
            "lambda",
          ];
          return (
            <div key={key}>
              {key}:{" "}
              {angleKeys.indexOf(key) > -1
                ? Math.round(radiansToDegrees(value) * 100) / 100
                : Math.round(value * 100) / 100}
            </div>
          );
        })}
      </div>
    </div>
  );
}