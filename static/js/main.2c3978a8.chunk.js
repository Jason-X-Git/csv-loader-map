(this["webpackJsonpcsv-loader-map"]=this["webpackJsonpcsv-loader-map"]||[]).push([[0],{38:function(e,t,n){},46:function(e,t){},48:function(e,t){},58:function(e,t,n){"use strict";n.r(t);var o=n(1),r=n(0),i=n.n(r),a=n(27),c=n.n(a),l=(n(38),n(18)),u=n.n(l),s=n(19),d=n(32),p=n(28),f=n(3),m=n(29),g=n(69),h=Object(r.createContext)(),b=function(e){var t=Object(r.useState)([]),n=Object(f.a)(t,2),i=n[0],a=n[1];return Object(o.jsx)(h.Provider,{value:[i,a],children:e.children})},y=n(40),v=Object(g.a)((function(e){return{viewDiv:{width:"100wh",height:"90vh"},contentDiv:{width:"100wh",height:"90vh",margin:"10px 5px"},layerListDiv:{width:"200px",fontSize:"6px",padding:0}}})),j=function(){var e=v(),t=Object(r.useContext)(h),n=Object(f.a)(t,1)[0],i=function(){var e=Object(p.a)(u.a.mark((function e(t){var n,o,r,i,a,c,l,p,g,h,b,v,j,x,w,O,S,D,I,k,P,F,L,A,E,C,T,z,M,N,V,q,R,B,$,H,Z,_,J,Q,W;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n={url:"https://js.arcgis.com/4.18/init.js",css:"https://js.arcgis.com/4.18/esri/themes/light/main.css"},e.next=4,Object(m.loadModules)(["esri/Map","esri/views/MapView","esri/layers/FeatureLayer","esri/geometry/Point","esri/geometry/Polyline","esri/Graphic","esri/widgets/LayerList","esri/core/Collection","esri/widgets/Home","dojo/_base/array","dojo/dom","dojo/on","dojo/domReady!"],n);case 4:o=e.sent,r=Object(f.a)(o,12),i=r[0],a=r[1],c=r[2],l=r[3],p=r[4],g=r[5],h=r[6],b=r[7],v=r[8],j=r[9],r[10],r[11],O={},t&&t.length>0?(D=t.filter((function(e){return!!e.order&&e.latitude&&e.longitude})),I=t.filter((function(e){return!e.order&&e.latitude&&e.longitude})),k=D.map((function(e){return e.profile})).filter((function(e,t,n){return n.indexOf(e)===t})),P=y({luminosity:"bright",count:k.length,hue:"red"}),F={},k.forEach((function(e,t){F[e]=P[t]})),console.log("Colors: ",F),console.log("Structure Data: ","data length: ",D.length,"sample: ",D[0]),console.log("Other Data: ","data length: ",I.length,"sample: ",I[0]),L=function(e){var t=[];return j.forEach(e,(function(e){var n={};n.id=e.id,e.order&&(n.mark=e.mark,n.profile=e.profile,n.order=e.order,n.structureAngles=e.structureAngles,n.measure=e.measure),n.longitude=e.longitude,n.latitude=e.latitude,n.code=e.code,n.attributes=e.attributes;var o=new l(e.longitude,e.latitude),r=new g({geometry:o,attributes:n});t.push(r)})),t},A=function(e){return function(t){return t.reduce((function(t,n){var o=n[e];return t[o]=(t[o]||[]).concat(n),t}),{})}}("profile"),E=A(D),Object.keys(E).map((function(e){var t={pointsSorted:E[e].sort((function(e,t){return parseInt(e.order)<parseInt(t.order)?-1:1})),pointsCount:E[e].length},n=Math.round(t.pointsSorted[t.pointsCount-1].measure,0);t=Object(d.a)({profileLength:n},t),O[e]=t})),C=function(){var e,t,n=[];Object.keys(O).map((function(o){t=O[o].pointsSorted,e=[],t.map((function(t){return e.push([t.longitude,t.latitude])}));var r=new p({hasZ:!1,hasM:!0,paths:e,spatialReference:{wkid:4326}}),i={};i.objectID=o,i.count=t.length,i.length=t[t.length-1].measure;var a=new g({geometry:r,attributes:i});n.push(a)}));var o={type:"unique-value",field:"objectID",uniqueValueInfos:Object.keys(O).map((function(e){return t=e,n=F[e],{value:t,symbol:{type:"simple-line",color:n,width:5},label:t};var t,n}))};return[n,o]},T=function(){var e=C(),t=Object(f.a)(e,2),n=t[0],o=t[1];return new c({source:n,objectIdField:"objectID",fields:[{name:"objectID",type:"oid"},{name:"count",type:"integer"},{name:"length",type:"double"}],popupTemplate:{title:"Profile",content:"Profile {objectID} - {count} structures - {length} m"},renderer:o,title:"Profiles"})},z=function(){var e=L(D);return new c({source:e,objectIdField:"id",fields:[{name:"id",type:"oid"},{name:"profile",type:"string"},{name:"order",type:"string"},{name:"structureAngles",type:"string"},{name:"latitude",type:"double"},{name:"longitude",type:"double"},{name:"measure",type:"double"},{name:"code",type:"string"},{name:"mark",type:"string"},{name:"attributes",type:"string"}],popupTemplate:{title:"Structure Point",expressionInfos:[{name:"measure-roundup",title:"Measure Roundup",expression:"Round($feature.measure, 0)"}],content:"<li>StructureAngles: {structureAngles}</li>"},renderer:{type:"unique-value",field:"profile",uniqueValueInfos:k.map((function(e){return{value:t=e,symbol:{type:"simple-marker",size:8,color:F[t],outline:{width:1.5,color:"white"}},label:t};var t}))},labelingInfo:N,title:"Structure Points"})},M=function(){var e=L(I);return console.log("other points number",e.length),new c({source:e,objectIdField:"id",fields:[{name:"id",type:"oid"},{name:"latitude",type:"double"},{name:"longitude",type:"double"},{name:"code",type:"string"},{name:"attributes",type:"string"}],popupTemplate:{title:"Non-Structure Point",content:"<p>Point <b>{id} ({code})</b></p><ul><li>{attributes}</li><ul>"},renderer:{type:"simple",symbol:{type:"simple-marker",size:5,color:"blue",outline:{width:.5,color:"white"}}},labelingInfo:V,title:"Non-Structure Points"})},N={symbol:{type:"text",color:"red",haloColor:"white",haloSize:"1.5px",font:{size:"18px",family:"Noto Sans",style:"italic",weight:"bolder"}},labelPlacement:"above-right",labelExpressionInfo:{expression:"$feature.mark + '' + $feature.order"},deconflictionStrategy:"static"},V={symbol:{type:"text",color:"blue",haloColor:"white",haloSize:"1px",font:{size:"15px",family:"Noto Sans",style:"italic",weight:"bolder"}},labelPlacement:"above-right",labelExpressionInfo:{expression:"$feature.id + ' - ' + $feature.code"},deconflictionStrategy:"static"},q=function(e){return e.queryExtent().then((function(e){w.goTo(e.extent).catch((function(e){"AbortError"!==e.name&&console.error(e)}))}))},R=z(),B=M(),(S=T()).when((function(){console.log("Zoom to line layer"),q(S)})),x=new i({basemap:"hybrid",layers:[S,B,R]}),w=new a({container:"viewDiv",center:[-168,46],zoom:2,map:x,highlightOptions:{color:[255,255,0,1],haloOpacity:.9,fillOpacity:.4}}),$=new h({view:w,listItemCreatedFunction:function(e){var t=e.item;t.title.includes("Profile")?(t.actionsOpen=!0,t.actionsSections=[["All"].concat(Object(s.a)(Object.keys(O))).map((function(e){var t;return t="All"===e?Object.keys(O).map((function(e){return O[e].profileLength})).reduce((function(e,t){return e+t})):O[e].profileLength,{title:"Profile ".concat(e," - ").concat(t," m"),className:"esri-icon-zoom-out-fixed",id:e}}))]):"Structure Points"===t.title&&(t.actionsOpen=!1,t.actionsSections=[D.map((function(e){return{title:"".concat(e.id," - Profile ").concat(e.profile," - ").concat(e.mark).concat(e.order).concat(e.structureAngles&&" - With Angles"),className:"esri-icon-zoom-out-fixed",id:"".concat(e.id)}}))])},container:"layerListDiv"}),w.ui.add($,"top-right"),H=new b(["All"].concat(Object(s.a)(Object.keys(O))).map((function(e){return{id:e,expression:"objectID = '".concat(e,"'")}}))),Z=new b(D.map((function(e){return{id:e.id,expression:"id = '".concat(e.id,"'")}}))),_=S.createQuery(),J=R.createQuery(),w.whenLayerView(S).then((function(e){var t=S.fullExtent,n=new v({view:w});n.goToOverride=function(){w.goTo({target:t},{duration:2e3,easing:"in-out-expo"}).catch((function(e){"AbortError"!==e.name&&console.log(e)}))},w.ui.add(n,"top-left"),$.on("trigger-action",(function(e){var n,o,r=e.action.id,i=e.item.layer;e.item.title.includes("Profile")?(n=H.find((function(e){return e.id===r})).expression,o=_):(n=Z.find((function(e){return e.id===r})).expression,o=J),n.includes("All")?w.goTo({target:t},{duration:2e3,easing:"in-out-expo"}).catch((function(e){"AbortError"!==e.name&&console.log(e)})):(o.where=n,i.queryFeatures(o).then((function(e){var t=e.features[0];if(console.log("type",t.geometry.type),"point"===t.geometry.type)w.goTo({target:t.geometry,zoom:19},{duration:2e3,easing:"in-out-expo"}).catch((function(e){"AbortError"!==e.name&&console.log(e)}));else{var n=t.geometry.extent.clone();w.goTo({target:t.geometry,extent:n.expand(1.5)},{duration:2e3,easing:"in-out-expo"}).catch((function(e){"AbortError"!==e.name&&console.log(e)}))}})))}))}))):(x=new i({basemap:"hybrid"}),w=new a({container:"viewDiv",center:[-116,54],zoom:6,map:x,highlightOptions:{color:[255,255,0,1],haloOpacity:.9,fillOpacity:.4}})),(Q=document.createElement("div")).id="coordsWidget",Q.className="esri-widget esri-component",Q.style.padding="7px 15px 5px",w.ui.add(Q,"bottom-left"),W=function(e){var t="Lat/Lon "+e.latitude.toFixed(3)+" "+e.longitude.toFixed(3)+" | Scale 1:"+Math.round(1*w.scale)/1+" | Zoom "+w.zoom;Q.innerHTML=t},w.watch("stationary",(function(e){W(w.center)})),w.on("pointer-move",(function(e){W(w.toMap({x:e.x,y:e.y}))})),e.next=33;break;case 30:e.prev=30,e.t0=e.catch(0),console.error(e.t0);case 33:case"end":return e.stop()}}),e,null,[[0,30]])})));return function(t){return e.apply(this,arguments)}}();return Object(r.useEffect)((function(){console.log("Map get data: ".concat((new Date).toLocaleTimeString()),n);var e=document.getElementById("layerListDiv");e&&(e.innerHTML=""),i(n)}),[n]),Object(o.jsxs)("div",{id:"contentDiv",className:e.contentDiv,children:[Object(o.jsx)("div",{id:"viewDiv",className:e.viewDiv}),n&&Object(o.jsx)("div",{id:"layerListDiv",className:e.layerListDiv})]})},x=n(30),w=function(){var e=Object(r.useContext)(h),t=Object(f.a)(e,2)[1];return Object(o.jsx)(x.a,{onDrop:function(e){var n=Object.values(e).filter((function(e){return!!e})).map((function(e){var t=e.data;return e.data.order?{id:t.id,code:t.code,mark:t.struc_mark,profile:t.profile,order:t.order,structureAngles:t.struc_angles,longitude:parseFloat(t.longitude),latitude:parseFloat(t.latitude),measure:parseFloat(t.measure),attributes:t.attributes}:{id:t.id,code:t.code,longitude:parseFloat(t.longitude),latitude:parseFloat(t.latitude),attributes:t.attributes}}));t(n)},onError:function(e,t,n,o){console.log(e)},addRemoveButton:!0,removeButtonColor:"#659cef",onRemoveFile:function(e){},config:{header:!0},children:Object(o.jsx)("span",{children:"Drop CSV file here or click to upload."})})},O=function(){return Object(r.useEffect)((function(){document.title="Fortis CSV Viewer"}),[]),Object(o.jsx)("div",{style:{width:"95%",height:"100%",margin:"auto"},children:Object(o.jsxs)(b,{children:[Object(o.jsx)(w,{}),Object(o.jsx)(j,{})]})})},S=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,70)).then((function(t){var n=t.getCLS,o=t.getFID,r=t.getFCP,i=t.getLCP,a=t.getTTFB;n(e),o(e),r(e),i(e),a(e)}))};c.a.render(Object(o.jsx)(i.a.StrictMode,{children:Object(o.jsx)(O,{})}),document.getElementById("root")),S()}},[[58,1,2]]]);
//# sourceMappingURL=main.2c3978a8.chunk.js.map