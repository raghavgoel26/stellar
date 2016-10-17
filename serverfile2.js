const Hapi = require("hapi");
const server = new Hapi.Server();
const axios = require('axios');

var accountMap={
  "GB2O6FHKUEZETX3DQDKSONLWE4LJQ22HK3SZSESAA2YOQWXK32UM2EHU":"A",
  "SAAF5GZHN6BXJW4PL6E6UBAWPBZI7PHPIVAUS4XGOLGHWEZLJ432SCTL":"B",
  "SCCTOLWTZKGTGRJAXKPAEPG3JHX2RXWUVMZPH3JRFJSPAI7IBS4KK5VU":"C",

};
var StellarSdk = require('stellar-sdk');
var server2 = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var effortsTemp={sender:[],amount:[]};

function getEfforts(accountId,callback){

console.log("hello");
axios.get("https://horizon-testnet.stellar.org/accounts/"+accountId+"/operations?order=desc").then(function(response){
  console.log(response.data._embedded.records[0].amount);
    effortsTemp.sender.push(response.data._embedded.records[0].from);
    effortsTemp.amount.push(response.data._embedded.records[0].amount);

  console.log(effortsTemp);
  callback();
});
  // server2.transactions()
  //     .forAccount(accountId)
  //     .call()
  //     .then(function (page) {
  //        var size = page.records.length;
  //        server2.operations()
  //          .forTransaction(page.records[size-1].id)
  //          .call()
  //          .then(function (operationsResult) {
  //            console.log(operationsResult.records[0].amount);
  //              effortsTemp={sender:operationsResult.records[0].from,
  //                           amount: operationsResult.records[0].amount};
  //              callback();
  //          })
  //          .catch(function (err) {
  //            console.log(err)
  //          })
  //
  //     })
  //     .catch(function (err) {
  //         console.log(err);
  //     });
  //

};

function buildNewTransaction(senderPrivateKey,receiverPublicKey,efforts,callback) {

  var sourceKeys = StellarSdk.Keypair
    .fromSeed(senderPrivateKey);
  var destinationId =receiverPublicKey;

  // First, check to make sure that the destination account exists.
  // You could skip this, but if the account does not exist, you will be charged
  // the transaction fee when the transaction fails.
  server2.loadAccount(destinationId)
    // If the account is not found, surface a nicer error message for logging.
    .catch(StellarSdk.NotFoundError, function (error) {
      throw new Error('The destination account does not exist!');
    })
    // If there was no error, load up-to-date information on your account.
    .then(function() {
      return server2.loadAccount(sourceKeys.accountId());
    })
    .then(function(sourceAccount) {
      // Start building the transaction.
      var senderMemo;
      if(accountMap[sourceKeys.accountId()])
      {
        senderMemo=sourceKeys.accountId();
      }
      else {senderMemo=effortsTemp.sender[0]};
      var transaction = new StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationId,
          // Because Stellar allows transaction in many currencies, you must
          // specify the asset type. The special "native" asset represents Lumens.
          asset: StellarSdk.Asset.native(),
          amount: efforts
        }))
        // A memo allows you to add your own metadata to a transaction. It's
        // optional and does not affect how Stellar treats the transaction.

        .addMemo(StellarSdk.Memo.text('Test Transaction from '+accountMap[senderMemo]))
        .build();
      // Sign the transaction to prove you are actually the person sending it.
      transaction.sign(sourceKeys);
      // And finally, send it off to Stellar!
      return server2.submitTransaction(transaction);
    })
    .then(function(result) {
      console.log('Success! Results:', result);

              callback();
    })
    .catch(function(error) {
      console.error('Something went wrong!', error);
    });


};



server.connection({
    //host : 'localhost',
    port : 80,
    routes : {
        cors : true
    }
});


server.route({
    path : '/getEfforts',
    method : 'GET',
    handler : function(request,reply){

        getEfforts("GCHJISLRF3GDN7BZHNFFHOYVJEZEPTCVOA2EAHCR3F2B43ZT6LX4MU3Q",function(){
          console.log("effortstemp="+effortsTemp);
          reply(effortsTemp);
        });
    }
});

server.route({

        path:'/submitEfforts',
        method : 'POST',
        handler : function(request,reply){
                        console.log("request received for submitting efforts");
                        var efforts=request.payload.efforts;
                        console.log(efforts);
                        buildNewTransaction('SAGTGGZKBX4TVAAJYJDK4AGHHA77VEU6YESBL5RGJIGMDG77DAZBLCWM','GCHJISLRF3GDN7BZHNFFHOYVJEZEPTCVOA2EAHCR3F2B43ZT6LX4MU3Q',efforts,function(){
                          console.log("transaction initiated from A to B ");
                          reply("transaction initiated from A to B ");
                        });
                }
});

server.route({
    path : '/validateEfforts',
    method : 'GET',
    handler : function(request,reply){
      console.log(effortsTemp);
      var efforts=effortsTemp.amount[0];
      buildNewTransaction('SAAF5GZHN6BXJW4PL6E6UBAWPBZI7PHPIVAUS4XGOLGHWEZLJ432SCTL','GDQ7TACJPMTJJWFI2U5PIYTZTWC23QEQ2OBW4B7LOQZOGJR2IEYEUWP4',efforts,function(){
        console.log("transaction initiated from B to C ");
        reply("transaction initiated from B to C ");
      });
     }
});

server.route({
    path : '/updateEfforts',
    method : 'POST',
    handler : function(request,reply){
      console.log("efforts to reject"+request.payload.effortsToReject);
      var efforts=request.payload.effortsToApprove;
      buildNewTransaction('SAAF5GZHN6BXJW4PL6E6UBAWPBZI7PHPIVAUS4XGOLGHWEZLJ432SCTL','GDQ7TACJPMTJJWFI2U5PIYTZTWC23QEQ2OBW4B7LOQZOGJR2IEYEUWP4',efforts,function(){
        console.log("transaction initiated from B to C ");
        var efforts=request.payload.effortsToReject;
        efforts+="";
        buildNewTransaction('SAAF5GZHN6BXJW4PL6E6UBAWPBZI7PHPIVAUS4XGOLGHWEZLJ432SCTL','GB2O6FHKUEZETX3DQDKSONLWE4LJQ22HK3SZSESAA2YOQWXK32UM2EHU',efforts,function(){
          console.log("transaction initiated from B to A ");
        });
      });

      buildNewTransaction('SAAF5GZHN6BXJW4PL6E6UBAWPBZI7PHPIVAUS4XGOLGHWEZLJ432SCTL','GDQ7TACJPMTJJWFI2U5PIYTZTWC23QEQ2OBW4B7LOQZOGJR2IEYEUWP4',efforts,function(){
        console.log("transaction initiated from B to C ");
      });


        }
});


server.start(function(){
    console.log("Hapi API server running at " + server.info.uri);
});
