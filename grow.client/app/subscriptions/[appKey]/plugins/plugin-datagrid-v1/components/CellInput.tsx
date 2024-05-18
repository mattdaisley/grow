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

  const boxRef = useRef<any>(null);
  const caretPos = useRef<any>(null);

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
  }, [sanitizedValue, JSON.stringify(bracketValues)]);

  useEffect(() => {
    if (!boxRef.current || !caretPos.current) return;

    if (boxFocused) { 
      setCaret(boxRef.current, caretPos.current);
      boxRef.current.focus();
    }

    // let range = document.createRange();
    // let sel = window.getSelection();

    // if (!range || !sel) return;

    // console.log(boxRef.current, range, sel, caretPosition);
    // boxRef.current.selectionStart = caretPosition;
    // range.setStart(boxRef.current.childNodes[0], caretPosition);
    // range.collapse(true);

    // sel.removeAllRanges();
    // sel.addRange(range);
    // boxRef.current.focus();
  }, [boxRef.current, boxFocused, inputValue]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    // console.log("handleBoxClick", anchorEl, e.currentTarget, e.target);
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
    setPopperText("");
  };

  const handleChange = (e) => {
    if (e.nativeEvent.data === '{') {
      console.log('open popper');
      setAnchorEl(e.target);
      setPopperFocused(true);
    }

    if (open) {
      setPopperText((oldValue) => oldValue + e.nativeEvent.data);
    }

    const collection = e.target.children;
    for (let i = 0; i < collection.length; i++) {
      const element = collection[i];
      const selector = element.getAttribute("data-bracket-selector");

      if (!selector) continue;

      element.innerHTML = selector;
      // console.log(element.innerHTML, selector)
    }

    caretPos.current = getCaret(e.target);
    // console.log(e, caretPosition, caretPos.current);

    const sanitizedValue = sanitizeHtml(e.target.innerHTML, sanitizeConf);
    // console.log(sanitizedValue);
    onChange && onChange(sanitizedValue);
  };

  const open = Boolean(anchorEl);
  // console.log(inputValue, anchorEl);

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
            textOverflow: "ellipsis",

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
        ref={boxRef}
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


function getCaret(el) {
  let caretAt = 0;
  const sel = window.getSelection();

  if (sel.rangeCount == 0) {
    return caretAt;
  }

  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.endContainer, range.endOffset);
  caretAt = preRange.toString().length;

  return caretAt;
}

function setCaret(el, offset) {
  if (el.childNodes.length === 0) {
    return;
  }
  
  let sel = window.getSelection();
  let range = document.createRange();

  let targetOffset = offset;

  let nodeIndex = 0;
  let nodesLength = 0;
  for (let i = 0; i < el.childNodes.length; i++) {

    const selector =
      el.childNodes[i]?.getAttribute &&
      el.childNodes[i]?.getAttribute("data-bracket-selector");

    const childNodeTextLength = el.childNodes[i].textContent?.length;
    

    if (selector) {
      targetOffset = targetOffset - selector.length + childNodeTextLength; 
      nodesLength += childNodeTextLength;
    }
    else {
      nodesLength += el.childNodes[i].length;
    }

    // console.log(
    //   el.childNodes[i].length,
    //   el.childNodes[i].textContent,
    //   childNodeTextLength,
    //   selector,
    //   selector?.length,
    //   " - ",
    //   el.childNodes[i].outerHTML?.length,
    //   " - ",
    //   nodesLength,
    //   targetOffset
    // );

    if (nodesLength >= targetOffset) {
      nodeIndex = i;
      break;
    }
  }

  let caretPos = 0;
    // el.childNodes[0].length > offset ? offset : el.childNodes[0].length;

  if (nodesLength <= targetOffset) {
    caretPos = targetOffset - (nodesLength - el.childNodes[nodeIndex].length);
  }
  else {
    caretPos = el.childNodes[nodeIndex].length - (nodesLength - targetOffset);
  }

  if (caretPos > el.childNodes[nodeIndex].length) {
    caretPos = el.childNodes[nodeIndex].length;
  }

  // console.log(el.childNodes, offset, targetOffset, nodeIndex, nodesLength, caretPos);

  range.setStart(el.childNodes[nodeIndex], caretPos);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}
