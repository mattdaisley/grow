'use client';

import { useContext } from "react";
import { useFormContext } from "react-hook-form";

import { TextField } from "@mui/material";

import { DynamicItemContext as DynamicPageContext } from "./DynamicItemContext";
import { TextItem } from "../../../components/Elements/TextItem";
import { RenderedViews } from "../../../components/Rendering/RenderedViews";

export function DynamicFields({ currentPage }) {
  const dynamicPageData = useContext(DynamicPageContext);

  const formMethods = useFormContext();
  const fields = formMethods.watch();

  // console.log(dynamicPageData);
  return (
    <>
      <RenderedViews pageDefinition={currentPage} control={formMethods.control} />
      {false && <TextField
        id="form-results"
        multiline
        fullWidth
        maxRows={35}
        value={JSON.stringify(fields, null, 2)}
        InputProps={{
          readOnly: true,
        }} />}
    </>
  );
}
