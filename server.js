// Ref: 
// Refer to this URL for setup on Facebook side:
// https://developers.facebook.com/docs/messenger-platform/quickstart
// =============================================================================


// call the packages we need
var express     = require('express');       // call express
var app         = express();                // define our app using express
var bodyParser  = require('body-parser');
var logfmt      = require('logfmt');
var multiparty  = require('multiparty');
var util        = require('util');
var Grid        = require('gridfs-stream');
var fs          = require("fs");
var Promise     = require('promise');
var request     = require("request");

// This application runs on port defined by: 
var port = 8080;

// Page token required to communicate with Facebook
var token = TOKEN_VALUE;

// app.use([path,] function [, function...]) mounts the middleware function(s) at the path.  
// If path not specified, defaults to "/"

// logging
app.use(logfmt.requestLogger());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.all(path, callback [, callback ...])
// This method is like the standard app.METHOD() methods, except it matches all HTTP verbs.
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // To allow cross-origin so front-end dev can be done on a different box.
    //http://stackoverflow.com/questions/12111936/angularjs-performs-an-options-http-request-for-a-cross-origin-resource
    //res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods",'PUT,GET,POST,DELETE');
    res.header("Access-Control-Allow-Headers", ['content-type','X-Chop-User-Session-Token','x-parse-application-id','x-parse-rest-api-key']);
    next();    
});

var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Got Bot??' });    
});


// ROUTES FOR OUR API
// router.route('/theRoute') returns an instance of a single route which you can then use to handle HTTP verbs with optional middleware. 
// =============================================================================
router.route('/message')
    .get(function(req,res){ 
        res.json({ message: 'Hello Bot!' });   
    })

    .post(function(req,res){
        res.status(500).send('NOT IMPLEMENTED');
    });

// Facebook Webhook
router.route('/webhook')
    .get(function(req,res){
        if (req.query['hub.verify_token'] === 'VERIFICATION_TOKEN') {
            res.send(req.query['hub.challenge']);
        } 
        res.send('Error, wrong validation token'); 
    })

    .post(function(req,res){
        console.log('Message from FB!');
        messaging_events = req.body.entry[0].messaging;
        for (i = 0; i < messaging_events.length; i++) {
            event = req.body.entry[0].messaging[i];
            console.log(event);
            sender = event.sender.id;
            if (event.message && event.message.text) {
                text = event.message.text;
                // Handle a text message from this sender
                sendGenericMessage(sender, "Text received, echo: "+ text.substring(0, 200));
                //sendTextMessage(sender, "Text Received: "+text.substring(0, 200), token);
            }
            if (event.postback) {
                text = JSON.stringify(event.postback);
                sendTextMessage(sender, text.substring(0, 200), token);
                continue;
            }
        }
        res.sendStatus(200);
    });




// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api/v1', router);

// Handle Error
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'FAIL...');
});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api/v1', router);

// Handle Error
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'FAIL...');
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);




// ------------------------------ Messaging FUNCTIONS -------------
 
function replyText(sender, text){

}


function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}



function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Party Time!",
          "subtitle": "Meet our Junk Panda!",
          "image_url": "http://www.o2ebrands.com/sites/default/files/o2ebrands_home_bestdayever_retina.jpg",
          "buttons": [{
            "type": "web_url",
            "url": "http://www.o2ebrands.com/",
            "title": "Come see!"
          }, {
            "type": "postback",
            "title": "Our Panda",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Nature Time!",
          "subtitle": "Real Panda",
          "image_url": "https://s3.amazonaws.com/wwfintcampaigns/panda/slideshow-1.1.jpg",
          "buttons": [{
            "type": "postback",
            "title": "Real Panda",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
