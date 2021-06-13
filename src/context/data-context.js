import React, {useState, createContext} from "react";
import sampleData from "../samples/sample.json";

export const DataContext = createContext()

export const DataContextProvider = props => {
    const [data, setData] = useState({
      csvValues: sampleData,
      fileInfo: {
        name: 'Sample Data',
      },
    });
    return (
        <DataContext.Provider value={[data, setData]}>
            {props.children}
        </DataContext.Provider>
    )
}