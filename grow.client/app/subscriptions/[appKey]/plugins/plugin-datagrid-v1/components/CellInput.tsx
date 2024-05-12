"use client";

import { useEffect, useRef } from "react";
import sanitizeHtml from "sanitize-html";
import { Box } from "@mui/material";

export function CellInput({ value, onChange, readonly }) {
  // console.log("CellInput", value, onChange, readonly);
  const inputValue = value === undefined ? "" : value;

  // return <div contentEditable html={inputValue}></div>;
  const contentEditableRef = useRef(null);

  useEffect(() => {
    if (contentEditableRef.current.textContent !== inputValue) {
      contentEditableRef.current.textContent = inputValue;
    }
  }, [contentEditableRef.current]);

  const handleChange = (e) => {
    const sanitizeConf = {
      allowedTags: ["b", "i", "a", "p"],
      allowedAttributes: { a: ["href"] },
    };

    const sanitizedValue = sanitizeHtml(e.target.textContent, sanitizeConf);
    // console.log(onChange, sanitizedValue);
    onChange && onChange(sanitizedValue);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          overflow: "hidden",
          lineHeight: "1.5",
          p: 1,
          minWidth: "160px",
          "&:focus": {
            border: "1px solid #000",
            borderRadius: "4px",
            backgroundColor: "white",
            position: "absolute",
          },
        }}
        contentEditable="true"
        ref={contentEditableRef}
        onKeyDown={(e) => e.stopPropagation()}
        onInput={handleChange}
      />
    </div>
  );

  return (
    <input
      value={inputValue}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={handleChange}
      disabled={readonly}
    />
  );
}
