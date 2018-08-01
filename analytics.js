
const config=require('./config')
const Addr = require('./models/addr')
const Rating = require('./models/rating')
const RippleAPI = require('ripple-lib').RippleAPI;

const api = new RippleAPI({
  server: config.server 
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

module.exports = {
	saveAddr:function(address){
		Addr.findOne({addr : address},(err,addr)=>{
			if(err){
				console.log(err)
			}else if(addr ===null){
				let newAddr = new Addr({
					timestamp: Math.round(Date.now()/1000),
					addr: address
				}).save((err)=>{
					if(err){
						console.log(err)
					}
					
				})
			}
		})
	},

	pullTransactions:function(addr, callback){
		api.connect().then(() => {
			api.getTransactions(addr, {minLedgerVersion: 38988009}).then((data)=>{

				return callback(data)
			})
		}).then(() => {
			
		}).catch(console.error);
			
	},

	prepareTopAccountsRating: function(){
		
		let rating ={}
		Addr.find({},(err, addresses)=>{
			for(address of addresses){
				let addr = address.addr
				rating[addr] =0
				this.pullTransactions(addr, (data)=>{
					for (elem of data){
						if(elem.type ==='paymentChannelClaim' && 
							elem.outcome.result ==='tesSUCCESS' && 
							elem.outcome.balanceChanges[addr]){

							for(tx of elem.outcome.balanceChanges[addr]){
								if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
									rating[addr] +=parseFloat(tx['value'])
								}
							}
						}
					}
				})
				
			}
		})
		setTimeout(()=>{
			let newRating = new Rating({
				timestamp: Math.round(Date.now()/1000),
				rating: rating
			}).save((err)=>{
				if(err){
					console.log(err)
				}
			})
		},300000)
	}

}