const Addr = require('./models/addr')

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
	}
}