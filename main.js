const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff);

let diffuser;

function animate() {
  requestAnimationFrame(animate);
  if (diffuser) {
    diffuser.rotation.y = Math.sin(Date.now() / 1000) * 0.25;
  }
  renderer.render(scene, camera);
}

const renderDiffuser = (width, height, depths) => {
  if (diffuser) {
    scene.remove(diffuser);
  }

  diffuser = new THREE.Group();

  for (let y = 0; y < height; y ++) {
    for (let x = 0; x < width; x ++) {
      const z = depths[(y * width) + x];
      const material = new THREE.MeshLambertMaterial({ color: Math.random() * Math.pow(16,6) });
      const geometry = new THREE.BoxGeometry(1, 1, z);
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = x - (width/2);
      cube.position.y = y - (height/2);
      cube.position.z = z/2;
      diffuser.add(cube);
    }
  }

  scene.add(diffuser);
}



scene.add(light);
light.position.y = 20;
light.position.z = 20;
camera.position.z = 30;

animate();


const computeDepths = (width, height, values, minDiffusedWavelength, quantization) =>
  values.map(
    (v) => Math.round(
      (v * minDiffusedWavelength)
      /
      (
        (+width * +height + 1)
        *
        2
        *
        quantization
      )
    )
    * quantization
  );


const getWavelengthCM = (hz) => 343/(hz/100)

let minDiffusedHz = 2500;
let width = 13;
let height = 12;

const update = () => {
  renderDiffuser(
    width,
    height,
    computeDepths(
      width,
      height,
      sequences[`${width},${height}`],
      getWavelengthCM(minDiffusedHz),
      1
    )
  );
}

$("#hz").change(() => {
  minDiffusedHz = (+$("#hz").val()) * 1000;
  update();
});

$("#hz").val(2.5);

Object.keys(sequences).forEach((k) => {
  console.log(k);
  const [w, h] = k.split(',');
  const button = $(`<button>${k}</button>`);
  $("#opts").append(button);
  button.click(() => {
    width = w;
    height = h;
    update();
  });
});