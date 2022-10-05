import { lineString } from "@turf/helpers";
import lineDistanceFunc from "@turf/line-distance";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const positions = [
    [105.5929313, 20.9624033],
    [105.7724469, 21.0030936],
  ];
  const line = lineString(positions);
  const distance = lineDistanceFunc(line);
  console.log(distance);
  const mapContainer = useRef(null);
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [105.5929313, 20.9624033],
        },
        properties: {
          title: "quoc oai",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [105.7724469, 21.0030936],
        },
        properties: {
          title: "san bong me tri",
        },
      },
    ],
  };
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoidGhhbmhudDgiLCJhIjoiY2w4dG52bDQ1MDM3YzNwbXdycnAxMDdxNSJ9.1RVa2m_pTz1_tZ-pqw6gnA";
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98, 38.88],
      minZoom: 2,
      zoom: 3,
    });

    map.on("load", () => {
      // Add a custom vector tileset source. The tileset used in
      // this example contains a feature for every county in the U.S.
      // Each county contains four properties. For example:
      // {
      //     COUNTY: "Uintah County",
      //     FIPS: 49047,
      //     median-income: 62363,
      //     population: 34576
      // }
      map.addSource("counties", {
        type: "vector",
        url: "mapbox://mapbox.82pkq93d",
      });

      map.addLayer(
        {
          id: "counties",
          type: "fill",
          source: "counties",
          "source-layer": "original",
          paint: {
            "fill-outline-color": "rgba(0,0,0,0.1)",
            "fill-color": "rgba(0,0,0,0.1)",
          },
        },
        "settlement-label"
      ); // Place polygon under these labels.

      // map.addLayer(
      //   {
      //     id: "counties-highlighted",
      //     type: "fill",
      //     source: "counties",
      //     "source-layer": "original",
      //     paint: {
      //       "fill-outline-color": "#484896",
      //       "fill-color": "#6e599f",
      //       "fill-opacity": 0.75,
      //     },
      //     filter: ["in", "FIPS", ""],
      //   },
      //   "settlement-label"
      // ); // Place polygon under these labels.

      map.on("click", (e) => {
        // Set `bbox` as 5px reactangle area around clicked point.
        const bbox = [
          [e.point.x - 5, e.point.y - 5],
          [e.point.x + 5, e.point.y + 5],
        ];
        // Find features intersecting the bounding box.
        const selectedFeatures = map.queryRenderedFeatures(bbox, {
          layers: ["counties"],
        });
        const fips = selectedFeatures.map((feature) => feature.properties.FIPS);
        // Set a filter matching selected features by FIPS codes
        // to activate the 'counties-highlighted' layer.
        map.setFilter("counties-highlighted", ["in", "FIPS", ...fips]);
      });
    });
    // const map = new mapboxgl.Map({
    //   container: mapContainer.current, // container ID
    //   // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    //   style: "mapbox://styles/mapbox/streets-v11", // style URL
    //   center: [-24, 42], // starting center in [lng, lat]
    //   zoom: 5, // starting zoom
    //   projection: "globe", // display map as a 3D globe
    // });

    // map.on("style.load", () => {
    //   map.setFog({}); // Set the default atmosphere style
    // });

    // map.on("load", () => {
    //   // map.addSource("my-data", {
    //   //   type: "geojson",
    //   //   data: {
    //   //     type: "Feature",
    //   //     geometry: {
    //   //       type: "Point",
    //   //       coordinates: [105.7724469, 21.0030936],
    //   //     },
    //   //     properties: {
    //   //       title: "Mapbox DC",
    //   //       "marker-symbol": "monument",
    //   //     },
    //   //   },
    //   // });
    //   // map.addSource("route", geojson);
    //   // map.addLayer({
    //   //   id: "route",
    //   //   type: "line",
    //   //   source: "route",
    //   //   layout: {
    //   //     "line-join": "round",
    //   //     "line-cap": "round",
    //   //   },
    //   //   paint: {
    //   //     "line-color": "lightgreen",
    //   //     "line-width": 8,
    //   //   },
    //   // });

    //   // map.addLayer({
    //   //   id: "symbols",
    //   //   type: "symbol",
    //   //   source: "route",
    //   //   layout: {
    //   //     "symbol-placement": "line",
    //   //     "text-font": ["Open Sans Regular"],
    //   //     "text-field": "{title}", // part 2 of this is how to do it
    //   //     "text-size": 16,
    //   //   },
    //   // });
    //   map.addLayer({
    //     id: "route",
    //     type: "line",
    //     source: {
    //       type: "geojson",
    //       data: line,
    //     },
    //     properties: {
    //       title: distance,
    //     },
    //     layout: {
    //       "line-join": "round",
    //       "line-cap": "round",
    //     },
    //     paint: {
    //       "line-color": "red",
    //       "line-width": 8,
    //     },
    //   });
    // });

    // // Add geolocate control to the map.
    // const geolocate = new mapboxgl.GeolocateControl({
    //   positionOptions: {
    //     enableHighAccuracy: true,
    //   },
    //   // When active the map will receive updates to the device's location as it changes.
    //   trackUserLocation: true,
    //   // Draw an arrow next to the location dot to indicate which direction the device is heading.
    //   showUserHeading: true,
    // });
    // map.addControl(geolocate);

    // for (const feature of geojson.features) {
    //   // create a HTML element for each feature
    //   const el = document.createElement("div");
    //   el.className = "marker";

    //   // make a marker for each feature and add to the map
    //   new mapboxgl.Marker(el)
    //     .setLngLat(feature.geometry.coordinates)
    //     .addTo(map);
    // }
  });
  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
// const options = {
//   enableHighAccuracy: true,
//   maximumAge: 0,
// };

// function success(pos) {
//   const crd = pos.coords;

//   console.log("Your current position is:");
//   console.log(`Latitude : ${crd.latitude}`);
//   console.log(`Longitude: ${crd.longitude}`);
//   console.log(`More or less ${crd.accuracy} meters.`);
// }

// function error(err) {
//   console.warn(`ERROR(${err.code}): ${err.message}`);
// }

// na

// navigator.geolocation.getCurrentPosition(success, error, options);

export default App;
