import React, {useContext} from 'react'

import {CSVReader} from 'react-papaparse'
import {DataContext} from "./context/data-context";

const MyDropZone = () => {
    const [data, setData] = useContext(DataContext)
    const handleOnDrop = (data, fileInfo) => {
        // console.log('values: ', Object.values(data))
        const dataValues = Object.values(data)
            .filter(item => !!item && item.data.id.length > 0)
            .map(item => {
                    const obj = item.data
                    if (item.data.order) {
                        return {
                            id: obj.id,
                            code: obj.code,
                            mark: obj.struc_mark,
                            profile: obj.profile,
                            order: obj.order,
                            structureAngles: obj.struc_angles,
                            structureGuys: obj.struc_guys,
                            longitude: parseFloat(obj.longitude),
                            latitude: parseFloat(obj.latitude),
                            measure: parseFloat(obj.measure),
                            attributes: obj.attributes,
                        }

                    } else {

                        return {
                            id: obj.id,
                            code: obj.code,
                            longitude: parseFloat(obj.longitude),
                            latitude: parseFloat(obj.latitude),
                            attributes: obj.attributes,
                        }
                    }
                }
            )
        setData({
          ...data,
          csvValues: dataValues,
          fileInfo: {
            name: fileInfo.name,
            lastModified: fileInfo.lastModifiedDate.toString(),
          },
        });
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