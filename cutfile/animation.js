const animWidth = 500;
const animHeight = 500;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  animWidth / animHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(animWidth, animHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap

document.getElementById('threedee').appendChild(renderer.domElement);

let diffuser;

function animate() {
  requestAnimationFrame(animate);
  if (diffuser) {
    diffuser.rotation.y = Math.sin(Date.now() / 1000) * 0.5;
  }
  renderer.render(scene, camera);
}

const renderDiffuser = (width, height, wellWidth, depths) => {
  const downscale = 10;

  if (diffuser) {
    scene.remove(diffuser);
  }

  diffuser = new THREE.Group();

  for (let y = 0; y < height; y ++) {
    for (let x = 0; x < width; x ++) {
      const z = depths[(y * width) + x] / downscale;
      const material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x222222 });
      const geometry = new THREE.BoxGeometry(
        wellWidth / downscale,
        wellWidth / downscale,
        z);
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.x = (x - (width/2)) * wellWidth / downscale;
      cube.position.y = (y - (height/2)) * wellWidth / downscale;
      cube.position.z = z/2;
      diffuser.add(cube);
    }
  }

  scene.add(diffuser);
}

hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
hemiLight.color.setHSL( 0.6, 0, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 0, 0.75 );
hemiLight.position.set( 0, 200, 0 );
scene.add( hemiLight );



const pointlight = new THREE.PointLight(0xffffff);

pointlight.position.x = 50;
pointlight.position.y = 100;
pointlight.position.z = 100;
scene.add(pointlight);


camera.position.y = -10;
camera.position.z = 200;
camera.rotation.x = 0.1

animate();