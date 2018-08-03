
const validator = require('wallet-address-validator');
const analytics =require('../analytics')
const express  = require('express');
const config = require('../config')
const router = express.Router();




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
	if(validator.validate(addr,'XRP') && !config.ilpConnectors.includes(addr)){
		analytics.pullTransactions(addr,(data)=>{
			analytics.saveAddr(addr)

			res.json(data)
		})

	}else{
		console.log('invalid address ',addr)
		res.json(null)
	}
	
})




module.exports = router;