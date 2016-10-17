const Hapi = require("hapi");
const server = new Hapi.Server();
const axios = require('axios');

var effort;
var transaction,transaction2;
console.log("Inside buildTransaction");

var StellarSdk = require('stellar-sdk');
var server2 = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var keypairA = StellarSdk.Keypair.fromSeed("SD4EAHU67NIQKAMLW6FEWLQEBRJYJXRV2CR2GMKHY3RXCCMJMA265R5O");
var keypairB = StellarSdk.Keypair.fromSeed("SDHNQ7FUBPD44AEGNXCQ5TWUWQLUTAZTZX2AYNZON3QAHIVEVQZDKACM");

function buildTransaction(callback) {

  console.log("efforts="+effort);

      server2.loadAccount(keypairA.accountId())
        .then(function(sourceAccount) {
          // Start building the transaction.
          transaction = new StellarSdk.TransactionBuilder(sourceAccount)
            .addOperation(StellarSdk.Operation.payment({
              destination: "GAWWDIJZKY7EOEWSRTK3ZFPTJZMBU5XH5SHLD7Z52DEG5422PGZ2DAZL", // Sending to some other account
              asset: StellarSdk.Asset.native(),
              amount: effort // Sending 20 XLM
            }))
            .build();
          // IMPORTANT! Now we need two signatures:
          // * From master: account A
          // * From signer: account B
           transaction.sign(keypairA);
           console.log("transaction amount="+effort);
          // transaction.sign(keypairB);
          // return server.submitTransaction(transaction);
      });


        callback();
}

function buildNewTransaction(callback) {

      effort="50";

      server2.loadAccount(keypairA.accountId())
        .then(function(sourceAccount) {
          // Start building the transaction.
           transaction2 = new StellarSdk.TransactionBuilder(sourceAccount)
            .addOperation(StellarSdk.Operation.payment({
              destination: "GAWWDIJZKY7EOEWSRTK3ZFPTJZMBU5XH5SHLD7Z52DEG5422PGZ2DAZL", // Sending to some other account
              asset: StellarSdk.Asset.native(),
              amount: effort // Sending 20 XLM
            }))
            .build();
          // IMPORTANT! Now we need two signatures:
          // * From master: account A
          // * From signer: account B
          //  transaction2.sign(keypairA);
           transaction2.sign(keypairB);
          //  return server2.submitTransaction(transaction2);
      });

        callback();
}






server.connection({
    //host : 'localhost',
    port : 80,
    routes : {
        cors : true
    }
});

server.route({
    path : '/validateTransaction',
    method : 'POST',
    handler : function(request,reply){
      transaction.sign(keypairB);
      server2.submitTransaction(transaction);
        // reply("hello from server");

    }
});

server.route({
    path : '/validateEfforts',
    method : 'POST',
    handler : function(request,reply){
      transaction2.sign(keypairA);
      server2.submitTransaction(transaction2);
        // reply("hello from server");

    }
});


server.route({
    path : '/rejectTransaction',
    method : 'POST',
    handler : function(request,reply){

      effort="50";
      console.log(effort);
      buildNewTransaction(function(){
        console.log("transaction initiated from A to C ");
        reply("transaction initiated from A to C ");
      });
      console.log("Promise is being evaluated ");


    }
});


server.route({
    path : '/getEfforts',
    method : 'GET',
    handler : function(request,reply){

        reply(effort);

    }
});

server.route({

        path:'/submitEfforts',
        method : 'POST',
        handler : function(request,reply){
                        console.log("request received for submitting efforts");
                        effort=request.payload.effort;
                        console.log(effort);
                        buildTransaction(function(){
                          console.log("effort submitted");
                         reply("effort submoitted");
                        });
                        console.log("Promise is being evaluated ");


                }
});

server.start(function(){
    console.log("Hapi API server running at " + server.info.uri);
});
