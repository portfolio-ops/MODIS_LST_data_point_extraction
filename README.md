This script extracts Land Surface Temperature (LST) data from MODIS for Nairobi County, generates 200 random sampling points, and exports the extracted data to CSV.

🔹 Key Steps in the Code
Load Kenya Counties Dataset

Uses the FAO GAUL dataset to get all counties in Kenya.
Filters it to select Nairobi County.
Ensures the county exists and has a valid boundary.
Load MODIS LST Data

Fetches MODIS LST 8-day composite data (MODIS/061/MOD11A2).
Filters the dataset for January - March 2025.
Selects the "LST_Day_1km" band (daytime LST).
Converts LST from Kelvin to Celsius using the formula:
𝐿
𝑆
𝑇
(
°
𝐶
)
=
(
𝐿
𝑆
𝑇
×
0.02
)
−
273.15
LST(°C)=(LST×0.02)−273.15
Compute and Visualize Mean LST

Computes the mean LST over the selected time period.
Clips it to Nairobi’s boundary.
Applies a color palette (blue → red) for visualization.
Generate 200 Random Points for Sampling

Uses randomPoints() to create 200 sampling locations inside Nairobi.
Fixes the "Region must not be empty" error by applying a buffer to the county boundary.
Extract LST Values at Random Points

Uses sampleRegions() to extract LST at each random point.
Ensures correct scale (1km) and CRS projection.
Adds the sampled points to the map.
Export Extracted Data to CSV

Saves the extracted 200 LST points with coordinates.
The file is named "LST_200_Random_Points_Nairobi.csv".
Data is exported to Google Drive.
