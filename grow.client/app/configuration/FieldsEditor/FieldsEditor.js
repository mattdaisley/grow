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

import { GroupItems } from './GroupItems/GroupItems';

export default function FieldsEditor(props) {
  return useMemo(() => <FieldsEditorComponent {...props} />, [...props.deps])
}

function FieldsEditorComponent({ dynamicFormData, json, onEditorChange, onJsonChange }) {

  const [openField, setOpenField] = useState(undefined);
  const [editMode, setEditMode] = useState('editor')

  const formMethods = useForm({ defaultValues: { ...dynamicFormData.currentPage } });

  const watchFields = formMethods.watch();
  // console.log(watchFields)

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      // console.log('in timeout')
      onEditorChange && onEditorChange(watchFields)
    }, 500)

    return () => { clearTimeout(timeout) }
  }, [watchFields])

  useEffect(() => {
    formMethods.reset({ ...dynamicFormData.currentPage })
  }, [dynamicFormData.currentPage])

  const handleClick = (id) => {
    if (openField === id) {
      setOpenField(undefined);
    }
    else {
      setOpenField(id);
    }
  };

  const handleNewFieldClick = (groupId, viewId, viewGroupId) => {
    console.log(groupId, viewId, viewGroupId);
    if (onChange === undefined) {
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

    console.log(newFields);
    onEditorChange(newFields)

    setOpenField(newId);
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
            <List>
              {watchFields?.groups?.map((group, groupIndex) => {
                const groupControlName = `groups.${groupIndex}`

                return <GroupItems
                  key={groupIndex}
                  group={group}
                  groupControlName={groupControlName}
                  control={formMethods.control}
                  openField={openField}
                  onClick={handleClick}
                  onNewFieldClick={handleNewFieldClick} />
              })}
            </List>
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



