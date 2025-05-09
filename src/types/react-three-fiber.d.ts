
import * as THREE from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

// Extend JSX.IntrinsicElements to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: ReactThreeFiber.Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      sphereGeometry: ReactThreeFiber.BufferGeometryNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      octahedronGeometry: ReactThreeFiber.BufferGeometryNode<THREE.OctahedronGeometry, typeof THREE.OctahedronGeometry>;
      meshStandardMaterial: ReactThreeFiber.MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshBasicMaterial: ReactThreeFiber.MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      primitive: ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
      pointLight: ReactThreeFiber.Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
      color: ReactThreeFiber.Node<THREE.Color, typeof THREE.Color>;
      line: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>;
      bufferGeometry: ReactThreeFiber.BufferGeometryNode<THREE.BufferGeometry, typeof THREE.BufferGeometry>;
      lineBasicMaterial: ReactThreeFiber.MaterialNode<THREE.LineBasicMaterial, typeof THREE.LineBasicMaterial>;
    }
  }
}
