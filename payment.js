// We need to configure account A first
var axios = require("axios");
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var keypairA = StellarSdk.Keypair.fromSeed("SD4EAHU67NIQKAMLW6FEWLQEBRJYJXRV2CR2GMKHY3RXCCMJMA265R5O");
var keypairB = StellarSdk.Keypair.fromSeed("SDHNQ7FUBPD44AEGNXCQ5TWUWQLUTAZTZX2AYNZON3QAHIVEVQZDKACM");

axios.post('http://localhost:8000/validateTransaction').then(function(response){
   console.log(response.data);

   });

var amountVar="60";

server.loadAccount(keypairA.accountId())
  .then(function(sourceAccount) {


    // Start building the transaction.
    var transaction = new StellarSdk.TransactionBuilder(sourceAccount)
      .addOperation(StellarSdk.Operation.payment({
        destination: "GAWWDIJZKY7EOEWSRTK3ZFPTJZMBU5XH5SHLD7Z52DEG5422PGZ2DAZL", // Sending to some other account
        asset: StellarSdk.Asset.native(),
        amount: amountVar // Sending 20 XLM
      }))
      .build();
    // IMPORTANT! Now we need two signatures:
    // * From master: account A
    // * From signer: account B
    transaction.sign(keypairA);
    if(amountVar>50)
      {
        server.loadAccount(keypairA.accountId())
          .then(function(sourceAccount) {


            // Start building the transaction.
            var transaction = new StellarSdk.TransactionBuilder(sourceAccount)
              .addOperation(StellarSdk.Operation.payment({
                destination: "GAWWDIJZKY7EOEWSRTK3ZFPTJZMBU5XH5SHLD7Z52DEG5422PGZ2DAZL", // Sending to some other account
                asset: StellarSdk.Asset.native(),
                amount: "50" // Sending 20 XLM
              }))
              .build();
            // IMPORTANT! Now we need two signatures:
            // * From master: account A
            // * From signer: account B
            transaction.sign(keypairB);
            transaction.sign(keypairA);
            return server.submitTransaction(transaction);
          });


      }
else{
    transaction.sign(keypairB)
    return server.submitTransaction(transaction);
}
  });
