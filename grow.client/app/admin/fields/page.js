'use client'

import { Children, cloneElement, Fragment, isValidElement, useState, useEffect } from "react";
import { FormProvider, useForm, Controller, useFormContext } from "react-hook-form";

import TextField from "@mui/material/TextField";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Unstable_Grid2';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';

import useFields from '../hooks/useFields';
import usePages from '../hooks/usePages';
import TextFormControl from "../components/TextFormControl";
import useViews from "../hooks/useViews";

export default function AdminFieldsPage() {

  const dynamicItemsName = "Admin"

  const { allFields, addItem: addFieldItem, setItems: setFieldsItems } = useFields()
  console.log('AdminFieldsPage', allFields)

  if (allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Fields" }, timestamp: Date.now(), data: allFields.item }

  const actions = {
    setItems: setFieldsItems,
    onAddItem: (name, value) => {
      console.log('onAddItem:', name, value)
      if (name.split('.')[0] === 'fields') {
        addFieldItem(name, value)
      }
    },
    onDeleteItem: (name) => {
      console.log('onDeleteItem:', name)
    }
  }

  // const dynamicItem = { item: { name: "Configuration" } };
  return (
    <AdminEditPage dynamicItem={dynamicItem} dynamicFormData={dynamicFormData} actions={actions} onSubmit={() => { }} />
  )
}



function AdminEditPage({ ...props }) {
  return (
    <>
      <DynamicAppBar dynamicItem={props.dynamicItem} dynamicFormData={props.dynamicFormData} />
      <DynamicForm {...props}>
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            {/* <DynamicFields data={props.dynamicFormData.data} /> */}
          </Grid>
          <Grid xs={4}>
            <DynamicFieldsEditor data={props.dynamicFormData.data} {...props} />
          </Grid>
          {/* <FieldsEditor
            dynamicFormData={dynamicFormData}
            json={currentJson}
            deps={deps}
            onEditorChange={handleFieldsEditorChange}
            onJsonChange={handleJsonChanged}
            {...props} /> */}
        </Grid>
      </DynamicForm>
    </>
  )
}

function DynamicAppBar({ dynamicItem, dynamicFormData }) {
  return (
    <AppBar position="sticky" color="paper" sx={{ top: 0, bottom: 'auto' }}>
      <Toolbar disableGutters sx={{ py: 2, px: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="subtitle1">{dynamicItem.item.name} / {dynamicFormData.currentPage.name}</Typography>
        <Typography variant="subtitle2">Up to date as of {new Date(dynamicFormData.timestamp).toLocaleString('en-us')}</Typography>
      </Toolbar>
    </AppBar>
  );
}

function DynamicForm({ ...props }) {
  const dynamicFormData = props.dynamicFormData

  const formMethods = useForm();
  const fields = formMethods.watch()

  useEffect(() => {
    console.log('DynamicForm fields', fields, props)
    props.actions.setItems && props.actions.setItems(fields);
  }, [JSON.stringify(fields)])
  // console.log('DynamicForm form fields:', fields)

  return (
    <form onSubmit={formMethods.handleSubmit(props.onSubmit)}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 } }}>
        <Grid container xs={12} spacing={0}>
          <FormProvider {...formMethods}>
            {props.children}
          </FormProvider>
        </Grid>
      </Box>
    </form>
  )
}

function DynamicFields({ ...props }) {

  return (
    <Grid container spacing={4} sx={{ width: '100%' }}>
      {
        Object.keys(props.data)
          .map(key => {
            console.log('DynamicFields data:', key, props.data[key])
            switch (key) {

              case 'sections':
              case 'views':
              case 'groups':
                return null;

              case 'fields':
                return <FieldsInGroup key={key} name={key} {...props.data[key]} />

              default:
                return null;
            }
          })
          .filter(item => item !== null)
      }
    </Grid>
  );
}

function SectionsInPage(props) {

}

function ViewsInSection(props) {

}

function GroupsInView(props) {

}

function FieldsInGroup({ name, ...props }) {
  console.log('FieldsInGroup', name, props);
  return (
    <>
      {Object.keys(props).map(key => {
        return <DynamicFieldControl key={key} name={`${name}.${key}`} {...props[key]} />
      })}
    </>
  );
}

function DynamicFieldControl({ ...props }) {

  // console.log(field?.name);
  const getFieldControl = () => {
    switch (props.type) {
      case 'text':
      case 'numeric':
        return TextFormControl;
      // case 'autocomplete':
      //   return AutocompleteItem;
      // case 'checkbox':
      //   return CheckboxItem;
      // case 'select':
      //   return SelectItem;
      // case 'label':
      //   return LabelItem;
      default:
        // Do nothing for an unsupported type
        return undefined;
    }
  };

  const FieldControl = getFieldControl();

  if (!FieldControl) {
    return null;
  }

  return <FieldControl {...props} />;

}


function DynamicFieldsEditor({ ...props }) {

  const [editMode, setEditMode] = useState('editor')

  return (
    <Box sx={{ flexGrow: 1, pt: 4, pr: { xs: 2, md: 4 }, mt: -.5 }}>
      <Paper sx={{ width: '100%' }}>
        <Grid container sx={{ borderBottom: 1, borderColor: 'grey.300', px: 2, pt: 1, justifyContent: "space-around" }}>
          <Button variant={editMode === 'editor' ? "solid" : "text"} onClick={() => setEditMode('editor')}>Editor</Button>
          <Button variant={editMode === 'json' ? "solid" : "text"} onClick={() => setEditMode('json')}>Json</Button>
        </Grid>
        {editMode === 'editor' && (
          <EditorControls {...props} />
        )}
        {editMode === 'json' && (
          <Box sx={{ flexGrow: 1, p: 2 }}>
            {/* <TextField
              id="json-input"
              label="JSON"
              placeholder="{}"
              multiline
              fullWidth
              maxRows={38}
              value={json}
              onChange={onJsonChange} /> */}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

function EditorControls({ ...props }) {
  console.log('EditorControls', props)

  let namePrefix = ""
  if (props.name !== undefined) {
    namePrefix = `${props.name}.`
  }

  if (props.data.hasOwnProperty('pages')) {
    return <EditPages {...props} name={`${namePrefix}pages`} data={{ ...props.data.pages }} />
  }

  if (props.data.hasOwnProperty('sections')) {
    return <EditSections {...props} name={`${namePrefix}sections`} data={{ ...props.data.sections }} />
  }

  if (props.data.hasOwnProperty('fields')) {
    return <EditFields {...props} name={`${namePrefix}fields`} data={{ ...props.data.fields }} />
  }

  return null;
}

function EditPages({ name, ...props }) {
  console.log('EditPages', name, props)

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditPageItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          )
        })}
      </EditorList>
      <AddItemControl name={name} type="Page" actions={props.actions} />
    </>
  );
}

function EditPageItem({ ...props }) {
  console.log('EditPageItem', props)

  let primary = props.data.label ?? props.data.name ?? props.name
  let secondary
  if (primary === props.data.label) {
    secondary = props.data.name
  }

  return (
    <EditListItem {...props} primary={primary} secondary={secondary} />
  )
}

function AddItemControl({ ...props }) {

  const [addingItem, setAddingItem] = useState(false);
  const [itemName, setItemName] = useState("");

  const handleAddItemConfirmClick = () => {
    // console.log(addingViewValue)
    setAddingItem(false)
    setItemName("")
    props.actions.onAddItem && props.actions.onAddItem(props.name, itemName)
  }

  return (
    <Box sx={{ pt: 1, pb: 2, px: 2 }}>
      {!addingItem && (
        <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem(true)}>Add {props.type}</Button>
      )}
      {addingItem && (
        <>
          <TextField
            label="Name"
            fullWidth
            size="small"
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
          />
          <Button
            color="secondary"
            size="small"
            sx={{ mt: 1 }}
            disabled={itemName === ""}
            onClick={handleAddItemConfirmClick}>
            Confirm
          </Button>
        </>
      )}
    </Box>

  )
}

function EditorList({ ...props }) {

  const [openFields, setOpenFields] = useState([]);

  const handleClick = (name) => {
    console.log('EditorList handleClick', name)
    const openFieldIndex = openFields.indexOf(name)
    let currentOpenFields = [...openFields]
    if (openFieldIndex > -1) {
      currentOpenFields.splice(openFieldIndex, 1)
      setOpenFields(currentOpenFields);
    }
    else {
      currentOpenFields = currentOpenFields.filter(x => name.indexOf(x) === 0)
      setOpenFields([...currentOpenFields, name]);
    }
  };

  const childrenWithProps = Children.map(props.children, child => {
    // Checking isValidElement is the safe way and avoids a
    // typescript error too.
    if (isValidElement(child)) {
      return cloneElement(child, { openFields, onClick: handleClick });
    }
    return child;
  });

  return (
    <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
      <List sx={{ width: '100%' }}>
        {childrenWithProps.map(child => <Fragment key={child.key}>
          {child}
          <Divider />
        </Fragment>)}
      </List>
    </Grid>
  )
}

function EditListItem({ primary, secondary, ...props }) {
  // console.log('EditListItem', name, data)
  const name = props.name;
  const data = props.data;
  const openFields = props.openFields;
  const onClick = props.onClick;

  const formMethods = useFormContext();

  const isOpen = openFields?.includes(name) ?? false

  function handleClick() {
    onClick && onClick(name)
  }

  return (
    <>
      {isOpen ? (
        <ListItem
          key={name}
          sx={{ height: '55px' }}
          secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={handleClick}>
            <ExpandLess />
          </ListItemIcon>}>
          <Controller
            name={`${name}.label`}
            control={formMethods.control}
            defaultValue={data.label ?? primary}
            render={({ field }) => {
              console.log('EditListItem label field', field, data, primary);
              return <TextField
                label="label"
                variant="standard"
                size="small"
                sx={{ fontSize: 'small' }}
                fullWidth
                placeholder={primary}
                {...field} />;
            }} />
        </ListItem>
      ) : (
        <ListItem
          key={name}
          sx={{ height: '55px' }}
          onClick={handleClick}
          secondaryAction={<ListItemIcon sx={{ justifyContent: 'flex-end' }}>
            <ExpandMore />
          </ListItemIcon>}>
          <ListItemText primary={primary} secondary={secondary} />
        </ListItem>
      )}

      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Stack spacing={2} sx={{ px: 2, py: 2 }}>

          <Controller
            name={`${name}.name`}
            control={formMethods.control}
            defaultValue={data.name ?? ""}
            render={({ field }) => {
              // console.log(fieldArrayName, appField, field);
              return <TextField
                label="name"
                size="small"
                fullWidth
                {...field} />;
            }} />

          <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
            <EditorControls {...props} name={name} />
          </Box>
        </Stack>
      </Collapse>
    </>
  )
}

function EditSections({ name, ...props }) {
  console.log('EditSections', name, props)

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditSectionItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          )
        })}
      </EditorList>
      <AddItemControl name={name} type="Section" actions={props.actions} />
    </>
  );
}

function EditSectionItem({ ...props }) {
  console.log('EditSectionItem', props)

  let primary = props.data.label ?? props.data.name ?? props.name
  let secondary
  if (primary === props.data.label) {
    secondary = props.data.name
  }

  return (
    <EditListItem {...props} primary={primary} secondary={secondary} />
  )
}

function EditViews({ name, ...props }) {
  console.log('EditViews', name, props)

  return null;
}

function EditFields({ name, ...props }) {
  console.log('EditFields', name, props)

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditFieldItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          )
        })}
      </EditorList>
      <AddItemControl name={name} type="Field" actions={props.actions} />
    </>
  );
}

function EditFieldItem({ ...props }) {
  console.log('EditFieldItem', props)

  let primary = props.data.label ?? props.data.name ?? props.name
  let secondary
  if (primary === props.data.label) {
    secondary = props.data.name
  }

  return (
    <EditListItem {...props} primary={primary} secondary={secondary} />
  )
}