// ---------------------------------
// 1. Load Kenya Counties Dataset
// ---------------------------------
var kenyaCounties = ee.FeatureCollection("FAO/GAUL/2015/level1")
                      .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));
                      
                      print(kenyaCounties);

// ---------------------------------
// 2. Select Nairobi County
// ---------------------------------
var countyName = 'Nairobi';  
var selectedCounty = kenyaCounties.filter(ee.Filter.eq('ADM1_NAME', countyName));

// Ensure County Exists & Has a Valid Geometry
var countyGeometry = ee.Geometry(selectedCounty.geometry());  // Ensure geometry is valid
var countyExists = countyGeometry.area().gt(0);

if (countyExists) {
  // Center on County
  Map.centerObject(selectedCounty, 10);
  Map.addLayer(selectedCounty.style({color: 'black', width: 2}), {}, countyName);

  // ---------------------------------
  // 3. Load MODIS LST Data (8-Day Composite)
  // ---------------------------------
  var modisLST = ee.ImageCollection("MODIS/061/MOD11A2")
                  .filterBounds(selectedCounty)
                  .filterDate('2025-01-01', '2025-03-01')
                  .select("LST_Day_1km");

  // Convert LST from Kelvin to Celsius
  var kelvinToCelsius = function(image) {
    return image.multiply(0.02).subtract(273.15)
                .copyProperties(image, ['system:time_start']);
  };

  var lstCelsius = modisLST.map(kelvinToCelsius);

  // Compute Mean LST Over the Time Period
  var lstMean = lstCelsius.mean().clip(selectedCounty);

  // ---------------------------------
  // 4. Visualization Settings
  // ---------------------------------
  var lstVis = {
    min: 10, max: 45,  
    palette: ['blue', 'cyan', 'green', 'yellow', 'orange', 'red']
  };

  // Add LST Layer to Map
  Map.addLayer(lstMean, lstVis, "Mean LST (°C)");

  // ---------------------------------
  // 5. Generate 200 Random Points for LST Sampling (Fixed Empty Region)
  // ---------------------------------
  var randomPoints = ee.FeatureCollection.randomPoints({
    region: countyGeometry.buffer(5000),  // Buffer to avoid empty region issues
    points: 200,  // Extract 200 points per county
    seed: 42  // Ensures reproducibility
  });

  // Extract LST Values at These Random Points
  var lstAtRandomPoints = lstMean.sampleRegions({
    collection: randomPoints,
    scale: 1000,  // MODIS scale = 1km
    projection: lstMean.projection(),  // Fix CRS issue
    geometries: true
  });

  // Show Extracted Random Points
  Map.addLayer(lstAtRandomPoints, {color: 'black'}, "Random LST Sample Points");

  // ---------------------------------
  // 6. Export Random LST Data to CSV
  // ---------------------------------
  Export.table.toDrive({
    collection: lstAtRandomPoints,
    description: 'LST_200_Random_Points_Nairobi',
    fileFormat: 'CSV'
  });

} else {
  print("Error: Selected county not found or has no valid geometry.");
}
