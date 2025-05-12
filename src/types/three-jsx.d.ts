
import { Object3DNode } from "@react-three/fiber";
import { ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
      sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      octahedronGeometry: Object3DNode<THREE.OctahedronGeometry, typeof THREE.OctahedronGeometry>;
      planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      torusGeometry: Object3DNode<THREE.TorusGeometry, typeof THREE.TorusGeometry>;
      meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshPhysicalMaterial: Object3DNode<THREE.MeshPhysicalMaterial, typeof THREE.MeshPhysicalMaterial>;
      meshPhongMaterial: Object3DNode<THREE.MeshPhongMaterial, typeof THREE.MeshPhongMaterial>;
      meshBasicMaterial: Object3DNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      lineBasicMaterial: Object3DNode<THREE.LineBasicMaterial, typeof THREE.LineBasicMaterial>;
      primitive: ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
      color: ReactThreeFiber.Object3DNode<THREE.Color, typeof THREE.Color>;
      line: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>;
    }
  }
}
