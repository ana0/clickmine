mergeInto(LibraryManager.library, {

  Hello: function () {
    var isWeb3 = window.web3.isConnected;
    window.alert(isWeb3);
  },

  HelloString: function (str) {
    window.alert(Pointer_stringify(str));
  },

  PrintFloatArray: function (array, size) {
    for(var i = 0; i < size; i++)
    console.log(HEAPF32[(array >> 2) + size]);
  },

  AddNumbers: function (x, y) {
    return x + y;
  },

  StringReturnValueFunction: function () {
    var returnStr = "bla";
    var buffer = _malloc(lengthBytesUTF8(returnStr) + 1);
    writeStringToMemory(returnStr, buffer);
    return buffer;
  },

  BindWebGLTexture: function (texture) {
    GLctx.bindTexture(GLctx.TEXTURE_2D, GL.textures[texture]);
  },

});