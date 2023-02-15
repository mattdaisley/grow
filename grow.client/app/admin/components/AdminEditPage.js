'use client';

import { Children, cloneElement, Fragment, isValidElement, useState, useEffect } from "react";
import { FormProvider, useForm, Controller, useFormContext } from "react-hook-form";

import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import TextField from "@mui/material/TextField";

import TextFormControl from "./TextFormControl";

export function AdminEditPage({ ...props }) {
  return (
    <>
      <DynamicAppBar dynamicItem={props.dynamicItem} dynamicFormData={props.dynamicFormData} />
      <DynamicForm {...props}>
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            {/* <DynamicFields data={props.dynamicFormData.data} /> */}
          </Grid>
          <Grid xs={4}>
            <DynamicFieldsEditor data={props.dynamicFormData.data} json={props.dynamicFormData.json} {...props} />
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
  );
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
  const dynamicFormData = props.dynamicFormData;

  const formMethods = useForm();
  const fields = formMethods.watch();

  useEffect(() => {
    console.log('DynamicForm fields', fields, props);
    props.actions.setItems && props.actions.setItems(fields);
  }, [JSON.stringify(fields)]);
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
  );
}

function DynamicFields({ ...props }) {

  return (
    <Grid container spacing={4} sx={{ width: '100%' }}>
      {Object.keys(props.data)
        .map(key => {
          console.log('DynamicFields data:', key, props.data[key]);
          switch (key) {

            case 'sections':
            case 'views':
            case 'groups':
              return null;

            case 'fields':
              return <FieldsInGroup key={key} name={key} {...props.data[key]} />;

            default:
              return null;
          }
        })
        .filter(item => item !== null)}
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
        return <DynamicFieldControl key={key} name={`${name}.${key}`} {...props[key]} />;
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

  const [editMode, setEditMode] = useState('editor');

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
            <TextField
              id="json-input"
              label="JSON"
              placeholder="{}"
              multiline
              fullWidth
              maxRows={38}
              value={props.json}
            // onChange={onJsonChange} 
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function EditorControls({ ...props }) {
  console.log('EditorControls', props);

  if (!hasNestedElements(props.data)) {
    return <AddMissingNestedElements {...props} />
  }

  return (
    <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
      <EditControls {...props} />
    </Box>
  );
}

function hasNestedElements(data) {
  const validNestedElements = ['pages', 'sections', 'views', 'groups', 'fields'];
  for (const key in data) {
    if (validNestedElements.includes(key)) {
      return true;
    }
  }

  return false;
}

function AddMissingNestedElements(props) {
  console.log('addMissingNestedElements', props)
  if (props.actions.onAddItem === undefined) {
    return null;
  }

  const nameSplit = props.name.split('.');

  if (nameSplit[nameSplit.length - 2] === 'pages') {
    return (
      <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, pt: 0, borderColor: 'grey.300' }}>
        <AddItemControl name={`${props.name}.sections`} type="Section" actions={props.actions} />
      </Box>
    )
  }

  if (nameSplit[nameSplit.length - 2] === 'sections') {
    return (
      <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, pt: 0, borderColor: 'grey.300' }}>
        <AddItemControl name={`${props.name}.views`} type="View" actions={props.actions} existingItems={props.allViews} />
      </Box>
    )
  }

  if (nameSplit[nameSplit.length - 2] === 'views') {
    return (
      <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, pt: 0, borderColor: 'grey.300' }}>
        <AddItemControl name={`${props.name}.groups`} type="Group" actions={props.actions} />
      </Box>
    )
  }

  if (nameSplit[nameSplit.length - 2] === 'groups') {
    return (
      <Box sx={{ flexGrow: 1, border: 1, borderRadius: 1, pt: 0, borderColor: 'grey.300' }}>
        <AddItemControl name={`${props.name}.fields`} type="Field" actions={props.actions} existingItems={props.allFields} />
      </Box>
    )
  }

  return null;
}

function EditControls({ ...props }) {
  console.log('EditControls', props);

  let namePrefix = "";
  if (props.name !== undefined) {
    namePrefix = `${props.name}.`;
  }

  const getEditControl = () => {
    const pagesKey = 'pages'
    if (props.data.hasOwnProperty(pagesKey)) {
      return { key: pagesKey, EditControl: EditPages }
    }

    const sectionsKey = 'sections'
    if (props.data.hasOwnProperty(sectionsKey)) {
      return { key: sectionsKey, EditControl: EditSections }
    }

    const viewsKey = 'views'
    if (props.data.hasOwnProperty(viewsKey)) {
      return { key: viewsKey, EditControl: EditViews }
    }

    const groupsKey = 'groups'
    if (props.data.hasOwnProperty(groupsKey)) {
      return { key: groupsKey, EditControl: EditGroups }
    }

    const fieldsKey = 'fields'
    if (props.data.hasOwnProperty(fieldsKey)) {
      return { key: fieldsKey, EditControl: EditFields }
    }

    return { key: null, EditControl: null };
  }

  const { key, EditControl } = getEditControl();
  if (EditControl === null) {
    return null;
  }

  return <EditControl {...props} name={`${namePrefix}${key}`} data={{ ...props.data[key] }} />;
}

function EditPages({ name, ...props }) {
  console.log('EditPages', name, props);

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditListItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Page" actions={props.actions} />
    </>
  );
}

function EditSections({ name, ...props }) {
  console.log('EditSections', name, props);

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditListItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Section" actions={props.actions} />
    </>
  );
}

function EditViews({ name, ...props }) {
  console.log('EditViews', name, props);

  let existingItems = undefined;

  const nameSplit = name.split('.');
  if (nameSplit[0] === 'pages') {
    existingItems = props.allViews;
  }

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          let listItemName = `${name}.${key}`;
          let listItemData = props.data[key];

          if (nameSplit[0] === 'pages') {
            listItemName = `views.${props.data[key].id}`;
            listItemData = props.allViews[props.data[key].id];
          }
          return (
            <EditListItem key={key} {...props} name={listItemName} data={listItemData} />
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="View" actions={props.actions} existingItems={existingItems} />
    </>
  );
}

function EditGroups({ name, ...props }) {
  console.log('EditGroups', name, props);

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditListItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Group" actions={props.actions} />
    </>
  );
}

function EditFields({ name, ...props }) {
  console.log('EditFields', name, props);

  const nameSplit = name.split('.');

  if (nameSplit[0] === 'views') {
    return (
      <>
        <EditorList>
          {Object.keys(props.data).map(key => {
            return (
              <EditListItem key={key} {...props} name={`fields.${props.data[key].id}`} data={{ ...props.allFields[props.data[key].id] }} />
            );
          })}
        </EditorList>
        <AddItemControl name={name} type="Field" actions={props.actions} existingItems={props.allFields} />
      </>
    );
  }

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditListItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }} />
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Field" actions={props.actions} />
    </>
  );
}

function AddItemControl({ ...props }) {
  if (props.existingItems !== undefined) {
    return <AddExistingItemControl {...props} />
  }

  return <AddNewItemControl {...props} />
}

function AddExistingItemControl({ ...props }) {

  const [addingItem, setAddingItem] = useState(false);
  const [itemValue, setItemValue] = useState({ value: null, label: "" });

  const handleAddItemConfirmClick = () => {
    console.log('AddExistingItemControl handleAddItemConfirmClick', props.name, itemValue)
    setAddingItem(false);
    setItemValue({ value: null, label: "" });
    props.actions.onAddItem && props.actions.onAddItem(props.name, "id", itemValue.value);
  };

  const handleAddItemCancelClick = () => {
    // console.log('AddExistingItemControl handleAddItemCancelClick', props.name, itemValue)
    setAddingItem(false);
    setItemValue({ value: null, label: "" });
  };

  const handleItemValueChange = (_, newValue) => {
    // console.log('AddExistingItemControl handleItemValueChange', newValue)
    if (newValue === null) {
      setItemValue({ value: null, label: "" });
    }
    else {
      setItemValue(newValue)
    }
  }

  const handleItemTextChange = (event) => {
    setItemValue({ ...itemValue, label: event.target.value ?? "" })
  }

  const options = Object.keys(props.existingItems).map(key => (
    {
      value: key,
      label: props.existingItems[key].label ?? props.existingItems[key].name
    }
  ))

  // const options = ["Test", "test2"]

  return (
    <Box sx={{ py: 2, px: 2 }}>
      {!addingItem && (
        <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem(true)}>Add {props.type}</Button>
      )}
      {addingItem && (
        <>
          <Autocomplete
            label={props.type}
            autoComplete
            autoSelect
            autoHighlight
            fullWidth
            size="small"
            options={options}
            value={itemValue.value}
            inputValue={itemValue.label}
            onChange={handleItemValueChange}
            isOptionEqualToValue={(option, testValue) => { console.log(option, testValue); return option?.value === testValue }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={props.type}
                onChange={handleItemTextChange}
              />
            )
            }
          // renderOption={(params) => { console.log(params); return <li key={params.id}>{params.key}</li> }}
          />
          <Button
            color="secondary"
            size="small"
            sx={{ mt: 1 }}
            disabled={itemValue.value === null}
            onClick={handleAddItemConfirmClick}>
            Confirm
          </Button>
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={handleAddItemCancelClick}>
            Cancel
          </Button>
        </>
      )}
    </Box>

  );
}

function AddNewItemControl({ ...props }) {

  const [addingItem, setAddingItem] = useState(false);
  const [itemName, setItemName] = useState("");

  const handleAddItemConfirmClick = () => {
    // console.log(addingViewValue)
    setAddingItem(false);
    setItemName("");
    props.actions.onAddItem && props.actions.onAddItem(props.name, "name", itemName);
  };

  const handleAddItemCancelClick = () => {
    // console.log(addingViewValue)
    setAddingItem(false);
    setItemName("");
  };

  return (
    <Box sx={{ py: 2, px: 2 }}>
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
            onChange={(event) => setItemName(event.target.value)} />
          <Button
            color="secondary"
            size="small"
            sx={{ mt: 1 }}
            disabled={itemName === ""}
            onClick={handleAddItemConfirmClick}>
            Confirm
          </Button>
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={handleAddItemCancelClick}>
            Cancel
          </Button>
        </>
      )}
    </Box>

  );
}

function EditorList({ ...props }) {

  const [openFields, setOpenFields] = useState([]);

  const handleClick = (name) => {
    console.log('EditorList handleClick', name);
    const openFieldIndex = openFields.indexOf(name);
    let currentOpenFields = [...openFields];
    if (openFieldIndex > -1) {
      currentOpenFields.splice(openFieldIndex, 1);
      setOpenFields(currentOpenFields);
    }
    else {
      currentOpenFields = currentOpenFields.filter(x => name.indexOf(x) === 0);
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
    <Grid container spacing={0} sx={{ width: '100%', m: 0 }}>
      <List sx={{ width: '100%', py: 0 }}>
        {childrenWithProps.map(child => <Fragment key={child.key}>
          {child}
          <Divider />
        </Fragment>)}
      </List>
    </Grid>
  );
}

function EditListItem({ ...props }) {
  // console.log('EditListItem', name, data)

  const formMethods = useFormContext();

  const name = props.name;
  const data = props.data;
  const openFields = props.openFields;
  const onClick = props.onClick;

  let primary = data.label ?? data.name ?? name;
  let secondary;
  if (primary === data.label) {
    secondary = data.name;
  }

  const isOpen = openFields?.includes(name) ?? false;

  function handleClick() {
    onClick && onClick(name);
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
          <ListItemText
            primary={primary}
            primaryTypographyProps={{ noWrap: true }}
            secondary={secondary}
            secondaryTypographyProps={{ noWrap: true }}
          />
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

          <EditorControls {...props} name={name} />
        </Stack>
      </Collapse>
    </>
  );
}
