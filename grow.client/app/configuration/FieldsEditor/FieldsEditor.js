'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { PageItems } from './PageItems/PageItems';

export default function FieldsEditor(props) {
  return useMemo(() => <FieldsEditorComponent {...props} />, [...props.deps, props.json])
}

function FieldsEditorComponent({ dynamicFormData, json, onEditorChange, onJsonChange, onAddGroup, ...props }) {

  const [isLoading, setIsLoading] = useState(true);
  const [openField, setOpenField] = useState([]);
  const [editMode, setEditMode] = useState('editor')
  // console.log(dynamicFormData.currentPage)
  const formMethods = useForm();

  const watchFields = formMethods.watch();
  const stringWatchFields = JSON.stringify(watchFields)
  // console.log(watchFields)

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      // console.log('onEditorChange', watchFields)
      onEditorChange && onEditorChange(watchFields)
      // This is triggering an extra change event when it shouldn't need to but we'll accept that for now.
    }, 500)

    return () => { clearTimeout(timeout) }
  }, [stringWatchFields, isLoading])

  useEffect(() => {
    // console.log('reset', dynamicFormData.currentPage)
    formMethods.reset({ ...dynamicFormData.currentPage })
    setIsLoading(false);
  }, [dynamicFormData.currentPage])

  const handleClick = (id) => {
    const openFieldIndex = openField.indexOf(id)
    let currentOpenFields = [...openField]
    if (openFieldIndex > -1) {
      currentOpenFields.splice(openFieldIndex, 1)
      // console.log('removing', openField, id, openFieldIndex, currentOpenFields)
      setOpenField(currentOpenFields);
    }
    else {
      currentOpenFields = currentOpenFields.filter(x => id.indexOf(x) === 0)
      // console.log('adding', openField, currentOpenFields, id, openFieldIndex)
      setOpenField([...currentOpenFields, id]);
    }
  };

  const handleNewFieldClick = (groupId, viewId, viewGroupId) => {
    // console.log(groupId, viewId, viewGroupId);
    if (onEditorChange === undefined) {
      return;
    }

    const newId = uuidv4();

    const newGroups = watchFields?.groups?.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      const newViews = group.views?.map((view) => {
        if (view.id !== viewId) {
          return view;
        }

        const newViewGroups = view.groups?.map((viewGroup) => {
          if (viewGroup.id !== viewGroupId) {
            return viewGroup;
          }

          return { ...viewGroup, fields: [...viewGroup.fields, { id: newId, type: null, name: "", props: { label: "" } }] }

        })

        return { ...view, groups: newViewGroups }
      })
      return { ...group, views: newViews }
    })

    const newFields = { ...watchFields, groups: newGroups }

    // console.log(newFields);
    onEditorChange(newFields)

    handleClick(newId);
  }

  if (isLoading) {
    return null;
  }

  return (
    <Grid xs={4}>
      <Box sx={{ flexGrow: 1, pt: 4, pr: { xs: 2, md: 4 }, mt: -.5 }}>
        <Paper sx={{ width: '100%' }}>
          <Grid container sx={{ borderBottom: 1, borderColor: 'grey.300', px: 2, pt: 1, justifyContent: "space-around" }}>
            <Button variant={editMode === 'editor' ? "solid" : "text"} onClick={() => setEditMode('editor')}>Editor</Button>
            <Button variant={editMode === 'json' ? "solid" : "text"} onClick={() => setEditMode('json')}>Json</Button>
          </Grid>
          {editMode === 'editor' && (
            <>
              <List>
                <PageItems
                  page={watchFields}
                  control={formMethods.control}
                  openField={openField}
                  onClick={handleClick}
                  onNewFieldClick={handleNewFieldClick}
                  {...props} />
              </List>
              {props.editorLevel === 'page' && (
                <Box sx={{ px: 2, pb: 1 }}>
                  <Button onClick={() => onAddGroup && onAddGroup()}>Add New Group</Button>
                </Box>
              )}
            </>
          )}
          {editMode === 'json' && (
            <Box sx={{ flexGrow: 1, p: 2 }}>
              <TextField
                id="json-input"
                label="JSON"
                placeholder="{}"
                multiline
                fullWidth
                maxRows={38}
                value={json}
                onChange={onJsonChange} />
            </Box>
          )}
        </Paper>
      </Box>
    </Grid>
  )
}



