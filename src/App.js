import React from "react";
import MyMap from "./MyMapZoom"
import MyDropZone from "./UploadButton"
import {DataContextProvider} from "./context/data-context";

const App = () => {
    return (
        <div style={{width: '95%', height: '100%', margin: "auto"}}>
            <DataContextProvider>
                <MyDropZone/>
                <MyMap/>
            </DataContextProvider>
        </div>
    );
}

export default App
