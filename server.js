// server.js

const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');


const server = express();
const apiKey="f963e6db21192b1fdbbf1614deb3d9c1";


// parse JSON (application/json content-type)
//server.use(body_parser.json());
server.use(express.static('public'));
server.use(bodyParser.urlencoded({ extended: true }));
server.set('view engine', 'ejs');

const port = 4000;

// << db setup >>
const db = require("./db");
const dbName = "weather";
const collectionName = "temp";


db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
   // get all items
   dbCollection.find().toArray(function (err, result) {
      if (err) throw err;
	  console.log(dbName);
	  	  console.log(dbCollection);

      console.log(result);

      // << return response to client >>
   });
router.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
});

router.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${city}`;

  request(url, function (err, response, body) {
    if(err){
      return res.render('index', {weather: null, error: 'Error, please try again'});
    }
    let weather = JSON.parse(body);
    if(weather.current == undefined){
      return res.render('index', {weather: null, error: 'Error, please try again'});
    }
    let weatherText = `It's ${weather.current.temperature} degrees ${weather.current.is_day === "yes" ? 'Day time' : 'Night time'} in ${weather.location.name}, ${weather.location.country}!`;
    res.render('index', {weather: weatherText, error: null});
  });
});

server.use('/', router);


   // server.get("/items/:id", (request, response) => {
   // server.get("/items/:id", (request, response) => {
      // const itemId = request.params.id;

      // dbCollection.findOne({ id: itemId }, (error, result) => {
         // if (error) throw error;
         // // return item
         // response.json(result);
      // });
   // });

   // server.get("/items", (request, response) => {
      // // return updated list
      // dbCollection.find().toArray((error, result) => {
         // if (error) throw error;
         // response.json(result);
      // });
   // });

   server.put("/items/:id", (request, response) => {
      const itemId = request.params.id;
      const item = request.body;
      console.log("Editing item: ", itemId, " to be ", item);

      dbCollection.updateOne({ id: itemId }, { $set: item }, (error, result) => {
         if (error) throw error;
         // send back entire updated list, to make sure frontend data is up-to-date
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

   server.delete("/items/:id", (request, response) => {
      const itemId = request.params.id;
      console.log("Delete item with id: ", itemId);

      dbCollection.deleteOne({ id: itemId }, function (error, result) {
         if (error) throw error;
         // send back entire updated list after successful request
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

}, function (err) { // failureCallback
   throw (err);
});

server.listen(port, () => {
   console.log(`Server listening at ${port}`);
});