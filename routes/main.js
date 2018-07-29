const server='wss://s2.ripple.com:443'
const validator = require('wallet-address-validator');
const express  = require('express');
const router = express.Router();


const RippleAPI = require('ripple-lib').RippleAPI;
const api = new RippleAPI({
  server: server 
});
api.on('error', (errorCode, errorMessage) => {
  console.log(errorCode + ': ' + errorMessage);
});
api.on('connected', () => {
  console.log('connected to ripple');
});
api.on('disconnected', (code) => {
  // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
  // will be 1000 if this was normal closure
  console.log('disconnected, code:', code);
});

router.get('/', function(req, res){
	res.render('index');
	
});

router.route('/submitaddr').post(function(req, res){
	let addr =req.body.addr
	return res.redirect('/analyze/'+addr)
	
	
});

router.route('/analyze/:addr').get((req, res)=>{
	
	if(validator.validate(req.params.addr,'XRP')){
		res.render('index')
	}else{
		console.log('invalid address ',req.params.addr)
		res.send('invalid XRP address')
	}
})

router.route('/loaddata').get((req, res)=>{
	let addr = req.query.addr
	if(validator.validate(addr,'XRP')){
		api.connect().then(() => {
		  api.getTransactions(addr, {minLedgerVersion: 38988009}).then((data)=>{
		  	
			res.json(data)
		  })
		}).then(() => {
			
		}).catch(console.error);

	}else{
		console.log('invalid address ',addr)
		res.json(null)
	}
	
})




module.exports = router;