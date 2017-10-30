var seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
var strippedSeed = seed.substring(2, seed.length);
var miningEfficiency = new BigNumber(1);
var efficiencySliderHeight = 0;
var efficiencySliderY = 300
var miningSpeed = new BigNumber(30000);
var canSmelt = false;
var numClicks = new BigNumber(0);
var balance = new BigNumber(0);
var seedInt = 0;
var camera, scene, renderer;
var dirtLayers = [];
var maxMask = 5;
var darkness = 255;
var nugsIncrement = 10;
var clickAllowed = false;
var allowedBrowser = false;
var playerAddress = ''
var registrarAddress = "0x1a3568e468c3169db8ded188b707b20da73be3a7"
var gameAddress = ""
var registrar;
var game;
var totalGoods = 12;
var cacheGoods;
var ownedGoods;
var specialMessages = {};

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

function getGoods() {
  var goodsPromises = []
  for (let i = 0; i < totalGoods; i++) {
    goodsPromises.push(
      new Promise((res, rej) => {
        game.goodsGetter(i, (err, result) => {
          if (err) return rej(err)
          res(result)
        })
      })
    );
  }
  return Promise.all(goodsPromises)
  .then((values) => {
    console.log(values)
    cacheGoods = values;
    for (let i = 0; i < totalGoods; i++) {
      populateGood(i, values);
    }
    return;

    // parse 'em and populate
  })
}

function increment() {
  var quantity = document.getElementById("quantity");
  var int = parseInt(quantity.firstChild.textContent);
  console.log(int)
  if (int <= 9) {
    int += 1;
  }
  quantity.innerHTML = int;
}

function decrement() {
  var quantity = document.getElementById("quantity");
  var int = parseInt(quantity.firstChild.textContent);
  if (int > 0) {
    int -= 1;
  }
  quantity.innerHTML = int;
}

function hideMenu() {
  var menu = document.getElementById("orderMenu");
  menu.style.display = 'none';
}

function orderMenuButtons() {
  var up = document.getElementById("up");
  up.onclick = increment;
  var down = document.getElementById("down");
  down.onclick = decrement;
  var cancel = document.getElementById("cancel");
  cancel.onclick = hideMenu;
}

function populateGood(ident, goods) {
  var row = document.getElementById("shop" + ident);
  row.addEventListener('click', () => orderMenu(ident), false);
  row.setAttribute('title', `Efficiency +${goods[ident][1].toString()}  Speed +${goods[ident][2].toString()}`)
  //row.addEventListener('mouseover', () => itemDetails(ident))
  var coinsColumn = row.getElementsByTagName('p')[0]
  coinsColumn.innerHTML = goods[ident][3].toString()
  console.log(goods[ident][3].toString())
}

function orderMenu(ident) {
  var menu = document.getElementById("orderMenu");
  menu.style.display = 'block';
  var query = document.getElementById("query");
  console.log(cacheGoods)
  query.innerHTML = `How many ${cacheGoods[ident][0]}s would you like to buy?`;
  var buy = document.getElementById("buy");
  // buy.removeEventListener('click');
  buy.onclick = () => { buyGood(ident) }
}

function buyGood(ident) {
  return new Promise((res, rej) => {
    var quantity = document.getElementById("quantity");
    var int = parseInt(quantity.firstChild.textContent);
    ident = parseInt(ident)
    hideMenu();
    return game.buyGood(ident, int, (err, result) => {
      if (err) {
        return rej(err);
      }
      console.log('got result from buyGood')
      return getPlayerAndSetVars(playerAddress)
      .then(() => {
        refreshUi();
      })
    })
  })
}

function speedTimeout(timeout) {
  console.log(`called mining speed with ${miningSpeed}`)
  var value = new BigNumber(0);
  var count = miningSpeed.times(0.002)
  var interval = setInterval(() => {}, 1000)

  var draw = () => { 
    value = value.plus(count);
    if (value.greaterThanOrEqualTo(miningSpeed)) {
      clickAllowed = true;
      clearInterval(interval)
    }
    sliderAdjust('speedSlider', value, miningSpeed, 300, 70);
  };

  var adjustableTimeout = () => {
    console.log('adjustable called')
    value = new BigNumber(0);
    clearInterval(interval)
    interval = setInterval(draw, miningSpeed/230)
    //setTimeout(adjustableTimeout, miningSpeed)
  }

  setTimeout(adjustableTimeout, timeout)

}

function denormalizeToCutOff(value, max, min) {
  var a = min.minus(max);
  var b = value.times(a);
  var c = b.plus(max)
  return c;
}

function sliderAdjust(slider, value, paramMax, sliderMax, cutoff) {
  var slider = document.getElementById(slider); 
  var max = new BigNumber(sliderMax);
  var normalizedHeight = value.dividedBy(paramMax); 
  var denormalizedToZero = normalizedHeight.times(max)
  var denormalizedToCutOff = denormalizeToCutOff(normalizedHeight, max, new BigNumber(cutoff))
  var diff = max.minus(denormalizedToZero)
  slider.style.height = denormalizedToZero.toString(); 
  slider.style.y = denormalizedToCutOff.toString(); 
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
  if (prompt.firstChild.type !== 'submit') {
    prompt.removeChild(prompt.firstChild);
  } 
  var p = document.createElement('p');
  text = document.createTextNode(text);
  p.appendChild(text)
  p.style.padding = '5px';
  prompt.insertBefore(p, prompt.firstChild);
  var button1 = document.getElementById("button1");
  if (dialog1) {
    button1.style.display = 'block';
    button1.innerHTML = dialog1
    button1.onclick = callback1;
  } else {
    button1.style.display = 'none';
  }
  var button2 = document.getElementById("button2");
  if (dialog2) {
    button2.style.display = 'block';
    button2.innerHTML = dialog2
    button2.onclick = callback2;
  } else {
    button2.style.display = 'none';
  }
}

function hidePrompt() {
  var prompt = document.getElementById("alert");
  console.log(`prompt ${prompt.firstChild.type}`)
  prompt.style.display = 'none';
}

function detectMetaMask() {
  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
      console.log('Found MetaMask')
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
    return getPlayerAndSetVars(playerAddress)
    .then(() => {
      console.log('calling start up')
      return startUpUi()
    })
    // startUpUi()
  })
}

function updateUiCoinBal() {
  var coinsCount = document.getElementById("coinsCount");
  coinsCount.innerHTML = balance.toString();
}

function updateUiSpeed() {
  var speedDisplay = document.getElementById("speedStat");
  var baseline = new BigNumber(30000);
  var reversed = baseline.minus(miningSpeed);
  speedDisplay.innerHTML = reversed.toString();
}

function updateUiEfficiency() {
  var efficiencyDisplay = document.getElementById("efficiencyStat");;
  efficiencyDisplay.innerHTML = miningEfficiency.toString();
}

function refreshUi() {
  updateUiCoinBal();
  updateUiSpeed();
  updateUiEfficiency();
  sliderAdjust('efficiencySlider', miningEfficiency, new BigNumber(1000), 300, 30)
}

function startUpUi() {
  nugIncrementer();
  updateUiCoinBal();
  speedTimeout(1);
  console.log(`set efficiency to ${miningEfficiency}`)
  sliderAdjust('efficiencySlider', miningEfficiency, new BigNumber(1000), 300, 30)
  rerenderClickCycle(new BigNumber(-1));
  orderMenuButtons();
  updateUiSpeed();
  updateUiEfficiency();
  getGoods()
  .then(() => placeGoods())
}

function getPlayerAndSetVars(account) {
  return new Promise((res, rej) => {
    console.log('getting player')
    game.playerGetter(account, (err, player) => {
      if (err) return rej(err);
      console.log(player)
      const seedCheck = new BigNumber(player[0])
      if (seedCheck.equals(0)) {
        console.log('seed check is zero')
        return res(false);
      } 
      seed = player[0];
      strippedSeed = seed.substring(2, seed.length);
      miningEfficiency = new BigNumber(player[1]);
      miningSpeed = new BigNumber(30000);//new BigNumber(player[2]);
      canSmelt = player[3];
      ownedGoods = player[4];
      lastClick = player[5];
      console.log(lastClick.toString())
      numClicks = new BigNumber(player[6]);
      console.log(`numclicks is ${numClicks}`)
      game.balanceOf(account, (errr, bal) => {
        if (err) return rej(err);
        console.log(`got bal ${bal}`)
        balance = new BigNumber(bal);
        updateUiCoinBal();
        sliderAdjust('efficiencySlider', miningEfficiency, new BigNumber(1000), 300, 30)
        console.log('returning from player set vars')
        res(true);
      })
    })
  })  
}

function checkForGame(first) {
  return new Promise((res, rej) => {
    web3.eth.getAccounts((err, accounts) => {
      hidePrompt();
      if (accounts.length === 0) {
        prompt("Unable to find your account, is metamask unlocked?", "Ok", checkForGame)
        return;
      }
      playerAddress = accounts[0];
      getPlayerAndSetVars(playerAddress)
      .then((player) => {
        console.log(player)
        if (!player) return prompt("No game detected with this address, would you like to play?", "No", hidePrompt, "Yes", beginGame);
        startUpUi();
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

function getTexture(label, identfier, pngFlag) {
  return new Promise ((resolve, reject) => {
    const onLoad = (texture) => resolve (texture);
    const onError = (event) => reject (event);
    return new THREE.TextureLoader().load(
      `assets/${label}${identfier ? identfier : ''}.${pngFlag ? 'png' : 'jpg'}`, onLoad, () => {}, onError);
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

function makeItemMaterial(texture, geometry) {
  var material = new THREE.MeshBasicMaterial({
    color: `rgb(${darkness}, ${darkness}, ${darkness})`,
    side: THREE.FrontSide,
    depthTest: false,
    transparent: true,
    map: texture,
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
    return getTexture("Mask", "0")
    .then((alpha) => {
      mesh = makeGroundMaterial(texture, alpha, geometry)
      scene.add(mesh);
      return mesh;
    })
  })
}

function genQuadNoMask(label, identfier, zIndex) {
  var geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
  return getTexture(label, identfier)
  .then(texture => {
    return getTexture("Mask", "Null")
    .then((alpha) => {
      mesh = makeGroundMaterial(texture, alpha, geometry)
      scene.add(mesh);
      return mesh;
    })
  })
}

function genQuadItem(label, identfier, zIndex) {
  var geometry = new THREE.PlaneGeometry( 20, 20 );
  return getTexture(label, identfier, true)
  .then(texture => {
   
    mesh = makeItemMaterial(texture, geometry)
    var randx = random((window.innerWidth/4) * -1, window.innerWidth/4);
    seedInt += 1;
    var randz = random((window.innerHeight/4) * -1, window.innerHeight/4);
    console.log(randx)
    console.log(randz)
    seedInt += 1;
    mesh.position.x = randx;
    mesh.position.z = randz;
    mesh.position.y = 20;
    scene.add(mesh);
    return mesh;
  })
}

function updateQuad(quad, layer) {
  getTexture("Mask", layer)
  .then((alpha) => {
    quad.position.z = layer;
    quad.material.alphaMap = alpha
  })
}

function rerenderClickCycle(counter) {
  if (counter.equals(numClicks)) return;
  counter = counter.plus(1);
  return clickCycle(counter)
  .then(() => {
    return rerenderClickCycle(counter);
  })
}

function placeGoods() {
  console.log(ownedGoods)
  for (let i = 0; i < ownedGoods.length; i++) {
    placeGood(i, ownedGoods[i])
  }
}

function placeGood(goodIdent, numberOwned) {
  console.log(cacheGoods)
  var name = cacheGoods[goodIdent][0].toLowerCase().replace(/ /g, '-');
  for (let i = 0; i < numberOwned; i++) {
    genQuadItem('bigreddot', null, 100);
  }
}

function clickCycle(scopedNumClicks) {
  // var layer = numClicks;
  console.log(scopedNumClicks.toString())
  if (scopedNumClicks.equals(0)) {
    console.log('equals zero')
    return genQuadNoMask("Grass", "0", 0)
    .then((newMesh) => {
      console.log('pushing to dirtlayers')
      dirtLayers.push(newMesh);
      return;
    })
  }
  if (dirtLayers.length > maxMask) {
    console.log('removing item from dirtLayers')
    dirtLayers.splice(0, 1);
  }
  console.log('darkness is ' + darkness)
  if (scopedNumClicks.lessThan(6) && darkness > 30) {
    darkness -= 45;
  } else if (darkness <= 30) {
    darkness = 0;
  }
  var layer = dirtLayers.length;
  console.log(`dirt layers is ${dirtLayers.length}`)
  for (let i = 0; i < dirtLayers.length; i++) {
    console.log(`called updateQuad layer is ${layer}`)
    updateQuad(dirtLayers[i], layer);
    layer -= 1;
  } 
  var rand = random(0, 8);
  seedInt += 1;
  console.log(rand)
  return genQuad("Dirt", rand, dirtLayers.length + 1)
  .then((newMesh) => {
    dirtLayers.push(newMesh);
    return;
  })
}

function click () {
  // send transaction
  // when received, set numclicks, then call clickCycle()
  if (!clickAllowed) { 
    prompt("You can't mine faster than your equipment allows!", "Ok", hidePrompt);
    return;
  }
  game.click((err, result) => {
    getPlayerAndSetVars(playerAddress)
    .then(() => {
      refreshUi();
      clickCycle(numClicks);
      speedTimeout(1);
      clickAllowed = false;
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