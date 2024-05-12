"use client";

import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import sanitizeHtml from "sanitize-html";
import { Box } from "@mui/material";

const sanitizeConf = {
  allowedTags: ["b", "i", "a", "p"],
  allowedAttributes: { a: ["href"] },
};

const InputValue = ({ displayValue }) => {
  // console.log('InputValue', displayValue)

  return (
    <div
      contentEditable="false"
      dangerouslySetInnerHTML={{ __html: displayValue }}
      style={{
        backgroundColor: "lightsteelblue",
        display: "inline-block",
        borderRadius: 4,
        padding: "0 4px 0 4px",
      }}
    />
  );
};

export function CellInput({ rawValue, value, bracketValues, onChange, readonly }) {
  // console.log("CellInput", rawValue, value, bracketValues, onChange, readonly);

  const [inputValue, setInputValue] = useState("");

  const sanitizedValue =
    rawValue === undefined ? "" : sanitizeHtml(rawValue, sanitizeConf);

  let html = sanitizedValue;

  if (bracketValues !== undefined && Object.keys(bracketValues).length > 0) {
    Object.entries(bracketValues).forEach(([selector, bracketValue]) => {
      html = html.replace(
        selector,
        renderToString(<InputValue displayValue={bracketValue} />)
      );
    });
  }

  useEffect(() => {
    // console.log(displayValue, html);
    setInputValue(html);
  }, [html]);

  const handleChange = (e) => {
    console.log(e.target.innerHtml);
    const sanitizedValue = sanitizeHtml(e.target.innerHtml, sanitizeConf);
    // console.log(onChange, sanitizedValue);
    // onChange && onChange(sanitizedValue);
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
          "&:focus": {
            p: 1,
            minWidth: "160px",
            border: "1px solid #000",
            borderRadius: "4px",
            backgroundColor: "white",
            position: "absolute",
          },
        }}
        contentEditable="true"
        onKeyDown={(e) => e.stopPropagation()}
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: inputValue }}
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
