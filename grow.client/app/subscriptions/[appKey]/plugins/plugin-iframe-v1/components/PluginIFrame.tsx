import { Box, Button, ButtonGroup } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function PluginIFrame(props) {
  const iframeRef = useRef(null);
  const [url, setUrl] = useState(props.src);

  const [padding, setPadding] = useState(0);

  useEffect(() => {
    let interval = undefined;
    // if (!iframeRef.current) {
    interval = setInterval(() => {
      const href = iframeRef?.current?.contentWindow?.location?.href;
      // console.log(href);

      if (href === undefined || href === "about:blank") return;

      setUrl(iframeRef?.current?.contentWindow?.location?.href);
    }, 200);
    // }

    return () => {
      clearInterval(interval);
    };
  }, [iframeRef?.current]);

  return (
    <>
      <Box
        data-plugin="plugin-iframe-v1"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          paddingLeft: padding,
          paddingRight: padding,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 2,
            display: "flex",
            flexAlign: "center",
            justifyContent: "center",
          }}
        >
          <ButtonGroup>
            <Button
              onClick={() => {
                setPadding(0);
              }}
            >
              Desktop
            </Button>
            <Button
              onClick={() => {
                setPadding(66);
              }}
            >
              Tablet
            </Button>
            <Button
              onClick={() => {
                setPadding(96);
              }}
            >
              Mobile
            </Button>
          </ButtonGroup>
        </Box>
        <Box
          sx={{
            height: "40px",
            padding: 1,
            border: "1px solid white",
          }}
        >
          {url}
        </Box>
        <iframe
          ref={iframeRef}
          src={props.src}
          style={{
            border: "1px solid white",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        />
      </Box>
    </>
  );
}
