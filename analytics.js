
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
			let numOfCalls = addresses.length
			let weekArray = constructDatesArray('week')
			let monthArray = constructDatesArray('month')

			for(i=0;i<addresses.length;i++){
				let addr = addresses[i].addr
				rating[addr] ={'total':{profit:0, rating:0}, 'month':{profit:0, rating:0}, 'week':{profit:0, rating:0}}
				setTimeout(()=>{
					this.pullTransactions(addr, (data)=>{
						for (elem of data){
							if(elem.type ==='paymentChannelClaim' && 
								elem.outcome.result ==='tesSUCCESS' && 
								elem.outcome.balanceChanges[addr]){

								for(tx of elem.outcome.balanceChanges[addr]){
									if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
										rating[addr].total.profit +=parseFloat(tx['value'])
									}
								}
								if(weekArray.includes(elem.outcome.timestamp.split('T')[0])){
									for(tx of elem.outcome.balanceChanges[addr]){
										if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
											rating[addr].week.profit +=parseFloat(tx['value'])
										}
									}
								}
								if(monthArray.includes(elem.outcome.timestamp.split('T')[0])){
									for(tx of elem.outcome.balanceChanges[addr]){
										if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
											rating[addr].month.profit +=parseFloat(tx['value'])
										}
									}
								}

							}
						}
						numOfCalls--
						
						if(numOfCalls <=0){
							calculateRating(rating)
						}
						

					})

				},(i+1)*5000)
				
			}
		})
	},

	getTopAccounts: function(callback){
		Rating.findOne({}, {}, { sort: { 'timestamp' : -1 } }, (err, data)=>{
			if(err){
				console.log(err)
				return callback(null)
			}else{
				
				let rating = {total:[], month:[], week:[]}
				for(i=1;i<11;i++){
					for (elem in data.rating){
						
						if(data.rating[elem].total.rating === i){
							rating.total.push(data.rating[elem].total.profit.toFixed(6))
						}
						if(data.rating[elem].month.rating === i){
							rating.month.push(data.rating[elem].month.profit.toFixed(6))
						}
						if(data.rating[elem].week.rating === i){
							rating.week.push(data.rating[elem].week.profit.toFixed(6))
						}
					}
				}
				
				return callback(rating)
			}
		})
	},

	getPersonalRating: function(addr, callback){
		Rating.findOne({}, {}, { sort: { 'timestamp' : -1 } }, (err, data)=>{
			if(err){
				console.log(err)
				return callback(null)
			}else{
				let result=null
				for(elem in data.rating){
					
					if(elem ===addr){
						let accounts = Object.keys(data.rating).length
						
						 
						result = {totalRating:data.rating[elem].total.rating,
								totalPerf:Math.round((1-data.rating[elem].total.rating/accounts)*100),
								monthRating:data.rating[elem].month.rating,
								monthPerf:Math.round((1-data.rating[elem].month.rating/accounts)*100),
								weekRating:data.rating[elem].week.rating,
								weekPerf:Math.round((1-data.rating[elem].week.rating/accounts)*100)}
					}
				}

				return callback(result)
			}
		})
	}

}

function calculateRating(rating){
	//total
	let complexArray=[]
	for(key in rating){
		complexArray.push([key, rating[key].total.profit])
	}
	complexArray = complexArray.sort(function(a,b){
		return b[1] - a[1];
	});
	let simpleArray=[]
	for(elem of complexArray){
		simpleArray.push(elem[0])
	}
	for(var key in rating){
      rating[key].total.rating= simpleArray.indexOf(key)+1
    }
    //monthly
    complexArray.length=0
    simpleArray.length=0
    for(key in rating){
		complexArray.push([key, rating[key].month.profit])
	}
	complexArray = complexArray.sort(function(a,b){
		return b[1] - a[1];
	});
	
	for(elem of complexArray){
		simpleArray.push(elem[0])
	}
	for(var key in rating){
      rating[key].month.rating= simpleArray.indexOf(key)+1
    }
    //weekly
    complexArray.length=0
    simpleArray.length=0
    for(key in rating){
		complexArray.push([key, rating[key].week.profit])
	}
	complexArray = complexArray.sort(function(a,b){
		return b[1] - a[1];
	});
	
	for(elem of complexArray){
		simpleArray.push(elem[0])
	}
	for(var key in rating){
      rating[key].week.rating= simpleArray.indexOf(key)+1
    }
    //save to db
    let newRating = new Rating({
			timestamp: Math.round(Date.now()/1000),
			rating: rating
		}).save((err)=>{
			if(err){
				console.log(err)
			}
		})



}

function constructDatesArray(type){
	let daysArray =[]
	let d = new Date();
	for(i=0;i<30;i++){
		d.setDate(d.getDate() -1);
		endDay = d.getUTCDate()
		if(endDay.toString().length ===1){
			endDay= '0'+endDay
		}
		endMonth = d.getUTCMonth() +1
		if(endMonth.toString().length ===1){
			endMonth= '0'+endMonth
			
		}
		endYear = d.getUTCFullYear()
		endDate = endYear+'-'+endMonth+'-'+endDay
		daysArray.push(endDate)

	}
	switch (type){
		case 'week':
		return daysArray.slice(0,7)
		case 'month':
		return daysArray
	}
}