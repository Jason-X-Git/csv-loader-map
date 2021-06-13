import React, { useContext } from "react";
import { DataContext } from "./context/data-context";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  panel: {
    width: "15%",
    margin: "15px 15px",
    color: "white",
    background: "slateblue",
    wordWrap: "break-word",
    borderRadius: "10px",
  },
  header: {
    fontSize: "30px",
    fontWeight: 500,
    color: "wheat"
  },
  section: {
    margin: "5px",
    padding: "2px",
  },
  label: {
    fontSize: "20px",
    fontWeight: 500,
    fontStyle: "italic",
  },
  details: {
    fontSize: "15px",
    fontWeight: 300,
  },
}));

const SidePanel = () => {
  const classes = useStyles();

  const [data] = useContext(DataContext);

  return (
    <div className={classes.panel}>
      {data.fileInfo && (
        <div className={classes.section}>
          <p className={classes.header}>File Info</p>
          <p className={classes.label}>{data.fileInfo.name}</p>
          <p className={classes.label}>{data.fileInfo.lastModified}</p>
        </div>
      )}

      {data.sortedProfileNoList && (
        <div className={classes.section}>
          <p className={classes.header}>Project Details</p>
          <p className={classes.label}>
            {data.sortedProfileNoList.length} Profiles
          </p>
          <p className={classes.details}>
            {data.sortedProfileNoList.join(", ")}
          </p>
        </div>
      )}
      {data.sortedStructures && (
        <p className={classes.section}>
          <p className={classes.label}>
            {data.sortedStructures.length} Structures
          </p>
        </p>
      )}
      {data.otherPoints && (
        <p className={classes.section}>
          <p className={classes.label}>
            {data.otherPoints.length} Non-Structures
          </p>
        </p>
      )}
    </div>
  );
};

export default SidePanel;
