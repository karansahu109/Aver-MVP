import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapPage() {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://api.maptiler.com/maps/streets-v4/style.json?key=Nal4TgUA0BmV82IXkoss",
      center: [77.3, 28.65],
      zoom: 11,
      pitch: 45,
      bearing: -15,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    map.on("load", () => {
      //ZONES

      const addZone = (id, url, fill, outline) => {
        map.addSource(id, {
          type: "geojson",
          data: url,
        });

        map.addLayer({
          id: `${id}-fill`,
          type: "fill",
          source: id,
          paint: {
            "fill-color": fill,
            "fill-opacity": 0.18,
          },
        });

        map.addLayer({
          id: `${id}-outline`,
          type: "line",
          source: id,
          paint: {
            "line-color": outline,
            "line-width": 2,
          },
        });
      };

      addZone("nitdelhi", "/geo/nitdelhiGeo.json", "pink", "blue");
      addZone("delhi", "/geo/delhiGeo.json", "red", "#ffd60a");
      addZone("noida", "/geo/noidaGeo.json", "#4361ee", "#2ec4b6");
      addZone("gurugram", "/geo/gurugramGeo.json", "#2a9d8f", "#ffffff");

      // NIT DELHI DIVIDING LINES
map.addSource("nitd-zones", {
  type: "geojson",
  data: "/geo/nitdzonesGeo.json",
});

map.addLayer({
  id: "nitd-zones-line",
  type: "line",
  source: "nitd-zones",
  paint: {
    "line-color": "#ffffff",
    "line-width": 2,
  },
});

      // 3D BUILDINGS 

      if (!map.getSource("maptiler_planet_v4")) {
        map.addSource("maptiler_planet_v4", {
          type: "vector",
          url: "https://api.maptiler.com/tiles/planet/tiles.json?key=Nal4TgUA0BmV82IXkoss",
        });
      }

      const labelLayerId = map
        .getStyle()
        .layers.find(
          (l) => l.type === "symbol" && l.layout && l.layout["text-field"]
        )?.id;

      if (!map.getLayer("Building 3D")) {
        map.addLayer(
          {
            id: "Building 3D",
            source: "maptiler_planet_v4",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 12,
            paint: {
              "fill-extrusion-color": "#6b4e3d",
              "fill-extrusion-height": [
                "coalesce",
                ["get", "render_height"],
                ["get", "height"],
                8,
              ],
              "fill-extrusion-base": [
                "coalesce",
                ["get", "render_min_height"],
                ["get", "min_height"],
                0,
              ],
              "fill-extrusion-opacity": 0.85,
            },
          },
          labelLayerId
        );
      }

      //IMAGE OVERLAY

      const tl = [77.22, 28.66];
      const tr = [77.24, 28.66];
      const br = [77.24, 28.64];
      const bl = [77.22, 28.64];

      if (!map.getSource("test-image")) {
        map.addSource("test-image", {
          type: "image",
          url: "/image.png",
          coordinates: [tl, tr, br, bl],
        });

        map.addLayer({
          id: "test-image-layer",
          type: "raster",
          source: "test-image",
          paint: {
            "raster-opacity": 1.0,
          },
        });
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}
