// var XDR = require('js-xdr');
var XDR = require('js-xdr');
// var jsonXDR = require('json-xdr');
// import { toJSON } from 'json-xdr';
// import { toXDR } from 'json-xdr';

var test = XDR.UnsignedInt.fromXDR([0xff, 0xff, 0xff, 0xff]);

console.log(test);

function gila() {
    console.log(test);
}
// var sinting = new XDR;
module.exports= XDR;