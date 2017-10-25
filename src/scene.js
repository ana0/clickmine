var seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
var strippedSeed = seed.substring(2, seed.length);
var miningEfficiency = 1;
var efficiencySliderHeight = 0;
var efficiencySliderY = 300
var miningSpeed = 10;
var canSmelt = false;
var numClicks = new BigNumber(0);
var balance = new BigNumber(0);
var seedInt = 0;
var camera, scene, renderer;
var dirtLayers = [];
var maxMask = 5;
var darkness = 255;
var nugsIncrement = 10;
var allowedBrowser = false;
var playerAddress = ''
var registrarAddress = "0x1a3568e468c3169db8ded188b707b20da73be3a7"
var gameAddress = ""
var registrar;
var game;

detectMetaMask();


function trimSvgWhitespace() {
  console.log('called')
  // get all SVG objects in the DOM
  var svgs = document.getElementsByTagName("svg");
  console.log(svgs.length)

  // go through each one and add a viewbox that ensures all children are visible
  for (var i=0, l=svgs.length; i<l; i++) {
    console.log(svgs[i])

    var svg = svgs[i],
        box = svg.getBBox(), // <- get the visual boundary required to view all children
        viewBox = [box.x, box.y, box.width, box.height].join(" ");
    // set viewable area based on value above
    svg.setAttribute("viewBox", viewBox);
  }
}

function speedTimeout() {
  var value = new BigNumber(0);
  var count = miningSpeed.times(0.003)
  var interval = setInterval(() => {}, 1000)

  var draw = () => { 
    value = value.plus(count);
    sliderAdjust('speedSlider', value, miningSpeed, 300, 70);
  };

  var adjustableTimeout = () => {
    value = new BigNumber(0);
    clearInterval(interval)
    interval = setInterval(draw, miningSpeed/270)
    //setTimeout(adjustableTimeout, miningSpeed)
  }

  setTimeout(adjustableTimeout, miningSpeed)

}

function sliderAdjust(slider, value, paramMax, sliderMax, cutoff) {
  var slider = document.getElementById(slider); 
  //console.log(slider)
  var max = new BigNumber(sliderMax);
  var normalizedHeight = value.dividedBy(paramMax); // 100 is max for now
  var denormalizedToZero = normalizedHeight.times(max)
  var diff = max.minus(denormalizedToZero)
  slider.style.height = denormalizedToZero.toString(); //from 0 to 230  (value-min)/(max-min)
  slider.style.y = diff.greaterThan(cutoff) ? diff : cutoff;//from 70 to 230
}

function nugIncrementer() {
  var nugsCount = document.getElementById("nugsCount");
  setInterval(() => {
    var int = new BigNumber(nugsCount.firstChild.textContent);
    int = int.plus(nugsIncrement);
    nugsCount.innerHTML = int.toString();
  }, 500);
}

function prompt(text, dialog1, callback1, dialog2, callback2) {
  var prompt = document.getElementById("alert");
  prompt.style.display = 'block';
  text = document.createTextNode(text);
  prompt.insertBefore(text, prompt.firstChild);
  if (dialog1) {
    var button1 = document.getElementById("button1");
    button1.style.display = 'block';
    button1.innerHTML = dialog1
    button1.onclick = callback1;
  }
  if (dialog2) {
    var button2 = document.getElementById("button2");
    button2.style.display = 'block';
    button2.innerHTML = dialog2
    button2.onclick = callback2;
  }
}

function hidePrompt() {
  var prompt = document.getElementById("alert");
  prompt.removeChild(prompt.firstChild);
  prompt.style.display = 'none';
}

function detectMetaMask() {
  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
      console.log('Found MetaMasks')
      allowedBrowser = true;
      init();
      canvas = document.getElementById('mainCanvas')
      canvas.addEventListener('click', click, false);
      animate();
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      prompt("You must have a dapp browser or metamask installed to play!", "Ok", hidePrompt)
    }
    // Now you can start your app & access web3 freely:

  })
}

function createContracts() {
  console.log('called create')
  return new Promise((res, rej) => {
    var Registrar = web3.eth.contract(registrarAbi);
    registrar = Registrar.at(registrarAddress);
    console.log('attempting to get game address')
    registrar.GameAddress((err, result) => {
      console.log(err)
      if (err) return rej(err)
      console.log(result)
      gameAddress = result
      var Game = web3.eth.contract(gameAbi);
      game = Game.at(gameAddress);
      game.tokensPerClick((err, result) => {
        if (err) return rej(err)
        console.log(result.toString())
        res();
      })
    });
  })
}

function beginGame() {
  hidePrompt();
  game.beginGame((err, result) => {
    getPlayerAndSetVars(playerAddress)
    .then(() => {
      startUpUi()
    })
    // startUpUi()
  })
}

function updateUiCoinBal() {
  var coinsCount = document.getElementById("coinsCount");
  coinsCount.innerHTML = balance.toString();
}

function startUpUi() {
  nugIncrementer();
  updateUiCoinBal();
  speedTimeout();
}

function getPlayerAndSetVars(account) {
  return new Promise((res, rej) => {
    console.log('getting player')
    game.playerGetter(account, (err, player) => {
      if (err) return rej(err);
      const seedCheck = new BigNumber(player[0])
      if (seedCheck.equals(0)) {
        console.log('seed check is zero')
        return res(false);
      } 
      seed = player[0];
      strippedSeed = seed.substring(2, seed.length);
      miningEfficiency = new BigNumber(player[1]);
      miningSpeed = new BigNumber(10000);
       //new BigNumber(player[2]);
      canSmelt = player[3];
      lastClick = player[5];
      console.log(lastClick.toString())
      numClicks = new BigNumber(player[6]);
      console.log(`numclicks is ${numClicks}`)
      game.balanceOf(account, (errr, bal) => {
        if (err) return rej(err);
        console.log('got bal')
        balance = new BigNumber(bal);
        updateUiCoinBal();
        sliderAdjust('efficiencySlider', miningEfficiency, 1000, 300, 30)
        res(true);
      })
    })
  })  
}

function checkForGame() {
  return new Promise((res, rej) => {
    web3.eth.getAccounts((err, accounts) => {
      console.log(accounts)
      playerAddress = accounts[0];
      getPlayerAndSetVars(playerAddress)
      .then((player) => {
        console.log(player)
        if (!player) return prompt("No game detected with this address, would you like to play?", "No", hidePrompt, "Yes", beginGame);
        startUpUi();
        clickCycle();
      })
    })
  })
}

function getSeed(seedInt) {
  if (seedInt >= strippedSeed.length) { 
    seedInt = 0;
  } else {
    seedInt += 1;
  }
  console.log(`0x${strippedSeed.charAt(seedInt)}`)
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
      return mesh;
    })
  })
}

function updateQuad(quad, layer) {
  getTexture("Mask", layer)
  .then((alpha) => {
    quad.position.z = layer;
    quad.material.alphaMap = alpha
  })
}

function clickCycle () {
  // var layer = numClicks;
  if (dirtLayers.length > maxMask) {
    dirtLayers.splice(0, 1);
  }
  console.log('darkness is ' + darkness)
  if (numClicks.lessThan(5) && darkness > 30) {
    darkness -= 45;
  } else if (darkness <= 30) {
    darkness = 0;
  }
  var layer = dirtLayers.length;
  for (let i = 0; i < dirtLayers.length; i++) {
    updateQuad(dirtLayers[i], layer);
    layer -= 1;
  } 
  var rand = random(0, 8);
  seedInt += 1;
  console.log(rand)
  genQuad("Dirt", rand, dirtLayers.length + 1)
  .then((newMesh) => {
    dirtLayers.push(newMesh);
  })
}

function click () {
  // send transaction
  // when received, set numclicks, then call clickCycle()
  game.click((err, result) => {
    getPlayerAndSetVars(playerAddress)
    .then(() => {
      clickCycle();
    })
  })
  // clickCycle();
  // console.log(numClicks)
  // numClicks = numClicks.plus(new BigNumber(1));
}

function makeWallet() {
  body.appendChild()
}

function init() {
  if (allowedBrowser) { 
    createContracts()
    .then(() => {
      checkForGame()
    })
  }
  console.log(allowedBrowser)
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