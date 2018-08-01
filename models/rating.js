const mongoose = require('mongoose');

const RatingSchema = mongoose.Schema({
	timestamp:{
		type : Number,
		required: true,

	},
	rating:{
		type : Object,
		required: true,

	}
});


const Rating = module.exports = mongoose.model('Rating', RatingSchema);