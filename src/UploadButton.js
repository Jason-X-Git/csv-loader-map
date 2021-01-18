import React, {useContext} from 'react'

import {CSVReader} from 'react-papaparse'
import {DataContext} from "./context/data-context";

const MyDropZone = () => {
    const [, setData] = useContext(DataContext)
    const handleOnDrop = (data) => {
        // console.log('values: ', Object.values(data))
        const dataValues = Object.values(data)
            .filter(item => !!item)
            .map(item => {
                    const obj = item.data
                    return {
                        id: obj.id,
                        profile: parseInt(obj.profile),
                        order: parseInt(obj.order),
                        longitude: parseFloat(obj.longitude),
                        latitude: parseFloat(obj.latitude),
                        measure: parseFloat(obj.measure),
                    }
                }
            )
        // console.log('Read as: ', dataValues)
        setData(dataValues)
    }

    const handleOnError = (err, file, inputElem, reason) => {
        console.log(err)
    }

    const handleOnRemoveFile = (data) => {
    }

    return (
        <CSVReader
            onDrop={handleOnDrop}
            onError={handleOnError}
            addRemoveButton
            removeButtonColor='#659cef'
            onRemoveFile={handleOnRemoveFile}
            config={{header: true}}
        >
            <span>Drop CSV file here or click to upload.</span>
        </CSVReader>
    )
}

export default MyDropZone