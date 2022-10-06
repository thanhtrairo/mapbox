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
import along from "@turf/along";

function App() {
  const [locationUser, setLocationUser] = useRecoilState(locationUserState);

  const [currentLocation, setCurrentLocation] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [currenMarker, setCurrenMarker] = useState(null);
  const prevCurrenMarker = useRef(null);
  const [mapbox, setMapbox] = useState(null);
  const [coordinatesMarkerAnimation, setCoordinatesMarkerAnimation] = useState(
    []
  );

  const positions = [
    [105.5929313, 20.9624033],
    [105.7724469, 21.0030936],
  ];
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://api.mapbox.com/directions/v5/mapbox/cycling/105.5929313,20.9624033;105.7724469,21.0030936?geometries=geojson&access_token=pk.eyJ1IjoidGhhbmhudDgiLCJhIjoiY2w4dG52bDQ1MDM3YzNwbXdycnAxMDdxNSJ9.1RVa2m_pTz1_tZ-pqw6gnA"
      );
      const data = await res.json();
      setCoordinatesMarkerAnimation(data.routes[0].geometry.coordinates);
    };
    fetchData();
  }, []);
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
  // useEffect(() => {
  //   mapboxgl.accessToken =
  //     "pk.eyJ1IjoidGhhbmhudDgiLCJhIjoiY2w4dG52bDQ1MDM3YzNwbXdycnAxMDdxNSJ9.1RVa2m_pTz1_tZ-pqw6gnA";
  //   var map = new mapboxgl.Map({
  //     container: mapContainer.current,
  //     style: "mapbox://styles/mapbox/streets-v11",
  //     center: [0, 0],
  //     zoom: 2,
  //   });

  //   var start_data = null;
  //   var current_data = null;
  //   var destination_data = null;
  //   var start_time = null;
  //   var isAnimated = false;

  //   function getPointData(lngLat) {
  //     return {
  //       type: "Point",
  //       coordinates: [lngLat.lng, lngLat.lat],
  //     };
  //   }

  //   function animateMarker(tm) {
  //     if (start_time === null) {
  //       start_time = tm;
  //     }

  //     var zero_time = tm - start_time;
  //     var newPoint = along(
  //       lineString([start_data.coordinates, destination_data.coordinates]),
  //       zero_time / 2
  //     );

  //     if (!(newPoint.geometry.coordinates == destination_data.coordinates)) {
  //       current_data = newPoint.geometry;
  //       map.getSource("point_source").setData(newPoint);
  //       requestAnimationFrame(animateMarker);
  //     } else {
  //       isAnimated = false;
  //       start_time = null;
  //     }
  //   }

  //   map.on("click", function (event) {
  //     var coordsClick = getPointData(event.lngLat);

  //     if (map.getSource("point_source") && !isAnimated) {
  //       isAnimated = true;
  //       start_data = current_data;
  //       destination_data = coordsClick;

  //       requestAnimationFrame(animateMarker);
  //     }
  //     if (map.getSource("point_source") === undefined) {
  //       current_data = coordsClick;
  //       destination_data = coordsClick;

  //       map.addSource("point_source", {
  //         type: "geojson",
  //         data: coordsClick,
  //       });

  //       map.addLayer({
  //         id: "point",
  //         source: "point_source",
  //         type: "circle",
  //         paint: {
  //           "circle-radius": 10,
  //           "circle-color": "#007cbf",
  //         },
  //       });
  //     }
  //   });
  // }, []);

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
      map.on("click", function (e) {
        const features = map.queryRenderedFeatures(e.point);

        const marker = new mapboxgl.Marker({ color: "red" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);
        setCurrenMarker(marker);
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
      new mapboxgl.Marker(el)
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
    const marker = new mapboxgl.Marker({
      color: "#F84C4C", // color it red
    });

    // Define the animation.
    let count = 0;
    if (coordinatesMarkerAnimation.length > 0) {
      console.log(coordinatesMarkerAnimation[count][0]);
      // function animateMarker() {
      //   marker.setLngLat([
      //     coordinatesMarkerAnimation[count][0],
      //     coordinatesMarkerAnimation[count][1],
      //   ]);
      //   marker.addTo(map);
      //   count++;
      //   requestAnimationFrame(animateMarker);
      // }
      // requestAnimationFrame(animateMarker);
    }
    setMapbox(map);
  }, [currentLocation, coordinatesMarkerAnimation]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentLocation([pos.coords.longitude, pos.coords.latitude]);
    });
  }, []);
  useEffect(() => {
    if (currentPolygon.length > 0) {
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
  useEffect(() => {
    if (currenMarker) {
      prevCurrenMarker.current?.remove();
    }
    prevCurrenMarker.current = currenMarker;
  }, [currenMarker]);
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
