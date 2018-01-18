var seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
var txQueue = [];
var strippedSeed = seed.substring(2, seed.length);
var miningEfficiency = new BigNumber(1);
var efficiencySliderHeight = 0;
var efficiencySliderY = 300
var efficiencyMax = new BigNumber(95000)
var miningSpeed = new BigNumber(500);
var canSmelt = false;
var numClicks = new BigNumber(0);
var balance = new BigNumber(0);
var seedInt = 0;
var camera, scene, renderer;
var dirtLayers = [];
var maxMask = 6;
var darkness = 255;
var nugsIncrement = 8;
var clickAllowed = false;
var allowedBrowser = false;
var playerAddress = '';
var registrarAddress = "0x2850c34255b8fc689b5f5640c83cd35f29b0d3dc";
var gameAddress = "";
var interval = setInterval(() => {}, 1000);
var efInterval = setInterval(() => {}, 1000);
var registrar;
var game;
var totalGoods = 12;
var cacheGoods;
var ownedGoods = [];
var drawnGoods = []
var web3;
var gallery = true;
var specialMessages = {
  '0': "A humble beginning \n",
  '1': 'This venture is sure to pan out ... \n',
  '2': 'Your first step toward total automation! \n',
  '3': 'Deceptively powerful ... \n',
  '4': 'The marketing department sold you on this one ... you\'re not too sure what it is yet\n',
  '5': 'Sluice x3! For every mecha-sluice, 14 people lose their jobs \n',
  '6': 'Pareto efficiency tax \n',
  '7': 'This baby is among the largest land vehicles ever constructed\n',
  '8': 'Keep public sentiment on your side as you pillage the earth! \n',
  '9': 'A "tailings pond" is a cute name for a lake of toxic waste... \n One this bulldozer can drive through with noooooo problem!\n',
  '10': 'Rip up the fields, uncover the last root of the merkle tree...\n',
  '11': 'UNCAPPED HAULAGE. CHAOS REIGNS\n'
};

detectMetaMask();

function insertTxHash(txHash) {
  var text = '';
  var table = document.getElementById('txHistory');
  var row = table.insertRow(1);
  var column = row.insertCell(0);
  column.setAttribute('id', txHash);
  if (gallery) {
    text = `${txHash.substring(0, 23)}...`;
  } else {
    text = '<a href="https://etherscan.io/tx/' + txHash + '" target="_blank">' + txHash.substring(0, 23) + '...</a>';
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
            resolve(receipt);
        }
    });
  };
  if (txHash) {
    insertTxHash(txHash);
    return new Promise(transactionReceiptAsync).then(() => removePendingFlash(txHash))
  }
  return Promise.reject();
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
    cacheGoods = values;
    for (let i = 0; i < totalGoods; i++) {
      populateGood(i, values);
    }
    return;
  })
}

function statsMenuButtons() {
  var smt = document.getElementById("smelt");
  smt.onclick = smelt;
  var res = document.getElementById("reset");
  res.onclick = resetGame;
}

function showWhitepaper() {
  var wp = document.getElementById("whitepaperFull");
  var wbg = document.getElementById("whitepaperBg");
  wp.style.display = 'block';
  wbg.style.display = 'block';
}

function hideWhitepaper() {
  var wp = document.getElementById("whitepaperFull");
  wp.style.display = 'none';
  var wbg = document.getElementById("whitepaperBg");
  wbg.style.display = 'none';
}

function whitepaperButton() {
  var button = document.getElementById("whitepaper");
  button.onclick = showWhitepaper;
  var wbg = document.getElementById("whitepaperBg");
  wbg.addEventListener('click', hideWhitepaper);
}

function populateGood(ident, goods) {
  var row = document.getElementById("shop" + ident);
  row.addEventListener('click', () => orderMenu(ident), false);
  var plural = `${ident === 6 ? 'Refinerie' : goods[ident][0]}s`;
  var grammered = `${ownedGoods[ident].equals(1) ? goods[ident][0] : plural}`;
  row.setAttribute('title', `${specialMessages[ident] ? specialMessages[ident] : ''}Efficiency +${goods[ident][1].toString()}  Speed +${goods[ident][2].toString()}
    \nYou have bought ${ownedGoods[ident]} ${grammered}`)
  var coinsColumn = row.getElementsByTagName('p')[0]
  coinsColumn.innerHTML = goods[ident][3].toString()
}

function orderMenu(ident) {
  prompt(`Would you like to buy a ${cacheGoods[ident][0]}?`, 'Cancel', hidePrompt, 'Buy', () => { buyGood(ident); })
}

function bounceStats () {
  var eff = document.getElementById("efficiencyStat")
  var speed = document.getElementById("speedStat")
  eff.classList.add("animated");
  eff.classList.add("bounce");
  speed.classList.add("animated");
  speed.classList.add("bounce");
  setTimeout(() => {
    eff.classList.remove("animated");
    eff.classList.remove("bounce");
    speed.classList.remove("animated");
    speed.classList.remove("bounce");
  }, 1000)
}

function buyGood(ident) {
  return new Promise((res, rej) => {
    hidePrompt();
    if (balance.lessThan(cacheGoods[ident][3])) {
      prompt(`You do not have enough $CLK to buy a ${cacheGoods[ident][0]}`, 'Ok', hidePrompt)
      return res();
    }
    return game.buyGood(ident, {gas: "210000", from: playerAddress}, (err, result) => {
      if (err) {
        return rej(err);
      }
      return getTransactionReceiptMined(result)
      .then(() => {
        return getPlayerAndSetVars()
        .then(() => {
          refreshUi();
          bounceStats();
          populateGood(ident, cacheGoods);
          placeGood(ident, 1);
        })
      }).catch((e) => console.log(e))
    })
  })
}

function speedTimeout(speed) {
  var value = new BigNumber(0);
  var count = 0.2
  var intervalRegularity = 1;

  var draw = () => { 
    value = value.plus(count);
    if (value.greaterThanOrEqualTo(speed)) {
      clickAllowed = true;
      clearInterval(interval)
    }
    sliderAdjust('speedSlider', value, speed, 300, 70);
  };

  var adjustableTimeout = () => {
    value = new BigNumber(0);
    clearInterval(interval)
    interval = setInterval(draw, intervalRegularity)
  }
  
  if (speed.equals(0)) {
    clickAllowed = true;
    sliderAdjust('speedSlider', new BigNumber(1), new BigNumber(1), 300, 70);
  } else if (speed.lessThan(10)) {
    speed = new BigNumber(10);
    adjustableTimeout();
  } else {
    adjustableTimeout();
  }
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
  slider.setAttribute("height", denormalizedToZero.toString())
  slider.setAttribute("y", denormalizedToCutOff.toString())
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
          for (let i = 0; i < drawnGoods.length; i++) {
            scene.remove(drawnGoods[i])
          }
          rerenderClickCycle(new BigNumber(-1));
          refreshUi()
          speedTimeout(new BigNumber(1));

        })
      }).catch((e) => console.log(e))
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
        console.log(accounts)
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
  }
}

function detectMetaMask() {
  window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined' && !gallery) {
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

function continueSetUp() {
  return checkForGame()
  .then(() => {
    return startWebGL()
  })
}

function createContracts() {
  return new Promise((res, rej) => {
    var Registrar = web3.eth.contract(registrarAbi);
    registrar = Registrar.at(registrarAddress);
    registrar.GameAddress((err, result) => {
      if (err) return rej(err)
      if (result === '' || !result || result === '0x') {
        prompt('Can\'t connect to contracts, are you on the main ethereum network?', 'Ok', createContracts)
      } else {
        gameAddress = result
        var Game = web3.eth.contract(gameAbi);
        game = Game.at(gameAddress);
        game.tokensPerClick((err, result) => {
          if (err) return rej(err)
          return continueSetUp()
        })
      }
    });
  })
}

function beginGame() {
  hidePrompt();
  game.beginGame({from: playerAddress, gas: "210000"}, (err, result) => {
    if (err) { throw err; }
    return getTransactionReceiptMined(result)
    .then(() => {
      return getPlayerAndSetVars()
      .then(() => {
        return startUpUi()
      })
    }).catch((e) => console.log(e))
  })
}

function updateUiCoinBal() {
  var coinsCount = document.getElementById("coinsCount");
  coinsCount.innerHTML = balance.toString();
}

function updateUiSpeed() {
  var speedDisplay = document.getElementById("speedStat");
  speedDisplay.setAttribute('title', `${miningSpeed.equals(1) ? 'Your speed is maxed out!' : 'Higher speed means you mine faster!'}`)
  var baseline = new BigNumber(2500)
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

function efTimeout(efficiency) {
  var value = new BigNumber(0);
  var count = 500;
  var intervalRegularity = 1;//miningSpeed/230

  var draw = () => { 
    value = value.plus(count);
    if (value.greaterThanOrEqualTo(efficiency)) {
      clearInterval(efInterval)
    }
    sliderAdjust('efficiencySlider', value, efficiencyMax, 300, 30);
  };

  var adjustableTimeout = () => {
    value = new BigNumber(0);
    clearInterval(efInterval)
    efInterval = setInterval(draw, intervalRegularity)
  }
  adjustableTimeout();
}

function adjustEfficiency() {
  var max = miningEfficiency.greaterThanOrEqualTo(efficiencyMax) ? efficiencyMax : miningEfficiency;
  var eff = miningEfficiency.greaterThanOrEqualTo(efficiencyMax) ? efficiencyMax : miningEfficiency;
  efTimeout(max)
}

function refreshUi() {
  updateUiCoinBal();
  updateUiSpeed();
  updateUiEfficiency();
  checkSmeltButton();
  adjustEfficiency();
}

function getPollingBalance() {
  setInterval(() => {
    game.balanceOf(playerAddress, (err, result) => {
    });
  }, 200);
}

function startUpUi() {
  nugIncrementer();
  updateUiCoinBal();
  speedTimeout(new BigNumber(1));
  adjustEfficiency();
  rerenderClickCycle(new BigNumber(-1));
  statsMenuButtons();
  updateUiSpeed();
  updateUiEfficiency();
  checkSmeltButton();
  whitepaperButton();
  getGoods()
  .then(() => placeGoods())
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
    console.log(`playerAddress is ${playerAddress}`)
      game.playerGetter(playerAddress, (err, player) => {
        if (err) return rej(err);
        console.log(player)
        const seedCheck = new BigNumber(player[0])
        if (seedCheck.equals(0)) {
          return res(false);
        } 
        // probably don't need to reassign seed and strippedSeed here
        seed = player[0];
        strippedSeed = seed.substring(2, seed.length);
        miningEfficiency = new BigNumber(player[1]);
        miningSpeed = new BigNumber(player[2]);
        canSmelt = player[3];
        ownedGoods = player[4];
        numClicks = new BigNumber(player[5]);
        return refreshBalance()
        .then(() => res(true))
      })
  })
}

function checkForGame(first) {
  return getPlayerAndSetVars()
  .then((player) => {
    if (!player) return prompt("No game detected with this address, would you like to play?", "No", hidePrompt, "Yes", beginGame);
    return startUpUi();
  })
}

function getSeed() {
  if (seedInt >= strippedSeed.length - 1) { 
    seedInt = 0;
  } else {
    seedInt ++;
  }
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
    }
    const onLoad = (texture) => resolve (texture);
    const onError = (event) => reject (event);
    return new THREE.TextureLoader().load(
      `assets/${label}${identfier}.jpg`, onLoad, () => {}, onError);
  })
}

function getItemTexture(label) {
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
    var randz = random((window.innerHeight/4) * -1, window.innerHeight/4);
    mesh.position.x = randx;
    mesh.position.z = randz;
    mesh.position.y = 30;
    scene.add(mesh);
    return mesh;
  })
}

function updateQuad(quad, layer) {
  getMaskTexture("MaskBlur", layer)
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
  var name = cacheGoods[goodIdent][0].toLowerCase().replace(/ /g, '-');
  for (let i = 0; i < numberOwned; i++) {
    genQuadItem(name)
    .then(quad => {
      drawnGoods.push(quad)
    })
  }
}

function clickCycle(scopedNumClicks) {
  if (scopedNumClicks.equals(0)) {
    return genQuadNoMask("Grass", "0", 0)
    .then((newMesh) => {
      dirtLayers.push(newMesh);
      return;
    })
  }
  if (dirtLayers.length > maxMask) {
    scene.remove(dirtLayers[0])
    dirtLayers.splice(0, 1);
  }
  if (scopedNumClicks.greaterThan(1)) {
      if (darkness > 30) {
        darkness -= 45;
      } else {
        darkness = 0;
      }
  }
  var layer = dirtLayers.length;
  for (let i = 0; i < dirtLayers.length; i++) {
    updateQuad(dirtLayers[i], layer);
    layer -= 1;
  } 
  var rand = random(0, 8);
  return genQuad("Dirt", rand, dirtLayers.length + 1)
  .then((newMesh) => {
    dirtLayers.push(newMesh);
    return;
  })
}

function bounceCoin () {
  var coin = document.getElementById("coinImg")
  coin.classList.add("animated");
  coin.classList.add("bounce");
  setTimeout(() => {
    coin.classList.remove("animated");
    coin.classList.remove("bounce");
  }, 1000)
}

function click () {
  if (!clickAllowed) { 
    prompt("You can't mine faster than your equipment allows!", "Ok", hidePrompt);
    return;
  }
  return game.click({from: playerAddress, gas: "210000"}, (err, result) => {
    if (err) console.log(err)
    clickAllowed = false;
    return getTransactionReceiptMined(result)
    .then(() => {
      return getPlayerAndSetVars()
      .then(() => {
        refreshUi();
        bounceCoin();
        clickCycle(numClicks);
        speedTimeout(miningSpeed);
      })
    }).catch((e) => {
      speedTimeout(miningSpeed);
      console.log(e)
    })
  })
}

function makeWallet() {
  body.appendChild()
}

function init() {
  if (allowedBrowser) { 

  }
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
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
}