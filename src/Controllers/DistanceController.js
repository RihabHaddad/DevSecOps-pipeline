const mongoose = require('mongoose');

exports.CreateDistanceTravelled = async(req,res, next)=>{
    const DriverId = req.query.id;    
    try {
      const results = await DriverBehavior.find({"DriverId": req.query.id+'' })
      
      var Totable = JSON.parse(JSON.stringify(results));
          var table = [];
          for(var i in Totable){
            table.push(Totable[i]);
          }
              
            // res.send(table)
            
  } catch (error) {
      console.log(error.message);
  }
  var property = 0
  var DistanceTotal = 0
  var dis = 0
  let time
  for (property = 0 ; property < table.length-1 ; property++) {
        const start = {
        latitude:  table[property].Latitude,
        longitude: table[property].Longitude
        }
        
        var prop2 = property + 1
        const end = {
          latitude: table[prop2].Latitude,
          longitude: table[prop2].Longitude
        }
            
            dis = haversine(start,end)
            DistanceTotal = DistanceTotal+haversine(start, end);
            time= table[table.length-1].time 
            
      property = property+1;
  }

            
            var DistanceObj = new Distance();
            try {

              DistanceObj.DriverId = DriverId
              DistanceObj.distanceTotal=DistanceTotal
              DistanceObj.time=time
              const resultt = await DistanceObj.save();
              res.send(resultt);

            } catch (error) {
              console.log(error.message);
              
              
          }
      


},

exports.getDistance = async(req,res,next)=>{
  try {
    const distance = await Distance.find({"DriverId": req.params.id }).sort( [['_id', -1]] ).limit(1);
    res.send(distance);
      } catch (error) {
    res.status(404).json({message: error.message});
}
} ,
exports.getAllDistance = async(req,res,next)=>{
  try {
    const results = await Distance.find();
    res.send(results);
  } catch (error) {
    console.log(error.message);
  }
} 

  
