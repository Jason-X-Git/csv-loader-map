import React, { useContext, useEffect, useState } from "react";
import { loadModules } from "esri-loader";
import { makeStyles } from "@material-ui/core/styles";
import { DataContext } from "./context/data-context";

const randomcolor = require("randomcolor");

const useStyles = makeStyles((theme) => ({
  contentDiv: {
    width: "100wh",
    height: "90vh",
    margin: "10px 5px",
  },
  layerListDiv: {
    width: "200px",
    fontSize: "6px",
    padding: 0,
  },
}));

const sortNumAlpha = (a, b) => a.localeCompare(b, "en", { numeric: true });

const MyMap = () => {
  const [divSize, setDivSize] = useState({
    viewDiv: {
      width: "100wh",
      height: "90vh",
    },
    tableDiv: {
      width: "100wh",
      height: "0",
      overflow: "auto",
    },
  });

  const classes = useStyles();

  const [data, setData] = useContext(DataContext);

  const csvValues = data.csvValues;

  const loadData = async (csvValues) => {
    try {
      const options = {
        url: "https://js.arcgis.com/4.18/init.js",
        css: "https://js.arcgis.com/4.18/esri/themes/light/main.css",
      };
      const [
        Map,
        MapView,
        FeatureLayer,
        Point,
        Polyline,
        Graphic,
        LayerList,
        Measurement,
        FeatureTable,
        Collection,
        Home,
        BasemapToggle,
        array,
      ] = await loadModules(
        [
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/FeatureLayer",
          "esri/geometry/Point",
          "esri/geometry/Polyline",
          "esri/Graphic",
          "esri/widgets/LayerList",
          "esri/widgets/Measurement",
          "esri/widgets/FeatureTable",
          "esri/core/Collection",
          "esri/widgets/Home",
          "esri/widgets/BasemapToggle",
          "dojo/_base/array",
          "dojo/domReady!",
        ],
        options
      );
      let map;
      let view;
      const profileInfoDict = {};
      let linesLayer;

      if (csvValues && csvValues.length > 0) {
        const sortedStructures = csvValues
          .filter((pt) => !!pt.order && pt.latitude && pt.longitude)
          .sort((a, b) => {
            if (a.profile === b.profile) {
              return sortNumAlpha(a.order, b.order);
            } else {
              return sortNumAlpha(a.profile, b.profile);
            }
          });
        const otherPoints = csvValues.filter(
          (pt) => !pt.order && pt.latitude && pt.longitude
        );
        const guyPoints = otherPoints.filter((pt) => pt.code.includes("guy"));
        const sortedProfileNoList = sortedStructures
          .map((s) => s.profile)
          .sort((a, b) => sortNumAlpha(a, b))
          .filter((value, index, self) => self.indexOf(value) === index);
        // console.log("Sorted profile no list: ", sortedProfileNoList);

        setData({
          ...data,
          sortedStructures,
          sortedProfileNoList,
          otherPoints,
          guyPoints,
        });

        const randomColors = randomcolor({
          luminosity: "bright",
          count: sortedProfileNoList.length,
          hue: "red",
        });
        const colorDict = {};
        sortedProfileNoList.forEach((profileNo, i) => {
          colorDict[profileNo] = randomColors[i];
        });
        console.log("Colors: ", colorDict);
        console.log(
          "Structure Data: ",
          "data length: ",
          sortedStructures.length,
          "sample: ",
          sortedStructures[0]
        );
        console.log(
          "Other Data: ",
          "data length: ",
          otherPoints.length,
          "sample: ",
          otherPoints[0]
        );
        //   const structureIDList = structurePoints.map((pt) => pt.id);

        const buildPointsFeatures = (points) => {
          //loop through the items and add to the feature layer
          const features = [];
          array.forEach(points, function (item, index) {
            // console.log("item", item);
            const attr = {};
            //pull in any additional attributes if required
            attr["objectID"] = index;
            attr["id"] = item.id;
            if (item.order) {
              attr["mark"] = item.mark;
              attr["profile"] = item.profile;
              attr["order"] = item.order;
              attr["structureAngles"] = item.structureAngles;
              attr["structureGuys"] = item.structureGuys;
              attr["measure"] = item.measure;
            }
            attr["longitude"] = item.longitude;
            attr["latitude"] = item.latitude;
            attr["code"] = item.code;
            attr["attributes"] = item.attributes;

            const geometry = new Point(item.longitude, item.latitude);

            const graphic = new Graphic({
              geometry: geometry,
              attributes: attr,
            });
            features.push(graphic);
          });

          //   console.log("retrieved ", features.length, " points");
          return features;
        };

        const groupBy = (key) => (array) =>
          array.reduce((objectsByKeyValue, obj) => {
            const value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
              obj
            );
            return objectsByKeyValue;
          }, {});

        const groupedByProfile = groupBy("profile");
        const profileDict = groupedByProfile(sortedStructures);
        // console.log('profile dict', profileDict)
        sortedProfileNoList.map((profileNo) => {
          let d = {
            pointsSorted: profileDict[profileNo].sort((a, b) =>
              sortNumAlpha(a.order, b.order)
            ),
            pointsCount: profileDict[profileNo].length,
          };
          const profileLength = Math.round(
            d.pointsSorted[d.pointsCount - 1].measure,
            0
          );
          d = { profileLength, ...d };
          profileInfoDict[profileNo] = d;
        });

        // console.log("profile sorted dict", profileInfoDict);

        const buildLines = () => {
          //   console.log('grouped', profilePoints)
          const linesArray = [];
          let pointsCoordinates;
          let points;
          sortedProfileNoList.map((profileNo, index) => {
            points = profileInfoDict[profileNo].pointsSorted;
            // console.log("Profile ", profileNo, points);
            pointsCoordinates = [];
            points.map((pt) =>
              pointsCoordinates.push([pt.longitude, pt.latitude])
            );
            const geometry = new Polyline({
              hasZ: false,
              hasM: true,
              paths: pointsCoordinates,
              spatialReference: { wkid: 4326 },
            });
            const attr = {};
            attr["objectID"] = index;
            attr["profileNo"] = profileNo;
            attr["count"] = points.length;
            attr["length"] = points[points.length - 1].measure;
            const graphic = new Graphic({
              geometry: geometry,
              attributes: attr,
            });
            linesArray.push(graphic);
          });
          //   console.log("build lines: ", linesArray.length);

          const createLineSymbol = (value, color) => {
            // color parameter could be used to render different color, but now not used.
            return {
              value: value,
              label: value,
              symbol: {
                type: "cim", // autocasts as CIMSymbol
                data: {
                  type: "CIMSymbolReference",
                  symbol: {
                    type: "CIMLineSymbol",
                    symbolLayers: [
                      {
                        // black 1px line symbol
                        type: "CIMSolidStroke",
                        enable: true,
                        width: 3,
                        color: [240, 94, 35, 255],
                      },
                      {
                        // arrow symbol
                        type: "CIMVectorMarker",
                        enable: true,
                        size: 10,
                        markerPlacement: {
                          type: "CIMMarkerPlacementAlongLineSameSize", // places same size markers along the line
                          endings: "WithMarkers",
                          placementTemplate: [30], // determines space between each arrow
                          angleToLine: true, // symbol will maintain its angle to the line when map is rotated
                        },
                        frame: {
                          xmin: -5,
                          ymin: -5,
                          xmax: 5,
                          ymax: 5,
                        },
                        markerGraphics: [
                          {
                            type: "CIMMarkerGraphic",
                            geometry: {
                              rings: [
                                [
                                  [-8, -5.47],
                                  [-8, 5.6],
                                  [1.96, -0.03],
                                  [-8, -5.47],
                                ],
                              ],
                            },
                            symbol: {
                              // black fill for the arrow symbol
                              type: "CIMPolygonSymbol",
                              symbolLayers: [
                                {
                                  type: "CIMSolidFill",
                                  enable: true,
                                  color: [0, 255, 0, 255],
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            };
          };

          const lineRenderer = {
            type: "unique-value",
            field: "profileNo",
            uniqueValueInfos: Object.keys(profileInfoDict).map((profileNo) =>
              createLineSymbol(profileNo, colorDict[profileNo])
            ),
          };

          return [linesArray, lineRenderer];
        };

        const createPolylinesLayer = () => {
          const [linesArray, lineRenderer] = buildLines();
          //   console.log("line arrays", linesArray);
          //   console.log("line render", lineRenderer);
          return new FeatureLayer({
            source: linesArray,
            objectIdField: "objectID",
            fields: [
              {
                name: "objectID",
                type: "oid",
              },
              {
                name: "profileNo",
                type: "string",
              },
              {
                name: "count",
                type: "integer",
              },
              {
                name: "length",
                type: "double",
              },
            ],
            popupTemplate: {
              title: "Profile",
              content: "Profile {profileNo} - {count} structures - {length} m",
            },
            renderer: lineRenderer,
            title: "Profiles",
          });
        };

        //  Creates a client-side FeatureLayer from an array of graphics
        const createStructuresPointsLayer = () => {
          const structuresFeatures = buildPointsFeatures(sortedStructures);
          //   console.log("points list", structuresFeatures);

          const createColorSymbol = (value) => ({
            value: value,
            symbol: {
              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
              size: 8,
              color: colorDict[value],
              outline: {
                // autocasts as new SimpleLineSymbol()
                width: 1.5,
                color: "white",
              },
            },
            label: value,
          });
          return new FeatureLayer({
            source: structuresFeatures,
            objectIdField: "objectID",
            fields: [
              {
                name: "objectID",
                type: "oid",
              },
              {
                name: "id",
                type: "string",
              },
              {
                name: "profile",
                type: "string",
              },
              {
                name: "order",
                type: "string",
              },
              {
                name: "structureAngles",
                type: "string",
              },
              {
                name: "structureGuys",
                type: "string",
              },
              {
                name: "latitude",
                type: "double",
              },
              {
                name: "longitude",
                type: "double",
              },
              {
                name: "measure",
                type: "double",
              },
              {
                name: "code",
                type: "string",
              },
              {
                name: "mark",
                type: "string",
              },
              {
                name: "attributes",
                type: "string",
              },
            ],
            popupTemplate: {
              title: "Structure Point",
              expressionInfos: [
                {
                  name: "measure-roundup",
                  title: "Measure Roundup",
                  expression: "Round($feature.measure, 2)",
                },
              ],
              content:
                "<div>" +
                "<h3>Point {mark}{order} - Profile{profile} - {id} - {code}</h3>" +
                "<ul>" +
                "<li>Measure: {expression/measure-roundup} m</li>" +
                "<li>Angles: {structureAngles}</li>" +
                "<li>Guys: {structureGuys}</li>" +
                "<li>Attributes: {attributes}</li>" +
                "</ul>" +
                "</div>",
            },

            renderer: {
              type: "unique-value",
              field: "profile",
              uniqueValueInfos: sortedProfileNoList.map((profileNo) =>
                createColorSymbol(profileNo)
              ),
            },
            labelingInfo: structuresLabels,
            title: "Structure Points",
          });
        };

        const createOtherPointsLayer = () => {
          const otherPointsFeatures = buildPointsFeatures(otherPoints);
          console.log("other points number", otherPointsFeatures.length);
          const otherPointsLayer = new FeatureLayer({
            source: otherPointsFeatures,
            objectIdField: "objectID",
            fields: [
              {
                name: "objectID",
                type: "oid",
              },
              {
                name: "id",
                type: "string",
              },
              {
                name: "latitude",
                type: "double",
              },
              {
                name: "longitude",
                type: "double",
              },
              {
                name: "code",
                type: "string",
              },
              {
                name: "attributes",
                type: "string",
              },
            ],
            popupTemplate: {
              title: "Non-Structure Point",
              content:
                "<p>Point <b>{id} ({code})</b></p>" +
                "<ul><li>{attributes}</li><ul>",
            },
            renderer: {
              type: "simple", // autocasts as new SimpleRenderer()
              symbol: {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                size: 5,
                color: "blue",
                outline: {
                  // autocasts as new SimpleLineSymbol()
                  width: 0.5,
                  color: "white",
                },
              },
            },
            labelingInfo: otherPointsLabels,
            title: "Non-Structure Points",
            visible: true,
          });
          return otherPointsLayer;
        };

        const structuresLabels = {
          symbol: {
            type: "text",
            color: "red",
            haloColor: "white",
            haloSize: "1.5px",
            font: {
              size: "18px",
              family: "Noto Sans",
              style: "italic",
              weight: "bolder",
            },
          },
          labelPlacement: "above-right",
          labelExpressionInfo: {
            expression:
              "'P' + $feature.profile + '-' + $feature.mark[0] + '' + $feature.order",
          },
          deconflictionStrategy: "static",
        };

        const otherPointsLabels = {
          symbol: {
            type: "text",
            color: "blue",
            haloColor: "white",
            haloSize: "1px",
            font: {
              size: "15px",
              family: "Noto Sans",
              style: "italic",
              weight: "bolder",
            },
          },
          labelPlacement: "above-right",
          labelExpressionInfo: {
            expression: "$feature.id + ' - ' + $feature.code",
          },
          deconflictionStrategy: "static",
        };

        const zoomToLayer = (layer) => {
          //   console.log(`Zoom to ${layer.title}`);
          return layer.queryExtent().then(function (response) {
            view.goTo(response.extent).catch(function (error) {
              if (error.name !== "AbortError") {
                console.error(error);
              }
            });
          });
        };

        const structuresLayer = createStructuresPointsLayer();
        const otherPointsLayer = createOtherPointsLayer();
        linesLayer = createPolylinesLayer();

        const featureTable = new FeatureTable({
          view: view, // The view property must be set for the select/highlight to work
          layer: structuresLayer,
          container: "tableDiv",
          // menuConfig: {
          //   items: [
          //     {
          //       label: "Zoom to feature(s)",
          //       iconClass: "esri-icon-zoom-in-magnifying-glass",
          //       clickFunction: function (event) {
          //         zoomToSelectedFeature();
          //       },
          //     },
          //   ],
          // },
          fieldConfigs: [
            {
              name: "objectID",
              label: "ID",
              // This field will not be shown in the table initially
              visible: false,
            },
            {
              name: "id",
              label: "Point ID",
            },
            {
              name: "profile",
              label: "Profile",
              // The table will be sorted by this column
              // in ascending order
              direction: "asc",
            },
            {
              name: "mark",
              label: "Structure Mark",
            },
            {
              name: "measure",
              label: "Measure (m)",
              // The table will be sorted by this column
              // in ascending order
              // direction: "asc"
            },
            {
              name: "structureAngles",
              label: "Angles",
            },
            {
              name: "structureGuys",
              label: "Guys",
            },
          ],
        });

        linesLayer.when(function () {
          console.log("Zoom to line layer");
          zoomToLayer(linesLayer);
        });

        map = new Map({
          basemap: "hybrid",
          layers: [linesLayer, otherPointsLayer, structuresLayer],
        });
        view = new MapView({
          container: "viewDiv",
          center: [-168, 46],
          zoom: 2,
          map: map,
          // set highlightOptions like color and fillOpacity
          highlightOptions: {
            color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.4,
          },
          constraints: {
            rotationEnabled: false,
          },
        });

        const createActions = (event) => {
          const item = event.item;
          //   console.log("item", item);

          if (item.title.includes("Profile")) {
            item.actionsOpen = false;
            item.actionsSections = [
              ["All", ...sortedProfileNoList].map((profileNo) => {
                // console.log("profile detail", profileInfoDict[profileNo]);
                let profileLength;
                if (profileNo === "All") {
                  profileLength = Object.keys(profileInfoDict)
                    .map(
                      (profileNo) => profileInfoDict[profileNo].profileLength
                    )
                    .reduce((a, b) => a + b);
                } else {
                  profileLength = profileInfoDict[profileNo].profileLength;
                }
                return {
                  title: `Profile ${profileNo} - ${profileLength} m`,
                  className: "esri-icon-zoom-out-fixed",
                  id: profileNo,
                };
              }),
            ];
          } else if (item.title === "Structure Points") {
            item.actionsOpen = false;
            item.actionsSections = [
              sortedStructures.map((pt) => {
                return {
                  title: `P${pt.profile}-${pt.mark[0]}${pt.order}-${pt.id}
                                    ${
                                      pt.structureAngles.includes("running")
                                        ? "-Running"
                                        : ""
                                    }
                                    ${
                                      pt.structureAngles.includes("tap")
                                        ? "-Tap"
                                        : ""
                                    }
                                    ${
                                      pt.structureGuys &&
                                      pt.structureGuys.includes("guy")
                                        ? "-Guys"
                                        : ""
                                    }`,
                  className: "esri-icon-zoom-out-fixed",
                  id: `${pt.id}`,
                };
              }),
            ];
          }
        };
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: createActions,
          container: "layerListDiv",
        });
        view.ui.add(layerList, "top-right");

        // definitionExpressions used by each action
        // listed in the LayerList

        const profileExpressions = new Collection(
          ["All", ...Object.keys(profileInfoDict)].map((profileNo) => ({
            id: profileNo,
            expression: `profileNo = '${profileNo}'`,
          }))
        );
        const structureExpressions = new Collection(
          sortedStructures.map((pt) => ({
            id: pt.id,
            expression: `id = '${pt.id}'`,
          }))
        );

        // When an action is triggered, the definitionExpression
        // is set on the layer and the view's extent updates
        // to match the features visible in the layer

        const queryProfile = linesLayer.createQuery();
        const queryStructure = structuresLayer.createQuery();
        view.whenLayerView(linesLayer).then((layerView) => {
          const fullExtent = linesLayer.fullExtent;

          homeBtn.goToOverride = () => {
            view
              .goTo(
                {
                  target: fullExtent,
                },
                {
                  duration: 2000,
                  easing: "in-out-expo",
                }
              )
              .catch((error) => {
                if (error.name !== "AbortError") {
                  console.log(error);
                }
              });
          };
          layerList.on("trigger-action", (event) => {
            const actionId = event.action.id;
            const layer = event.item.layer;

            let queryExpression;
            let queryFunc;
            if (event.item.title.includes("Profile")) {
              queryExpression = profileExpressions.find((item) => {
                return item.id === actionId;
              }).expression;
              queryFunc = queryProfile;
            } else {
              queryExpression = structureExpressions.find((item) => {
                return item.id === actionId;
              }).expression;
              queryFunc = queryStructure;
            }
            console.log("Expression: ", queryExpression);

            if (!queryExpression.includes("All")) {
              queryFunc.where = queryExpression;
              layer.queryFeatures(queryFunc).then((result) => {
                // the feature to be highlighted
                const feature = result.features[0];

                console.log("type", feature.geometry.type);
                if (feature.geometry.type === "point") {
                  view
                    .goTo(
                      {
                        target: feature.geometry,
                        zoom: 20,
                      },
                      {
                        duration: 2000,
                        easing: "in-out-expo",
                      }
                    )
                    .catch((error) => {
                      if (error.name !== "AbortError") {
                        console.log(error);
                      }
                    });
                } else {
                  const ext = feature.geometry.extent;

                  const cloneExt = ext.clone();
                  // center the feature
                  view
                    .goTo(
                      {
                        target: feature.geometry,
                        extent: cloneExt.expand(1.5),
                      },
                      {
                        duration: 2000,
                        easing: "in-out-expo",
                      }
                    )
                    .catch((error) => {
                      if (error.name !== "AbortError") {
                        console.log(error);
                      }
                    });
                }
              });
            } else {
              view
                .goTo(
                  {
                    target: fullExtent,
                  },
                  {
                    duration: 2000,
                    easing: "in-out-expo",
                  }
                )
                .catch((error) => {
                  if (error.name !== "AbortError") {
                    console.log(error);
                  }
                });
            }
          });
        });
        setDivSize({
          viewDiv: {
            width: "100wh",
            height: "70vh",
          },
          tableDiv: {
            width: "100wh",
            height: "20vh",
            overflow: "auto",
          },
        });
      } else {
        map = new Map({
          basemap: "hybrid",
        });
        view = new MapView({
          container: "viewDiv",
          center: [-116, 54],
          zoom: 6,
          map: map,
          // set highlightOptions like color and fillOpacity
          highlightOptions: {
            color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.4,
          },
        });
      }

      const coordsWidget = document.createElement("div");
      coordsWidget.id = "coordsWidget";
      coordsWidget.className = "esri-widget esri-component";
      coordsWidget.style.padding = "7px 15px 5px";

      const showCoordinates = (pt) => {
        const coords =
          "Lat/Lon " +
          pt.latitude.toFixed(3) +
          " " +
          pt.longitude.toFixed(3) +
          " | Scale 1:" +
          Math.round(view.scale * 1) / 1 +
          " | Zoom " +
          view.zoom;
        coordsWidget.innerHTML = coords;
      };

      view.watch("stationary", function (isStationary) {
        showCoordinates(view.center);
      });

      view.on("pointer-move", function (evt) {
        showCoordinates(view.toMap({ x: evt.x, y: evt.y }));
      });

      const measurement = new Measurement();
      const distanceButton = document.getElementById("distance");
      const areaButton = document.getElementById("area");
      const clearButton = document.getElementById("clear");
      distanceButton.addEventListener("click", function () {
        distanceMeasurement();
      });
      areaButton.addEventListener("click", function () {
        areaMeasurement();
      });
      clearButton.addEventListener("click", function () {
        clearMeasurements();
      });

      const homeBtn = new Home({
        view: view,
      });
      view.ui.add(homeBtn, "top-left");

      var basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "topo-vector",
      });

      view.ui.add(basemapToggle, {
        position: "bottom-left",
      });
      view.ui.add(coordsWidget, "bottom-left");

      view.ui.add(distanceButton, "top-left");
      view.ui.add(areaButton, "top-left");
      view.ui.add(clearButton, "top-left");
      view.ui.add(measurement, "top-left");

      measurement.view = view;

      // Call the appropriate DistanceMeasurement2D or DirectLineMeasurement3D
      function distanceMeasurement() {
        measurement.activeTool = "distance";
        distanceButton.classList.add("active");
        areaButton.classList.remove("active");
      }

      // Call the appropriate AreaMeasurement2D or AreaMeasurement3D
      function areaMeasurement() {
        measurement.activeTool = "area";
        distanceButton.classList.remove("active");
        areaButton.classList.add("active");
      }

      // Clears all measurements
      function clearMeasurements() {
        distanceButton.classList.remove("active");
        areaButton.classList.remove("active");
        measurement.clear();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    console.log(`Map get data: ${new Date().toLocaleTimeString()}`, csvValues);

    const layerListDiv = document.getElementById("layerListDiv");
    const tableDiv = document.getElementById("tableDiv");
    if (layerListDiv) {
      layerListDiv.innerHTML = "";
      tableDiv.innerHTML = "";
    }
    loadData(csvValues);
  }, [csvValues]);

  return (
    <div id="contentDiv" className={classes.contentDiv}>
      <div id="viewDiv" style={divSize.viewDiv} />
      {csvValues && <div id="tableDiv" style={divSize.tableDiv} />}
      {csvValues && <div id="layerListDiv" className={classes.layerListDiv} />}
      <div id="toolbarDiv" class="esri-component esri-widget">
        <button
          id="distance"
          class="esri-widget--button esri-interactive esri-icon-measure-line"
          title="Distance Measurement Tool"
        ></button>
        <button
          id="area"
          class="esri-widget--button esri-interactive esri-icon-measure-area"
          title="Area Measurement Tool"
        ></button>
        <button
          id="clear"
          class="esri-widget--button esri-interactive esri-icon-trash"
          title="Clear Measurements"
        ></button>
      </div>
    </div>
  );
};

export default MyMap;
