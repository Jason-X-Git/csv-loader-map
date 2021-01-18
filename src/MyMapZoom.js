import React, {useContext, useEffect} from "react";
import {loadModules} from "esri-loader";
import {makeStyles} from "@material-ui/core/styles";
import {DataContext} from "./context/data-context";

const randomcolor = require("randomcolor");

const useStyles = makeStyles((theme) => ({
    viewDiv: {
        width: "100wh",
        height: "90vh",
    },
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

const MyMap = () => {
    const classes = useStyles();

    // const data = readJSON()
    const [data] = useContext(DataContext)

    const loadData = async (data) => {
        try {
            // const structureJsonArray = readJSON();
            const structureJsonArray = await data;
            console.log('Data type: ', typeof data, 'data length: ', data.length)
            //   const structureIDList = structureJsonArray.map((pt) => pt.id);
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
                Collection,
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
                    "esri/core/Collection",
                    "dojo/_base/array",
                    "dojo/domReady!",
                ],
                options
            );

            function buildPoints() {
                //loop through the items and add to the feature layer
                const features = [];
                array.forEach(structureJsonArray, function (item) {
                    // console.log("item", item);
                    const attr = {};
                    //pull in any additional attributes if required
                    attr["id"] = item.id;
                    attr["profile"] = item.profile;
                    attr["order"] = item.order;
                    attr["longitude"] = item.longitude;
                    attr["latitude"] = item.latitude;
                    attr["measure"] = item.measure;

                    const geometry = new Point(item.longitude, item.latitude);

                    const graphic = new Graphic({
                        geometry: geometry,
                        attributes: attr,
                    });
                    features.push(graphic);
                });

                //   console.log("retrieved ", features.length, " points");
                return features;
            }

            const groupBy = (key) => (array) =>
                array.reduce((objectsByKeyValue, obj) => {
                    const value = obj[key];
                    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
                        obj
                    );
                    return objectsByKeyValue;
                }, {});

            const groupedByProfile = groupBy("profile");
            const profileDict = groupedByProfile(structureJsonArray);
            // console.log('profile dict', profileDict)
            const profileInfoDict = {};
            Object.keys(profileDict).map((profileNo) => {
                let d = {
                    pointsSorted: profileDict[profileNo].sort((a, b) =>
                        parseInt(a.order) < parseInt(b.order) ? -1 : 1
                    ),
                    pointsCount: profileDict[profileNo].length,
                };
                const profileLength = Math.round(
                    d.pointsSorted[d.pointsCount - 1].measure,
                    0
                );
                d = {profileLength, ...d};
                profileInfoDict[profileNo] = d;
            });

            // console.log("profile sorted dict", profileInfoDict);

            const buildLines = () => {
                //   console.log('grouped', profilePoints)
                const linesArray = [];
                let pointsCoordinates;
                let points;
                Object.keys(profileInfoDict).map((profileNo) => {
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
                        spatialReference: {wkid: 4326},
                    });
                    const attr = {};
                    attr["objectID"] = profileNo;
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
                    return {
                        value: value,
                        symbol: {
                            type: "simple-line", // autocasts as SimpleLineSymbol()
                            color: color,
                            width: 3,
                        },
                        label: value,
                    };
                };

                const lineRenderer = {
                    type: "unique-value",
                    field: "objectID",
                    uniqueValueInfos: Object.keys(profileInfoDict).map((profileNo) =>
                        createLineSymbol(
                            profileNo,
                            randomcolor({
                                luminosity: "bright",
                                hue: "red",
                            })
                        )
                    ),
                };

                return [linesArray, lineRenderer];
            };

            function createPolylinesLayer() {
                const [linesArray, lineRenderer] = buildLines();
                //   console.log("line arrays", linesArray);
                //   console.log("line render", lineRenderer);
                const linesLayer = new FeatureLayer({
                    source: linesArray,
                    objectIdField: "objectID",
                    fields: [
                        {
                            name: "objectID",
                            type: "oid",
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
                        content: "Profile {objectID} - {count} structures - {length} m",
                    },
                    renderer: lineRenderer,
                    title: "Profiles",
                });
                return linesLayer;
            }

            //  Creates a client-side FeatureLayer from an array of graphics
            function createPointsLayer() {
                const pointFeatures = buildPoints();
                //   console.log("points list", pointFeatures);

                const pointsLayer = new FeatureLayer({
                    source: pointFeatures,
                    objectIdField: "id",
                    fields: [
                        {
                            name: "id",
                            type: "oid",
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
                    ],
                    popupTemplate: {
                        title: "Point",
                        expressionInfos: [
                            {
                                name: "measure-roundup",
                                title: "Measure Roundup",
                                expression: "Round($feature.measure, 0)",
                            },
                        ],
                        content:
                            "Point {id}. Order {order}. Measure: {expression/measure-roundup} m",
                    },
                    renderer: {
                        type: "simple", // autocasts as new SimpleRenderer()
                        symbol: {
                            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                            size: 6,
                            color: "blue",
                            outline: {
                                // autocasts as new SimpleLineSymbol()
                                width: 0.5,
                                color: "white",
                            },
                        },
                    },
                    labelingInfo: pointsLabels,
                    title: "Structure Points",
                });
                return pointsLayer;
            }

            const pointsLabels = {
                symbol: {
                    type: "text",
                    color: "red",
                    haloColor: "white",
                    haloSize: "1px",
                    font: {
                        size: "16px",
                        family: "Noto Sans",
                        style: "italic",
                        weight: "bolder",
                    },
                },
                labelPlacement: "above-right",
                labelExpressionInfo: {
                    expression: "$feature.profile + ' - ' + $feature.order",
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

            const pointsLayer = createPointsLayer();
            const linesLayer = createPolylinesLayer();

            linesLayer.when(function () {
                console.log('Zoom to line layer')
                zoomToLayer(linesLayer);
            });

            const map = new Map({
                basemap: "hybrid",
                layers: [linesLayer, pointsLayer],
            });

            const view = new MapView({
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
            });

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
                    expression: `objectID = '${profileNo}'`,
                }))
            );

            // When an action is triggered, the definitionExpression
            // is set on the layer and the view's extent updates
            // to match the features visible in the layer

            const queryProfile = linesLayer.createQuery();
            let highlightSelect;
            view.whenLayerView(linesLayer).then((layerView) => {
                const fullExtent = linesLayer.fullExtent;
                layerList.on("trigger-action", function (event) {
                    const actionId = event.action.id;
                    const layer = event.item.layer;

                    const queryExpression = profileExpressions.find(function (item) {
                        return item.id === actionId;
                    }).expression;
                    // console.log("Expression: ", queryExpression);

                    if (!queryExpression.includes("All")) {
                        queryProfile.where = queryExpression;
                        layer.queryFeatures(queryProfile).then((result) => {
                            // if a feature is already highlighted, then remove the highlight
                            if (highlightSelect) {
                                highlightSelect.remove();
                            }

                            // the feature to be highlighted
                            const feature = result.features[0];

                            // use the objectID to highlight the feature
                            highlightSelect = layerView.highlight(
                                feature.attributes["objectID"]
                            );
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
                                .catch(function (error) {
                                    if (error.name != "AbortError") {
                                        console.log(error);
                                    }
                                });
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
                            .catch(function (error) {
                                if (error.name != "AbortError") {
                                    console.log(error);
                                }
                            });
                    }
                });
            });

            function createActions(event) {
                const item = event.item;
                //   console.log("item", item);

                if (item.title.includes("Profile")) {
                    item.actionsOpen = false;
                    item.actionsSections = [
                        ["All", ...Object.keys(profileInfoDict)].map((profileNo) => {
                            // console.log("profile detail", profileInfoDict[profileNo]);
                            let profileLength;
                            if (profileNo === "All") {
                                profileLength = Object.keys(profileInfoDict)
                                    .map((profileNo) => profileInfoDict[profileNo].profileLength)
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
                }
            }

            const coordsWidget = document.createElement("div");
            coordsWidget.id = "coordsWidget";
            coordsWidget.className = "esri-widget esri-component";
            coordsWidget.style.padding = "7px 15px 5px";

            view.ui.add(coordsWidget, "bottom-left");

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
                showCoordinates(view.toMap({x: evt.x, y: evt.y}));
            });

        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        console.log(`Map get data: ${(new Date()).toLocaleTimeString()}`, data)
        if (data && data.length > 0) {
            const layerListDiv = document.getElementById("layerListDiv")
            if (layerListDiv) {
                layerListDiv.innerHTML = ''
            }
            loadData(data);
        }
    }, [data]);

    return (
        <div id="contentDiv" className={classes.contentDiv}>
            <div id="viewDiv" className={classes.viewDiv}/>
            {data &&
            <div id="layerListDiv" className={classes.layerListDiv}/>
            }
        </div>
    );

};

export default MyMap;
