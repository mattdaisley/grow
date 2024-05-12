"use client";

import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import sanitizeHtml from 'sanitize-html';
import { Box, IconButton, Paper, Popper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Record } from "../../../store/domain/Record";

const sanitizeConf = {
  allowedTags: ["b", "i", "a", "p"],
  allowedAttributes: { a: ["href"] },
};

const BracketValue = ({ selector, displayValue }) => {
  // console.log('InputValue', displayValue)

  return (
    <span
      data-bracket-selector={selector}
      contentEditable="false"
      dangerouslySetInnerHTML={{ __html: displayValue }}
    />
  );
};

export function CellInput({
  record,
  fieldName,
  rawValue,
  value,
  bracketValues,
  onChange,
  readonly,
}: {
  record: Record;
  fieldName: string;
  rawValue: string;
  value: string;
  bracketValues: any;
  onChange: Function;
  readonly: boolean;
}) {
  // console.log("CellInput", rawValue, value, bracketValues, onChange, readonly);
  const sanitizedValue =
    rawValue === undefined ? "" : sanitizeHtml(rawValue);

  const [inputValue, setInputValue] = useState(sanitizedValue);

  // console.log("CellInput rendering -", typeof rawValue, '-', sanitizeHtml(rawValue), '-', sanitizedValue, inputValue);

  const [popperFocused, setPopperFocused] = useState(false);
  const [popperText, setPopperText] = useState("");

  const [boxFocused, setBoxFocused] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    // console.log("handleBoxClick");
    setBoxFocused(true);

    const target = (e.target as HTMLElement).closest("[data-bracket-selector]");
    // console.log(
    //   target,
    //   record.appDisplayName,
    //   record.collectionDisplayName,
    //   record
    // );
    if (!target) return;

    const selector = target.getAttribute("data-bracket-selector");
    setPopperText(selector);
    setAnchorEl(anchorEl ? null : e.currentTarget);
    setPopperFocused(true);
    // setAnchorEl((e.target as HTMLElement).closest("[data-bracket-selector]"));
  };

  const handleBoxBlur = () => {
    setBoxFocused(false);
  };

  const handlePopperClose = () => {
    setPopperFocused(false);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    let html = sanitizedValue;

    if (bracketValues !== undefined && Object.keys(bracketValues).length > 0) {
      Object.entries(bracketValues).forEach(([selector, bracketValue]) => {
        html = html.replace(
          selector,
          renderToString(
            <BracketValue selector={selector} displayValue={bracketValue} />
          )
        );
      });
    }

    // console.log("CellInput html useEffect", sanitizedValue, html);

    setInputValue(html);
  }, [sanitizedValue]);

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
        sx={[
          (theme) => ({
            overflow: "hidden",
            lineHeight: "1.5",
            cursor: "pointer",

            "& span": {
              color: theme.palette.brackets.main,
            },
          }),
          (theme) =>
            (boxFocused || popperFocused) && {
              p: 1,
              minWidth: "160px",
              border: "2px solid #000",
              borderRadius: 1,
              backgroundColor: "white",
              position: "absolute",
              cursor: "text",

              "& span": {
                backgroundColor: theme.palette.brackets.main,
                color: theme.palette.brackets.contrastText,
                borderRadius: 1,
                px: 1,
                py: 0.5,
                cursor: "pointer",
              },
            },
        ]}
        contentEditable={!readonly}
        onClick={handleClick}
        onFocus={() => setBoxFocused(true)}
        onBlur={handleBoxBlur}
        onKeyDown={(e) => e.stopPropagation()}
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: inputValue }}
      />
      <Popper open={open} anchorEl={anchorEl} placement="top-start">
        <Paper sx={{ width: 400, height: 200, p: 2 }}>
          <input
            style={{ width: "100%" }}
            value={popperText}
            onChange={(e) => {}}
          />
          <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
            <IconButton onClick={handlePopperClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Paper>
      </Popper>
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
