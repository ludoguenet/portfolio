import * as THREE from 'three';

export function initBackground() {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  // Use a perspective camera for the retro grid effect
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 10);
  camera.lookAt(0, 0, 0);

  // Create the grid
  const gridSize = 60;
  const gridDivisions = 60;
  // Using black for the grid lines to contrast with the white background
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
  scene.add(gridHelper);

  // Create a curved effect for the grid (optional, but adds to the "retro" feel)
  // For a simple retro grid, a flat plane is often enough, but let's animate it.

  // We'll actually create a custom grid using line segments to have more control if needed,
  // but GridHelper is very efficient. Let's stick to GridHelper for now and animate it.
  // To make it "infinite", we can move it towards the camera and reset.

  // Let's create two grids to loop them
  const grid2 = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
  grid2.position.z = -gridSize;
  scene.add(grid2);

  const speed = 2.5;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    // const time = Date.now() * 0.001;

    // Move grids forward
    gridHelper.position.z += speed * 0.01;
    grid2.position.z += speed * 0.01;

    // Reset position to create infinite loop
    if (gridHelper.position.z >= gridSize) {
      gridHelper.position.z = grid2.position.z - gridSize;
    }
    if (grid2.position.z >= gridSize) {
      grid2.position.z = gridHelper.position.z - gridSize;
    }

    renderer.render(scene, camera);
  }

  animate();
}
