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
            const structurePoints = data.filter(pt => !!pt.order && pt.latitude && pt.longitude);
            const otherPoints = data.filter(pt => !pt.order && pt.latitude && pt.longitude)
            const profileNoList = structurePoints.map(s => s.profile)
                .filter((value, index, self) => self.indexOf(value) === index)
            const randomColors = randomcolor({
                luminosity: "bright",
                count: profileNoList.length,
                hue: "red"
            })
            const colorDict = {}
            profileNoList.forEach((profileNo, i) => {
                colorDict[profileNo] = randomColors[i]
            })
            console.log('Colors: ', colorDict)
            console.log('Structure Data: ', 'data length: ', structurePoints.length, 'sample: ', structurePoints[0])
            console.log('Other Data: ', 'data length: ', otherPoints.length, 'sample: ', otherPoints[0])
            //   const structureIDList = structurePoints.map((pt) => pt.id);
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

            const buildPointsFeatures = (points) => {
                //loop through the items and add to the feature layer
                const features = [];
                array.forEach(points, function (item) {
                    // console.log("item", item);
                    const attr = {};
                    //pull in any additional attributes if required
                    attr["id"] = item.id;
                    if (item.order) {
                        attr["mark"] = item.mark;
                        attr["profile"] = item.profile;
                        attr["order"] = item.order;
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
            const profileDict = groupedByProfile(structurePoints);
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
                            width: 5,
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
                            colorDict[profileNo]
                        )
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
            }

            //  Creates a client-side FeatureLayer from an array of graphics
            const createStructuresPointsLayer = () => {
                const structuresFeatures = buildPointsFeatures(structurePoints);
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
                    label: value
                })
                return new FeatureLayer({
                    source: structuresFeatures,
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
                                expression: "Round($feature.measure, 0)",
                            },
                        ],
                        content:
                            "<p>Point <b>{id} ({code})</b>" +
                            "<ul><li>Order: {order}</li>" +
                            "<li>Measure: {expression/measure-roundup} m</li>" +
                            "<li>Attributes: {attributes}</li>" +
                            "</ul>",
                    },

                    renderer: {
                        type: "unique-value",
                        field: "profile",
                        uniqueValueInfos: profileNoList.map(profileNo => createColorSymbol(profileNo))
                    },
                    labelingInfo: structuresLabels,
                    title: "Structure Points",
                });
            }


            const createOtherPointsLayer = () => {
                const otherPointsFeatures = buildPointsFeatures(otherPoints);
                console.log("other points number", otherPointsFeatures.length);
                return new FeatureLayer({
                    source: otherPointsFeatures,
                    objectIdField: "id",
                    fields: [
                        {
                            name: "id",
                            type: "oid",
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
                });
            }

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
                    expression: "$feature.mark + '' + $feature.order",
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
            const linesLayer = createPolylinesLayer();

            linesLayer.when(function () {
                // console.log('Zoom to line layer')
                zoomToLayer(linesLayer);
            });

            const map = new Map({
                basemap: "hybrid",
                layers: [linesLayer, otherPointsLayer, structuresLayer],
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

            const createActions = (event) => {
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
            view.whenLayerView(linesLayer).then((layerView) => {
                const fullExtent = linesLayer.fullExtent;
                layerList.on("trigger-action", (event) => {
                    const actionId = event.action.id;
                    const layer = event.item.layer;

                    const queryExpression = profileExpressions.find((item) => {
                        return item.id === actionId;
                    }).expression;
                    // console.log("Expression: ", queryExpression);

                    if (!queryExpression.includes("All")) {
                        queryProfile.where = queryExpression;
                        layer.queryFeatures(queryProfile).then((result) => {
                            // the feature to be highlighted
                            const feature = result.features[0];

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
