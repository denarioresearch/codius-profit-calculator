const mongoose = require('mongoose');

const AddrSchema = mongoose.Schema({
	timestamp:{
		type : Number,
		required: true,

	},
	addr:{
		type : String,
		required: true,

	}
});


const Addr = module.exports = mongoose.model('Addr', AddrSchema);