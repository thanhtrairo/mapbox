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
          description: "",
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
          description: "San Francisco, California",
        },
      },
    ],
  };
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoidGhhbmhudDgiLCJhIjoiY2w4dG52bDQ1MDM3YzNwbXdycnAxMDdxNSJ9.1RVa2m_pTz1_tZ-pqw6gnA";
    const map = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v11", // style URL
      center: [-24, 42], // starting center in [lng, lat]
      zoom: 1, // starting zoom
      projection: "globe", // display map as a 3D globe
    });

    map.on("style.load", () => {
      map.setFog({}); // Set the default atmosphere style
    });

    map.on("load", () => {
      // map.addSource("route", geojson);
      // map.addLayer({
      //   id: "route",
      //   type: "line",
      //   source: "route",
      //   layout: {
      //     "line-join": "round",
      //     "line-cap": "round",
      //   },
      //   paint: {
      //     "line-color": "lightgreen",
      //     "line-width": 8,
      //   },
      // });

      // map.addLayer({
      //   id: "symbols",
      //   type: "symbol",
      //   source: "route",
      //   layout: {
      //     "symbol-placement": "line",
      //     "text-font": ["Open Sans Regular"],
      //     "text-field": "{title}", // part 2 of this is how to do it
      //     "text-size": 16,
      //   },
      // });
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: line,
        },
        properties: {
          title: distance,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "red",
          "line-width": 8,
        },
      });
    });

    // Add geolocate control to the map.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })
    );
    for (const feature of geojson.features) {
      // create a HTML element for each feature
      const el = document.createElement("div");
      el.className = "marker";

      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
    }
  });
  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
