import area from "@turf/area";
import bbox from "@turf/bbox";
import center from "@turf/center";
import { lineString, points, polygon } from "@turf/helpers";
import lineDistanceFunc from "@turf/line-distance";
import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { polygonHaNoi } from "./polygon";
import "./App.css";
import { locationUserState } from "./recoil/locationUserState";
import { useRecoilState } from "recoil";

function App() {
  const [currentLocation, setCurrentLocation] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [currenMarker, setCurrenMarker] = useState(null);
  const [mapbox, setMapbox] = useState(null);
  const positions = [
    [105.5929313, 20.9624033],
    [105.7724469, 21.0030936],
  ];

  const [locationUser, setLocationUser] = useRecoilState(locationUserState);
  // const areas = useMemo(() => {
  //   if (currentLocation.length > 0) {
  //     const polygons = polygon([
  //       [...positions, currentLocation, [105.6527176, 20.981686]],
  //     ]);
  //     const areas = area(polygons);
  //     return areas;
  //   }
  // }, [currentLocation.length]);

  // console.log(areas);

  const centerLocations = useMemo(() => {
    if (currentLocation.length > 0) {
      const features = points([...positions, currentLocation]);

      return center(features);
    }
  }, [currentLocation.length]);

  const distance = useMemo(() => {
    const distance = [];
    if (currentLocation.length > 0) {
      const lineFromMyHomeToPitch = lineString(positions);
      const lineFromMyHomeToCurrentPosition = lineString([
        positions[0],
        currentLocation,
      ]);
      const lineFromCurrentPositionToPitch = lineString([
        positions[1],
        currentLocation,
      ]);
      const distanceFromMyHomeToPitch = lineDistanceFunc(
        lineFromMyHomeToPitch
      ).toFixed(0);
      const distanceFromMyHomeToCurrentPosition = lineDistanceFunc(
        lineFromMyHomeToCurrentPosition
      ).toFixed(0);
      const distanceFromCurrentPositionToPitch = lineDistanceFunc(
        lineFromCurrentPositionToPitch
      ).toFixed(0);
      distance.push(
        distanceFromMyHomeToPitch,
        distanceFromMyHomeToCurrentPosition,
        distanceFromCurrentPositionToPitch
      );
    }
    return distance;
  }, [currentLocation.length]);

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
          coordinates: [105.7724522, 21.0030986],
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
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate);

    map.on("load", function () {
      map.addSource("maine", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [polygonHaNoi],
          },
        },
      });
      map.addLayer({
        id: "outline",
        type: "line",
        source: "maine",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });
      const geojson = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: positions,
              },
              properties: {
                title: distance[0],
              },
            },
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [positions[0], currentLocation],
              },
              properties: {
                title: distance[1],
              },
            },
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [positions[1], currentLocation],
              },
              properties: {
                title: distance[2],
              },
            },
          ],
        },
      };

      map.addSource("my-line", geojson);

      map.addLayer({
        id: "route",
        type: "line",
        source: "my-line",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "lightgreen",
          "line-width": 8,
        },
      });

      map.addLayer({
        id: "symbols",
        type: "symbol",
        source: "my-line",
        layout: {
          "symbol-placement": "line",
          "text-font": ["Open Sans Regular"],
          "text-field": "{title}",
          "text-size": 20,
        },
      });
      // map.addLayer(
      //   {
      //     id: "maine",
      //     type: "fill",
      //     source: "maine",
      //     paint: {
      //       "fill-outline-color": "rgba(0,0,0,0.1)",
      //       "fill-color": "rgba(0,0,0,0.1)",
      //     },
      //   },
      //   "settlement-label"
      // ); // Place polygon under these labels.

      // map.addLayer(
      //   {
      //     id: "maine-highlighted",
      //     type: "fill",
      //     source: "maine",
      //     paint: {
      //       "fill-outline-color": "#484896",
      //       "fill-color": "#6e599f",
      //       "fill-opacity": 0.75,
      //     },
      //     filter: ["in", "FIPS", ""],
      //   },
      //   "settlement-label"
      // ); // Place polygon under these labels.

      // map.on("click", (e) => {
      //   // Set `bbox` as 5px reactangle area around clicked point.
      //   const bbox = [
      //     [e.point.x - 5, e.point.y - 5],
      //     [e.point.x + 5, e.point.y + 5],
      //   ];
      //   // Find features intersecting the bounding box.
      //   const selectedFeatures = map.queryRenderedFeatures(bbox, {
      //     layers: ["maine"],
      //   });
      //   const fips = selectedFeatures.map((feature) => feature.properties.FIPS);
      //   // Set a filter matching selected features by FIPS codes
      //   // to activate the 'maine-highlighted' layer.
      //   map.setFilter("maine-highlighted", ["in", "FIPS", ...fips]);
      // });
      map.on("click", function (e) {
        const features = map.queryRenderedFeatures(e.point);

        const marker = new mapboxgl.Marker({ color: "red" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);
        setCurrenMarker(marker);
        console.log(currenMarker);
        if (currenMarker) {
          currenMarker.remove();
        }
        setLocationUser({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });

        if (map.getLayer("layer-outline")) {
          map.removeLayer("layer-outline");
        }
        if (map.getSource("area")) {
          map.removeSource("area");
        }
        if (features.length > 0) {
          setCurrentPolygon(features[0].geometry.coordinates);
        }
      });
    });

    if (centerLocations) {
      const el = document.createElement("div");
      el.className = "marker";
      const marker = new mapboxgl.Marker(el)
        .setLngLat(centerLocations.geometry.coordinates)
        .addTo(map);
    }

    for (const feature of geojson.features) {
      const el = document.createElement("div");
      el.className = "marker";
      new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
    }
    setMapbox(map);
  }, [currentLocation.length]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentLocation([pos.coords.longitude, pos.coords.latitude]);
    });
  }, []);
  console.log([].concat.apply([], currentPolygon));
  useEffect(() => {
    if (currentPolygon.length > 0) {
      // const idLayer = `layer ${Math.floor(Math.random() * 1000000)}`;
      // const idSource = `Source ${Math.floor(Math.random() * 1000000)}`;
      // setIdLayer(idLayer);
      // setIdSource(idSource);
      const merged = [].concat.apply([], currentPolygon);
      mapbox.addSource("area", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: merged,
          },
        },
      });
      mapbox.addLayer({
        id: "layer-outline",
        type: "line",
        source: "area",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });
    }
  }, [currentPolygon]);

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      <div
        style={{
          background: "#fff",
          position: "fixed",
          top: "5%",
          left: "5%",
          width: "20%",
          height: "3%",
        }}
      >
        {" "}
        vi tri {locationUser?.lng} - {locationUser?.lat}
      </div>
    </div>
  );
}

export default App;
