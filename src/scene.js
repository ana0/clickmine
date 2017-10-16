var seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
var strippedSeed = seed.substring(2, seed.length);
var numClicks = 0;
var seedInt = 0;
var camera, scene, renderer;
var dirtLayers = [];
var maxMask = 5;
var darkness = 255;

detectMetaMask();
init();

canvas = document.getElementById('mainCanvas')

canvas.addEventListener('click', click, false);

animate();

function detectMetaMask() {
  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
      console.log('Found MetaMasks')
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    // Now you can start your app & access web3 freely:
  })
}

function getSeed(seedInt) {
  if (seedInt >= strippedSeed.length) { 
    console.log('resetSeedInt')
    seedInt = 0;
  } else {
    seedInt += 1;
  }
  return `0x${strippedSeed.charAt(seedInt)}`;
}

function random(min, max) {
  var x = Math.abs(Math.sin(getSeed(seedInt)));
  return Math.floor(x * (max - min) + min);
}

function getTexture(label, identfier) {
  return new Promise ((resolve, reject) => {
    const onLoad = (texture) => resolve (texture);
    const onError = (event) => reject (event);
    return new THREE.TextureLoader().load(
      `assets/${label}${identfier}.jpg`, onLoad, () => {}, onError);
  })
}

function makeGroundMaterial(texture, alpha, geometry) {
  var material = new THREE.MeshBasicMaterial({
    color: `rgb(${darkness}, ${darkness}, ${darkness})`,
    side: THREE.FrontSide,
    depthTest: false,
    transparent: true,
    map: texture,
    alphaMap: alpha
  });
  console.log(darkness);
  var mesh = new THREE.Mesh( geometry, material );
  //mesh.position.y = 5 * 0.25;
  mesh.rotation.x = - Math.PI / 2;
  return mesh;
}

function genQuad(label, identfier, zIndex) {
  var geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
  return getTexture(label, identfier)
  .then(texture => {
    return getTexture("Mask", 0)
    .then((alpha) => {
      mesh = makeGroundMaterial(texture, alpha, geometry)
      scene.add(mesh);
      //console.log(mesh)
      return mesh;
    })
  })
}

function updateQuad(quad, layer) {
  getTexture("Mask", layer)
  .then((alpha) => {
    console.log(quad)
    quad.position.z = layer;
    quad.material.alphaMap = alpha
  })
}

function clickCycle () {
  //Debug.Log("called cycle");
  var layer = numClicks;
  console.log("Numclicks" + numClicks);
  if (dirtLayers.length > maxMask) {
    dirtLayers.splice(0, 1);
  }
  console.log('darkness is ' + darkness)
  if (numClicks > 5 && darkness > 30) {
    darkness -= 45;
  } else if (darkness <= 30) {
    darkness = 0;
  }
  var layer = dirtLayers.length;
  for (let i = 0; i < dirtLayers.length; i++) {
    //Debug.Log ("cond true");
    console.log("moving " + i + " to " + layer);
    updateQuad(dirtLayers[i], layer);
    layer -= 1;
  } 
  var rand = random(0, 8);
  seedInt += 1;
  console.log(seedInt);
  genQuad("Dirt", rand, dirtLayers.length + 1)
  .then((newMesh) => {
    dirtLayers.push(newMesh);
  })
  // console.log(newMesh)
  // dirtLayers.push(newMesh);
}

function click () {
  // send transaction
  //when received, set numclicks, then call clickCycle()
  clickCycle();
  //Debug.Log("incrementing");
  numClicks += 1;
}

function init() {
  camera = new THREE.OrthographicCamera( 
    window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
  camera.position.set( 0, 100, 10 );
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );
  //genQuad("Dirt", 1)
    // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.FrontSide, map: texture, alphaMap: alpha} );
    // var plane = new THREE.Mesh( geometry, material );
  // var geometry = new THREE.PlaneGeometry( 100, 100 );
  // var texture = new THREE.CanvasTexture( generateTexture() );
  // for ( var i = 0; i < 15; i ++ ) {
  //  var material = new THREE.MeshBasicMaterial( {
  //    color: new THREE.Color().setHSL( 0.3, 0.75, ( i / 15 ) * 0.4 + 0.1 ),
  //    map: texture,
  //    depthTest: false,
  //    depthWrite: false,
  //    transparent: true
  //  } );
  //  var mesh = new THREE.Mesh( geometry, material );
  //  mesh.position.y = i * 0.25;
  //  mesh.rotation.x = - Math.PI / 2;
  //  scene.add( mesh );
  // }
  // scene.children.reverse();
  //scene.add(plane);
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.domElement.id = 'mainCanvas';
  document.body.appendChild( renderer.domElement );
  //
  window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function generateTexture() {
  var canvas = document.createElement( 'canvas' );
  canvas.width = 512;
  canvas.height = 512;
  var context = canvas.getContext( '2d' );
  for ( var i = 0; i < 20000; i ++ ) {
    context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 50 ) + '%)';
    context.beginPath();
    context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true );
    context.fill();
  }
  context.globalAlpha = 0.075;
  context.globalCompositeOperation = 'lighter';
  return canvas;
}
//
function animate() {
  requestAnimationFrame( animate );
  render();
}
function render() {
  var time = Date.now() / 6000;
  // camera.position.x = 80 * Math.cos( time );
  // camera.position.z = 80 * Math.sin( time );
  camera.lookAt( scene.position );
  // for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
  //   var mesh = scene.children[ i ];
  //   mesh.position.x = Math.sin( time * 4 ) * i * i * 0.005;
  //   mesh.position.z = Math.cos( time * 6 ) * i * i * 0.005;
  // }
  renderer.render( scene, camera );
}