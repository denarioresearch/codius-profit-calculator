const express  = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cfenv = require("cfenv");
const config = require('./config')

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

mongoose.connect(config.dburl, {
  useNewUrlParser: true
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
	secret: 'keyboard cat',
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	resave: false,
	saveUninitialized: false
}));

let main = require('./routes/main');
app.use('/', main);

var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host

app.listen(appEnv.port, function() {
	
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
  console.log("server running on " + appEnv.port);
});
