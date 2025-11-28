import * as THREE from 'three';

export function initBackground() {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;

  // Geometry
  const barSize = 0.12;
  const thickness = 0.03;
  const shape = new THREE.Shape();
  const s = barSize / 2;
  const t = thickness / 2;
  shape.moveTo(-s, t);
  shape.lineTo(-t, t);
  shape.lineTo(-t, s);
  shape.lineTo(t, s);
  shape.lineTo(t, t);
  shape.lineTo(s, t);
  shape.lineTo(s, -t);
  shape.lineTo(t, -t);
  shape.lineTo(t, -s);
  shape.lineTo(-t, -s);
  shape.lineTo(-t, -t);
  shape.lineTo(-s, -t);
  shape.lineTo(-s, t);
  const geometry = new THREE.ShapeGeometry(shape);

  const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Base white, we tint with instance color

  let mesh: THREE.InstancedMesh;
  const dummy = new THREE.Object3D();
  const mouse = new THREE.Vector2(-1000, -1000);

  // Colors
  const black = new THREE.Color(0x0f172a);
  const lime = new THREE.Color(0xbef264);

  function createGrid() {
    if (mesh) {
      scene.remove(mesh);
      mesh.dispose();
    }

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2;
    const viewWidth = frustumSize * aspect;
    const viewHeight = frustumSize;

    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();

    const spacing = 0.15;
    const cols = Math.ceil(viewWidth / spacing) + 2;
    const rows = Math.ceil(viewHeight / spacing) + 2;
    const count = cols * rows;

    mesh = new THREE.InstancedMesh(geometry, material, count);

    let i = 0;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        // Set random color
        if (Math.random() > 0.95) {
          mesh.setColorAt(i, lime);
        } else {
          mesh.setColorAt(i, black);
        }
        i++;
      }
    }

    scene.add(mesh);
  }

  createGrid();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    createGrid();
  });

  window.addEventListener('mousemove', (e) => {
    const aspect = window.innerWidth / window.innerHeight;
    mouse.x = (e.clientX / window.innerWidth) * 2 * aspect - aspect;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!mesh) return;

    const time = Date.now() * 0.001;
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2;
    const viewWidth = frustumSize * aspect;
    const viewHeight = frustumSize;
    const spacing = 0.15;
    const cols = Math.ceil(viewWidth / spacing) + 2;
    const rows = Math.ceil(viewHeight / spacing) + 2;

    let i = 0;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const posX = (x - cols / 2) * spacing;
        const posY = (y - rows / 2) * spacing;

        const dist = Math.sqrt(Math.pow(posX - mouse.x, 2) + Math.pow(posY - mouse.y, 2));

        let rotation = 0;
        let scale = 1;

        // Mouse interaction
        if (dist < 0.6) {
          rotation = (1 - dist / 0.6) * Math.PI;
          scale = 1 + (1 - dist / 0.6) * 0.8;
        }

        // Idle wave
        rotation += Math.sin(posX * 3 + time) * 0.1 + Math.cos(posY * 3 + time) * 0.1;

        dummy.position.set(posX, posY, 0);
        dummy.rotation.set(0, 0, rotation);
        dummy.scale.set(scale, scale, 1);
        dummy.updateMatrix();

        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animate();
}
