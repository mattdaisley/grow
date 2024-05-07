"use client";

import Box from "@mui/material/Box";
import { IconButton, Modal } from "@mui/material";

import useAppState from "../../../store/useAppState";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { HardCodedAddRowOrColumn } from "./HardCodedAddRowOrColumn";
import { HardCodedAddCollection } from "./HardCodedAddCollection";

export default function PluginModal({ components, appStateKey, ...props }) {
  // console.log("PluginModal", components, appStateKey, props);

  const useAppStateResults = useAppState(appStateKey);
  // console.log(
  //   "PluginModal useAppStateResults",
  //   useAppStateResults,
  //   appStateKey
  // );

  const open =
    useAppStateResults[appStateKey] !== undefined
      ? Boolean(useAppStateResults[appStateKey].value)
      : false;

  const toggleDrawer = () => {
    const onChange = useAppStateResults[appStateKey]?.onChange;
    onChange && onChange(!open);
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal data-plugin="plugin-modal-v1" open={open} onClose={toggleDrawer}>
      <Box sx={style}>
        <ModalContents components={components} />
      </Box>
    </Modal>
  );
}

function ModalContents({ components }) {
  if (
    components?.value?.schema?.display_name === "Collection Modal Field Group"
  ) {
    return <HardCodedAddCollection components={components} />;
  }

  if (components?.value?.schema?.display_name === "Field Group 7") {
    return <HardCodedAddRowOrColumn components={components} />;
  }

  return (
    <>
      <ComponentsCollection components={components} />
    </>
  );
}
