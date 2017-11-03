var seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
var txQueue = [];
var strippedSeed = seed.substring(2, seed.length);
var miningEfficiency = new BigNumber(1);
var efficiencySliderHeight = 0;
var efficiencySliderY = 300
var miningSpeed = new BigNumber(1000);
var canSmelt = false;
var numClicks = new BigNumber(0);
var balance = new BigNumber(0);
var seedInt = 0;
var camera, scene, renderer;
var dirtLayers = [];
var maxMask = 5;
var darkness = 255;
var nugsIncrement = 1;
var clickAllowed = false;
var allowedBrowser = false;
var playerAddress = '';
var registrarAddress = "0xe454c5cf591fb9e3bb77cc63efbc0cb8737afafb";
var gameAddress = "";
var registrar;
var game;
var totalGoods = 12;
var cacheGoods;
var ownedGoods = [];
var web3;
var gallery = false;
var specialMessages = {
  '0': "A humble beginning \n",
  '1': 'This venture is sure to pan out ... \n',
  '2': 'Your first step toward total automation! \n',
  '3': 'Deceptively powerful ... \n',
  '4': 'The marketing department sold you on this one ... you\'re not too sure what it is yet\n',
  '5': 'Sluice x3! 14 humans without MBAs lose their jobs \n',
  '6': 'Pareto efficiency tax \n',
  // '7': '',
  '8': 'Keep public sentiment on your side as you pillage the token fields! \n',
  // '9': '',
  // '10': '',
  // '11': ''
};

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

function insertTxHash(txHash) {
  var text = '';
  var table = document.getElementById('txHistory');
  var row = table.insertRow(1);
  var column = row.insertCell(0);
  column.setAttribute('id', txHash);
  if (gallery) {
    text = `${txHash.substring(0, 23)}...`;
  } else {
    text = '<a href="https://ropsten.etherscan.io/tx/' + txHash + '" target="_blank">' + txHash.substring(0, 23) + '...</a>';
    column.setAttribute('class', 'pendingFlash');
  }
  column.innerHTML = text; 
  return;
}

function removePendingFlash(txHash) {
  var element = document.getElementById(txHash);
  element.removeAttribute('class');
}

function getTransactionReceiptMined(txHash) {
  function transactionReceiptAsync(resolve, reject) {
    web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
        if (error) {
            reject(error);
        } else if (receipt == null) {
            setTimeout(
                () => transactionReceiptAsync(resolve, reject),
                100);
        } else {
            console.log('got receipt')
            console.log(receipt)
            resolve(receipt);
        }
    });
  };
  insertTxHash(txHash);
  return new Promise(transactionReceiptAsync).then(() => removePendingFlash(txHash));
};

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
    // console.log(values)
    cacheGoods = values;
    for (let i = 0; i < totalGoods; i++) {
      populateGood(i, values);
    }
    return;

    // parse 'em and populate
  })
}

// function increment() {
//   var quantity = document.getElementById("quantity");
//   var int = parseInt(quantity.firstChild.textContent);
//   console.log(int)
//   if (int <= 9) {
//     int += 1;
//   }
//   quantity.innerHTML = int;
// }

// function decrement() {
//   var quantity = document.getElementById("quantity");
//   var int = parseInt(quantity.firstChild.textContent);
//   if (int > 0) {
//     int -= 1;
//   }
//   quantity.innerHTML = int;
// }

// function hideMenu() {
//   var menu = document.getElementById("orderMenu");
//   menu.style.display = 'none';
// }

function statsMenuButtons() {
  var smt = document.getElementById("smelt");
  smt.onclick = smelt;
  var res = document.getElementById("reset");
  res.onclick = resetGame;
}

function orderMenuButtons() {
  // var up = document.getElementById("up");
  // up.onclick = increment;
  // var down = document.getElementById("down");
  // down.onclick = decrement;
  // var cancel = document.getElementById("cancel");
  // cancel.onclick = hideMenu;
}

function populateGood(ident, goods) {
  var row = document.getElementById("shop" + ident);
  row.addEventListener('click', () => orderMenu(ident), false);
  row.setAttribute('title', `${specialMessages[ident] ? specialMessages[ident] : ''}Efficiency +${goods[ident][1].toString()}  Speed +${goods[ident][2].toString()}`)
  //row.addEventListener('mouseover', () => itemDetails(ident))
  var coinsColumn = row.getElementsByTagName('p')[0]
  coinsColumn.innerHTML = goods[ident][3].toString()
  // console.log(goods[ident][3].toString())
}

function orderMenu(ident) {
  // var menu = document.getElementById("orderMenu");
  // menu.style.display = 'block';
  // var query = document.getElementById("query");
  // console.log(cacheGoods)
  prompt(`Would you like to buy a ${cacheGoods[ident][0]}?`, 'Cancel', hidePrompt, 'Buy', () => { buyGood(ident); })
  //query.innerHTML = `How many ${cacheGoods[ident][0]}s would you like to buy?`;
  // var buy = document.getElementById("buy");
  // buy.removeEventListener('click');
  // buy.onclick = () => { buyGood(ident) }
}

function buyGood(ident) {
  return new Promise((res, rej) => {
    // var quantity = document.getElementById("quantity");
    // var int = parseInt(quantity.firstChild.textContent);
    // ident = parseInt(ident)
    hidePrompt();
    // console.log('about to buy good')
    return game.buyGood(ident, {gas: "210000"}, (err, result) => {
      if (err) {
        return rej(err);
      }
      return getTransactionReceiptMined(result)
      .then(() => {
        // console.log('got receipt from buy')
        return getPlayerAndSetVars()
        .then(() => {
          refreshUi();
          placeGood(ident, 1);
        })
      })
    })
  })
}

function speedTimeout(timeout) {
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
    value = new BigNumber(0);
    clearInterval(interval)
    interval = setInterval(draw, miningSpeed/230)
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

function resetGame() {
  return game.beginGame({from: playerAddress, gas: "210000"}, (err, result) => {
    return getPlayerAndSetVars()
    .then(() => {
      return getTransactionReceiptMined(result)
      .then(() => {
        return getPlayerAndSetVars()
        .then(() => {
          darkness = 255;
          for (let i = 0; i < dirtLayers.length; i++) {
            scene.remove(dirtLayers[i])
          }
          rerenderClickCycle(new BigNumber(-1));
          refreshUi()
        })
      })
    })
  })
}

function smelt() {
  var nugsCount = document.getElementById("nugsCount");
  var int = new BigNumber(nugsCount.firstChild.textContent);
  int = int.times(miningEfficiency);
  nugsCount.innerHTML = int.toString();
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
  prompt.style.display = 'none';
}

function detectAddress() {
  return new Promise((res, rej) => {
    web3.eth.getAccounts((err, accounts) => {
      hidePrompt();
      if (accounts.length === 0) {
        prompt("Unable to find your account, is metamask unlocked?", "Ok", detectAddress)
        return;
      } else {
        playerAddress = accounts[0];
        gatherInitialData()
      }
    })
  })
}

function startWebGL() {
  init();
  canvas = document.getElementById('mainCanvas')
  canvas.addEventListener('click', click, false);
  animate();
}

function gatherInitialData() {
  if (allowedBrowser) {
    return createContracts()
    .then(() => {
      return checkForGame()
      .then(() => {
        return startWebGL()
      })
    })
  }
}

function detectMetaMask() {
  window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(web3.currentProvider);
      allowedBrowser = true;
      return detectAddress()
    } else if (gallery) {
      var w = new Web3.providers.HttpProvider(`http://127.0.0.1:8545`)
      web3 = new Web3(w)
      playerAddress = web3.eth.defaultAccount = web3.eth.accounts[0];
      allowedBrowser = true;
      gatherInitialData();
    } else {
      prompt("You must have a dapp browser, metamask, or local node installed to play!", "Ok", hidePrompt)
    }
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
        res();
      })
    });
  })
}

function beginGame() {
  hidePrompt();
  console.log(playerAddress)
  console.log(gameAddress)
  game.beginGame({from: playerAddress, gas: "210000"}, (err, result) => {
    if (err) { throw err; }
    return getTransactionReceiptMined(result)
    .then(() => {
      return getPlayerAndSetVars()
      .then(() => {
        console.log('calling start up')
        return startUpUi()
      })
    }).catch(e => { throw e; })
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

function checkSmeltButton() {
  if (canSmelt) {
    var smt = document.getElementById("smelt")
    smt.style.display = 'inline-block';
  }
}

function refreshUi() {
  updateUiCoinBal();
  updateUiSpeed();
  updateUiEfficiency();
  checkSmeltButton();
  sliderAdjust('efficiencySlider', miningEfficiency, new BigNumber(1500), 300, 30)
}

function getPollingBalance() {
  setInterval(() => {
    game.balanceOf(playerAddress, (err, result) => {
      console.log(`polling balance of ${result}`)
    });
  }, 200);
}

function startUpUi() {
  nugIncrementer();
  updateUiCoinBal();
  speedTimeout(1);
  sliderAdjust('efficiencySlider', miningEfficiency, new BigNumber(1500), 300, 30)
  rerenderClickCycle(new BigNumber(-1));
  statsMenuButtons();
  updateUiSpeed();
  updateUiEfficiency();
  checkSmeltButton();
  getGoods()
  .then(() => placeGoods())
  //getPollingBalance();
}

function refreshBalance() {
  return new Promise((res, rej) => {
    game.balanceOf(playerAddress, (err, bal) => {
      if (err) return rej(err);
      balance = new BigNumber(bal);
      updateUiCoinBal();
      res(true);
    })
  })
}

function getPlayerAndSetVars() {
  return new Promise((res, rej) => {
    // setTimeout(() => {
    console.log(`playerAddress is ${playerAddress}`)
      game.playerGetter(playerAddress, (err, player) => {
        if (err) return rej(err);
        const seedCheck = new BigNumber(player[0])
        if (seedCheck.equals(0)) {
          return res(false);
        } 
        // probably don't need to reassign seed and strippedSeed here
        seed = player[0];
        strippedSeed = seed.substring(2, seed.length);
        miningEfficiency = new BigNumber(player[1]);
        miningSpeed = new BigNumber(1000);//new BigNumber(player[2]);
        canSmelt = player[3];
        ownedGoods = player[4];
        lastClick = player[5];
        numClicks = new BigNumber(player[6]);
        console.log(`numclicks is ${numClicks}`)
        //sliderAdjust('efficiencySlider', miningEfficiency, new BigNumber(1000), 300, 30)
        return refreshBalance()
        .then(() => res(true))
      })
    // }, 1000) 
  })
}

function checkForGame(first) {
  return getPlayerAndSetVars()
  .then((player) => {
    console.log(player)
    if (!player) return prompt("No game detected with this address, would you like to play?", "No", hidePrompt, "Yes", beginGame);
    return startUpUi();
  })
}

function getSeed() {
  console.log(`called with seedInt ${seedInt}`)
  if (seedInt >= strippedSeed.length - 1) { 
    console.log(seedInt)
    console.log('resetting seedInt')
    console.log(strippedSeed.length)
    seedInt = 0;
  } else {
    console.log('incrementing seedInt')
    seedInt ++;
  }
  console.log(seedInt)
  console.log(`0x${strippedSeed.charAt(seedInt)}`)
  return `0x${strippedSeed.charAt(seedInt)}`;
}

function random(min, max) {
  var x = Math.abs(Math.sin(getSeed()));
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

function getMaskTexture(label, identfier) {
  return new Promise ((resolve, reject) => {
    let rand;
    if (identfier !== "Null") {
      rand = random(0, 6);
      //seedInt = seedInt + 1;
    }
    const onLoad = (texture) => resolve (texture);
    const onError = (event) => reject (event);
    return new THREE.TextureLoader().load(
      `assets/${label}${identfier}.jpg`, onLoad, () => {}, onError);
  })
}

function getItemTexture(label) {
  console.log(`trying to load texture ${label}`)
  return new Promise ((resolve, reject) => {
    const onLoad = (texture) => resolve (texture);
    const onError = (event) => reject (event);
    return new THREE.TextureLoader().load(
      `assets/win95/${label}.png`, onLoad, () => {}, onError);
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
    color: `rgb(${255}, ${255}, ${255})`,
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
    return getMaskTexture("Mask", "Null")
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

function genQuadItem(label) {
  var geometry = new THREE.PlaneGeometry( 30, 30 );
  return getItemTexture(label)
  .then(texture => {
    mesh = makeItemMaterial(texture, geometry)
    var randx = random((window.innerWidth/4) * -1, window.innerWidth/4);
    //seedInt += 1;
    var randz = random((window.innerHeight/4) * -1, window.innerHeight/4);
    console.log(randx)
    console.log(randz)
    //seedInt += 1;
    mesh.position.x = randx;
    mesh.position.z = randz;
    mesh.position.y = 30;
    console.log(`about to place ${label}`)
    scene.add(mesh);
    return mesh;
  })
}

function updateQuad(quad, layer) {
  getMaskTexture("Mask", layer)
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
  for (let i = 0; i < ownedGoods.length; i++) {
    placeGood(i, ownedGoods[i])
  }
}

function placeGood(goodIdent, numberOwned) {
  console.log('called placegood')
  console.log(`numberOwned is ${numberOwned}`)
  var name = cacheGoods[goodIdent][0].toLowerCase().replace(/ /g, '-');
  for (let i = 0; i < numberOwned; i++) {
    genQuadItem(name);
  }
}

function clickCycle(scopedNumClicks) {
  // var layer = numClicks;
  // console.log(scopedNumClicks.toString())
  if (scopedNumClicks.equals(0)) {
    // console.log('equals zero')
    return genQuadNoMask("Grass", "0", 0)
    .then((newMesh) => {
      // console.log('pushing to dirtlayers')
      dirtLayers.push(newMesh);
      return;
    })
  }
  if (dirtLayers.length > maxMask) {
    // console.log('removing item from dirtLayers')
    scene.remove(dirtLayers[0])
    dirtLayers.splice(0, 1);
  }
  // console.log('darkness is ' + darkness)
  if (scopedNumClicks.lessThan(6) && darkness > 30) {
    darkness -= 45;
  } else if (darkness <= 30) {
    darkness = 0;
  }
  var layer = dirtLayers.length;
  console.log(`dirt layers is ${dirtLayers.length}`)
  for (let i = 0; i < dirtLayers.length; i++) {
    // console.log(`called updateQuad layer is ${layer}`)
    updateQuad(dirtLayers[i], layer);
    layer -= 1;
  } 
  var rand = random(0, 8);
  //seedInt += 1;
  // console.log(rand)
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
  // console.log('about to call click')
  return game.click({from: playerAddress, gas: "210000"}, (err, result) => {
    if (err) console.log(err)
    console.log(result)
    return getTransactionReceiptMined(result)
    .then(() => {

      return getPlayerAndSetVars()
      .then(() => {
        // console.log('about to refresh ui')
        refreshUi();
        clickCycle(numClicks);
        speedTimeout(1);
        clickAllowed = false;
      })
    })
  })
}

function makeWallet() {
  body.appendChild()
}

function init() {
  if (allowedBrowser) { 

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