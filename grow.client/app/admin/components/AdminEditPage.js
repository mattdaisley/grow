'use client';

import { Children, cloneElement, Fragment, isValidElement, useState, useEffect } from "react";
import { FormProvider, useForm, Controller, useFormContext, useFieldArray } from "react-hook-form";

import AddIcon from '@mui/icons-material/Add';
import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import TextFormControl from "./TextFormControl";
import AutocompleteFormControl from "./AutocompleteFormControl";
import logger from "../../../../grow.api/src/logger";

export function AdminEditPage(props) {
  logger.log('AdminEditPage top render', props)
  return (
    <>
      <DynamicAppBar dynamicItem={props.dynamicItem} dynamicFormData={props.dynamicFormData} />
      <DynamicForm {...props}>
        <DynamicFields {...props} name={'editor'} data={props.dynamicFormData.data} />
        <DynamicFieldsEditor {...props} data={props.dynamicFormData.data} json={props.dynamicFormData.json} />
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

function DynamicForm({ children, ...props }) {
  const dynamicFormData = props.dynamicFormData;

  const formMethods = useForm();
  // const fields = formMethods.watch();

  // useEffect(() => {
  //   logger.log('DynamicForm formstate fields', fields, props);
  //   props.actions.setItems && props.actions.setItems(fields);
  // }, [JSON.stringify(fields)]);
  // logger.log('DynamicForm form fields:', fields)

  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      const newChild = cloneElement(child, { ...props, formMethods });
      return newChild
    }
    return child;
  });

  return (
    <form onSubmit={formMethods.handleSubmit(props.onSubmit)}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 } }}>
        <Grid container xs={12} spacing={0}>
          <Grid container xs={12} spacing={0}>
            {...childrenWithProps}
          </Grid>
        </Grid>
      </Box>
    </form>
  );
}

function DynamicFields(props) {
  logger.log('DynamicFields', props)
  return (
    <Grid xs={8}>
      <Grid container spacing={4} sx={{ width: '100%' }}>
        <ShowControls {...props} />
      </Grid>
    </Grid>
  );
}

function ShowControls(props) {
  logger.log('ShowControls', props)

  let namePrefix = "";
  if (props.name !== undefined) {
    namePrefix = `${props.name}.`;
  }

  const getShowControl = () => {
    const pagesKey = 'pages'
    if (props.data.hasOwnProperty(pagesKey)) {
      return { key: pagesKey, ShowControl: ShowPages }
    }

    const sectionsKey = 'sections'
    if (props.data.hasOwnProperty(sectionsKey)) {
      return { key: sectionsKey, ShowControl: ShowSections }
    }

    const viewsKey = 'views'
    if (props.data.hasOwnProperty(viewsKey)) {
      return { key: viewsKey, ShowControl: ShowViews }
    }

    const groupsKey = 'groups'
    if (props.data.hasOwnProperty(groupsKey)) {
      return { key: groupsKey, ShowControl: ShowGroups }
    }

    const fieldsKey = 'fields'
    if (props.data.hasOwnProperty(fieldsKey)) {
      return { key: fieldsKey, ShowControl: ShowFields }
    }

    return { key: null, ShowControl: null };
  }

  const { key, ShowControl } = getShowControl();
  if (ShowControl === null) {
    return null;
  }

  return <ShowControl {...props} name={`${namePrefix}${key}`} data={{ ...props.data[key] }} />;
}

function ShowPages({ name, ...props }) {
  logger.log('ShowPages', name, props);
  return (
    <>
      {Object.keys(props.data).map(key => {
        const controlData = props.data[key]

        return (
          <Fragment key={key}>
            {
              controlData?.label && (
                <Grid xs={12} sx={{ mb: -1 }}>
                  <Typography variant="h5" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>{controlData.label}</Typography>
                </Grid>
              )
            }
            <ShowControls {...props} name={`${name}.${key}`} data={controlData} />
          </Fragment>
        )
      })}
    </>
  );

}

function ShowSections({ name, ...props }) {
  logger.log('ShowSections', name, props);
  return (
    <>
      {Object.keys(props.data).map(key => {
        const controlData = props.data[key]
        return (
          <Grid key={key} xs={Number(controlData.width) || 12} alignContent={'flex-start'}>
            <Paper sx={{ width: '100%' }}>
              <Grid container spacing={1} xs={12} sx={{ p: 1 }}>
                <ShowControls {...props} name={`${name}.${key}`} data={controlData} />
              </Grid>
            </Paper>
          </Grid>
        )
      })}
    </>
  );
}

function ShowViews({ name, ...props }) {
  logger.log('ShowViews', name, props);

  const nameSplit = name.split('.');

  return (
    <>
      {Object.keys(props.data).map(key => {
        let controlName = `${name}.${key}`;
        let controlData = props.data[key];
        let view;

        if (nameSplit[1] === 'pages') {
          controlName = `${nameSplit[0]}.views.${props.data[key].id}`;
          controlData = props.allViews[props.data[key].id];
        }
        return (
          <Fragment key={key}>
            {controlData?.label && (
              <Grid xs={12}>
                <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>{controlData.label}</Typography>
              </Grid>
            )}
            <ShowControls {...props} name={controlName} data={controlData} />
          </Fragment>
        );
      })}
    </>
  );
}

function ShowGroups({ name, ...props }) {
  logger.log('ShowGroups', name, props);
  return (
    <>
      {Object.keys(props.data).map(key => {
        const controlData = props.data[key]
        return (
          <Grid xs={Number(controlData?.width) ?? 12} key={key}>
            <ShowControls {...props} key={key} name={`${name}.${key}`} data={controlData} />
          </Grid>
        )
      })}
    </>
  );
}

function ShowFields({ name, ...props }) {
  logger.log('ShowFields', name, props);

  const nameSplit = name.split('.');

  return (
    <>
      <FieldsContainer context={nameSplit[1]}>
        {Object.keys(props.data).map(key => {
          let controlData = props.data[key];

          if (nameSplit[1] === 'views') {
            controlData = props.allFields[props.data[key].id];
          }

          return (
            <FieldWrapper key={key}>
              <DynamicFieldControl {...props} name={`${name}.${key}`} data={controlData} />
            </FieldWrapper>
          )
        })}
      </FieldsContainer>
    </>
  );
}

function FieldsContainer(props) {
  if (props.context !== 'views') {
    return (
      <Grid xs={12} alignContent={'flex-start'}>
        <Paper sx={{ width: '100%' }}>
          <Grid container spacing={1} xs={12} sx={{ p: 1, flexDirection: 'column' }}>
            {props.children}
          </Grid>
        </Paper>
      </Grid>
    )
  }

  return (
    <>{props.children}</>
  )
}

const FieldWrapper = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  boxSizing: 'border-box',
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

function DynamicFieldControl({ ...props }) {
  logger.log('DynamicFieldControl', props)

  const getFieldControl = () => {
    switch (props.data.type) {
      case 'text':
      case 'numeric':
        return TextFormControl;
      case 'autocomplete':
        return AutocompleteFormControl;
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

  return <FieldControl name={`${props.name}.${props.data.name}`} {...props} />;

}

function DynamicFieldsEditor({ ...props }) {

  const [editMode, setEditMode] = useState('editor');

  return (
    <Grid xs={4}>
      <Box sx={{ flexGrow: 1, pr: { xs: 2, md: 4 }, mt: -.5 }}>
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
    </Grid>
  );
}

function EditorControls({ ...props }) {
  logger.log('EditorControls', props);

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
  logger.log('addMissingNestedElements', props)
  if (props.actions.onAddItems === undefined) {
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
  logger.log('EditControls', props);

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
  logger.log('EditPages', name, props);

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
  logger.log('EditSections', name, props);

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditListItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }}>
              <EditWidthProperty />
            </EditListItem>
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Section" actions={props.actions} />
    </>
  );
}

function EditViews({ name, ...props }) {
  logger.log('EditViews', name, props);

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
  logger.log('EditGroups', name, props);

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          return (
            <EditListItem key={key} {...props} name={`${name}.${key}`} data={{ ...props.data[key] }}>
              <EditWidthProperty />
            </EditListItem>
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Group" actions={props.actions} />
    </>
  );
}

function EditFields({ name, ...props }) {
  logger.log('EditFields', name, props);

  let existingItems = undefined;

  const nameSplit = name.split('.');
  if (nameSplit[0] === 'views') {
    existingItems = props.allFields;
  }

  return (
    <>
      <EditorList>
        {Object.keys(props.data).map(key => {
          let listItemName = `${name}.${key}`;
          let listItemData = props.data[key];

          if (nameSplit[0] === 'views') {
            listItemName = `fields.${props.data[key].id}`;
            listItemData = props.allFields[props.data[key].id];
          }

          return (
            <EditListItem key={key} {...props} name={listItemName} data={listItemData}>
              <EditFieldTypeProperty />
              {
                listItemData.type === 'autocomplete' && (
                  <EditAutocompleteOptionsProperty />
                )
              }
            </EditListItem>
          );
        })}
      </EditorList>
      <AddItemControl name={name} type="Field" actions={props.actions} existingItems={props.allFields} />
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
    logger.log('AddExistingItemControl handleAddItemConfirmClick', props.name, itemValue)
    setAddingItem(false);
    setItemValue({ value: null, label: "" });
    props.actions.onAddItems && props.actions.onAddItems([
      { prefix: props.name, suffix: "id", value: itemValue.value }
    ]);
  };

  const handleAddItemCancelClick = () => {
    // logger.log('AddExistingItemControl handleAddItemCancelClick', props.name, itemValue)
    setAddingItem(false);
    setItemValue({ value: null, label: "" });
  };

  const handleItemValueChange = (_, newValue) => {
    // logger.log('AddExistingItemControl handleItemValueChange', newValue)
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
            isOptionEqualToValue={(option, testValue) => option?.value === testValue}
            renderInput={(params) => (
              <TextField
                {...params}
                label={props.type}
                onChange={handleItemTextChange}
              />
            )
            }
          // renderOption={(params) => { logger.log(params); return <li key={params.id}>{params.key}</li> }}
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
    // logger.log(addingViewValue)
    setAddingItem(false);
    setItemName("");
    props.actions.onAddItems && props.actions.onAddItems([
      { prefix: props.name, suffix: "name", value: itemName }
    ]);
  };

  const handleAddItemCancelClick = () => {
    // logger.log(addingViewValue)
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
    logger.log('EditorList handleClick', name);
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

function EditListItem({ children, ...props }) {
  logger.log('EditListItem', props)

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

  const childrenWithProps = Children.map(children, child => {
    // Checking isValidElement is the safe way and avoids a
    // typescript error too.
    if (isValidElement(child)) {
      return cloneElement(child, { ...props });
    }
    return child;
  });

  return (
    <>
      <Collapse in={!isOpen} timeout="auto">
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
      </Collapse>

      <Collapse in={isOpen} timeout="auto">
        <ListItem
          key={name}
          sx={{ height: '55px' }}
          secondaryAction={(
            <ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={handleClick}>
              <ExpandLess />
            </ListItemIcon>
          )}>
          <Controller
            name={`${name}.label`}
            control={props.formMethods.control}
            defaultValue={data.label ?? primary}
            render={({ field }) => {
              // logger.log('EditListItem label field', field, data, primary);
              return (
                <TextField
                  label="label"
                  variant="standard"
                  size="small"
                  sx={{ fontSize: 'small' }}
                  fullWidth
                  placeholder={primary}
                  {...field}
                  onChange={props.actions.onFieldChange(`${name}.label`, field.onChange)}
                />
              )
            }} />
        </ListItem>
        <Stack spacing={2} sx={{ px: 2, py: 2 }}>

          <EditNameProperty {...props} />

          {childrenWithProps}

          <EditorControls {...props} name={name} />
        </Stack>
      </Collapse>
    </>
  );
}

function EditNameProperty(props) {
  // logger.log('EditNameProperty', props)
  return (
    <Controller
      name={`${props.name}.name`}
      control={props.formMethods.control}
      defaultValue={props.data.name ?? ""}
      render={({ field }) => {
        // logger.log(fieldArrayName, appField, field);
        return (
          <TextField
            label="name"
            size="small"
            fullWidth
            {...field}
            onChange={props.actions.onFieldChange(`${props.name}.name`, field.onChange)}
          />
        )
      }} />
  )
}

function EditFieldTypeProperty(props) {
  // logger.log('EditFieldTypeProperty', props)
  return (
    <Controller
      name={`${props.name}.type`}
      control={props.formMethods.control}
      defaultValue={props.data.type ?? null}
      render={({ field: { value, onChange } }) => {

        return (
          <Autocomplete
            label="type"
            autoComplete
            autoSelect
            autoHighlight
            fullWidth
            size="small"
            options={["autocomplete", "select", "text", "numeric", "checkbox", "label"]}
            value={value}
            onChange={props.actions.onFieldChange(`${props.name}.type`, (_, newValue) => onChange(newValue))}
            isOptionEqualToValue={(option, testValue) => option === testValue}
            renderInput={(params) => <TextField {...params} label="type" />} />
        );
      }} />
  )
}

function EditWidthProperty(props) {
  // logger.log('EditWidthProperty', props)
  return (
    <Controller
      name={`${props.name}.width`}
      control={props.formMethods.control}
      defaultValue={props.data.width ?? "12"}
      render={({ field }) => {
        // logger.log(fieldArrayName, appField, field);
        return (
          <TextField
            label="width"
            size="small"
            fullWidth
            {...field}
            onChange={props.actions.onFieldChange(`${props.name}.width`, field.onChange)}
          />
        )
      }} />
  )
}


function EditAutocompleteOptionsProperty(props) {

  logger.log('EditAutocompleteOptionsProperty', props)

  const [deletedItems, setDeletedItems] = useState({});

  function handleAddOptionClick() {
    logger.log('EditAutocompleteOptionsProperty.handleAddOptionClick')

    // const deletedItems = {
    //   [`${props.name}.options.${key}.label`]: {},
    //   [`${props.name}.options.${key}.value`]: {}
    // }

    props.actions.onAddItems && props.actions.onAddItems([
      { prefix: `${props.name}.options`, suffix: "label", value: "" }
    ]);
    // append({ label: "", value: uuidv4() })
  }

  function handleRemoveOptionClick(controllerName) {
    logger.log('EditAutocompleteOptionsProperty.handleRemoveOptionClick', controllerName)
    const itemsToDelete = {
      [controllerName]: {}
    }
    props.actions.onDeleteItems && props.actions.onDeleteItems(itemsToDelete)
    setDeletedItems({ ...deletedItems, [controllerName]: {} })
  }

  let optionsMap = {}
  Object.keys(props.data.options ?? []).map(key => {
    optionsMap[key] = props.data.options[key];
  })
  // options.map((value, index) => {
  //   optionsMap[index] = { ...value, ...optionsMap[index] }
  // })
  useEffect(() => {
    let newDeletedItems = {}
    let itemsUnregistered = false;

    logger.log('EditAutocompleteOptionsProperty unregister', deletedItems, props.data.options)
    Object.keys(deletedItems).forEach(key => {
      if (!props.data.options.hasOwnProperty(key)) {
        logger.log('EditAutocompleteOptionsProperty formstate unregister', key)
        props.formMethods.unregister(key);
        itemsUnregistered = true;
      }
      else {
        newDeletedItems[key] = {}
      }
    })

    if (itemsUnregistered) {
      setDeletedItems(newDeletedItems);
    }
  }, [deletedItems, JSON.stringify(props.data.options)])

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: -2 }}>
        <Typography>Options</Typography>
        <IconButton onClick={handleAddOptionClick}>
          <AddIcon fontSize='small' />
        </IconButton>
      </Box>
      {
        Object.keys(optionsMap).map(key => {
          const option = optionsMap[key]
          logger.log('EditAutocompleteOptionsProperty option:', key, option)
          const controllerName = `${props.name}.options.${key}.label`;
          return (
            <Box
              key={key}
              sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Controller
                  control={props.formMethods.control}
                  name={controllerName}
                  defaultValue={option.label ?? ""}
                  style={{ flex: 1 }}
                  render={({ field }) => {
                    // logger.log('EditAutocompleteOptionsProperty label field', field)
                    return (
                      <TextField
                        size="small"
                        {...field}
                        onChange={props.actions.onFieldChange(controllerName, field.onChange)}
                      />
                    )
                  }} />
              </Box>
              <IconButton onClick={() => handleRemoveOptionClick(controllerName)}>
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Box>
          )
        })
      }
    </>
  );
}

function ListEditAutocompleteOptions(props) {

}

/*
"options": [
  {
    "label": "None",
    "value": ""
  },
  {
    "label": "option 1",
    "value": 0
  },
  {
    "label": "option 2",
    "value": 1
  }
]
*/