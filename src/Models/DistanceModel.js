const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a Schema
const DistanceSchema = new Schema({
    
    DriverId:{
        type: String,
        
    },
    Distance:{
        type: Number,
    },
    DistanceTotal:{
        type: Number,
    },
    time:{
        type: Date
      }

});
 
// export model
const Distance = mongoose.model('DistanceTravelled', DistanceSchema);
module.exports = Distance;