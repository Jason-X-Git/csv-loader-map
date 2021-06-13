import React, { useEffect } from "react";
import MyMap from "./MapComponent";
import MyDropZone from "./UploadButton";
import { DataContextProvider } from "./context/data-context";
import SidePanel from "./SidePanel"

const App = () => {
  useEffect(() => {
    document.title = "Fortis CSV Viewer";
  }, []);
  return (
    <DataContextProvider>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SidePanel />
        <div style={{ width: "85%", height: "100%", margin: "5px 10px" }}>
          <MyDropZone />
          <MyMap />
        </div>
      </div>
    </DataContextProvider>
  );
};

export default App;
