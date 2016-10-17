var StellarSdk = require('stellar-sdk');
var pair = StellarSdk.Keypair.random();

console.log(pair.seed());
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
console.log(pair.accountId());
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
