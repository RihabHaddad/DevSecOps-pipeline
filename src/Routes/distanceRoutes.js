router.post('/NewDistance', DistanceController.CreateDistanceTravelled);
router.get('/RetreiveDistance/:id', DistanceController.getDistance);
router.get('/distance/all',DistanceController.getAllDistance);