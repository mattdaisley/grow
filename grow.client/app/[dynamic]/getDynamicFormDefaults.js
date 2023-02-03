import { getCollectionFieldsAndDefaults } from "../../services/getCollectionFieldsAndDefaults";
import { getViewFieldValues } from "../../services/getViewFieldValues";

export function getDynamicFormDefaults(props) {
  // console.log(props)
  const allPages = props.allPages.item.pages || [];
  const page = allPages.find(x => x.id === props.pageId);

  let currentPage = {};
  let defaultValues = {};

  if (page !== null) {

    currentPage = fillPage(props, page);
    defaultValues = getPageDefaultValues(currentPage);

    // console.log(currentPage, defaultValues, props.dynamicItem.item)
  }

  const fieldValues = { ...defaultValues, ...props.dynamicItem.item };

  return { currentPage, fieldValues, timestamp: Date.now() };
}

function fillPage(props, page) {
  let currentPage = { ...page };

  const allViews = props.allViews.item.views || [];
  const allFields = props.allFields.item.fields || [];

  currentPage.groups = currentPage?.groups?.map(group => {

    const groupViews = group.views?.map((groupView) => {

      const view = allViews.find(x => x.id === groupView.viewId);
      // console.log(view)
      const viewGroups = view?.groups?.map(group => {

        const groupFields = group.fields?.map((groupField) => {

          const field = allFields.find(x => x.id === groupField.fieldId);

          const filledField = { ...field };
          // console.log(field, groupField)
          if (groupField.conditions) {
            filledField.conditions = [...groupField.conditions];
          }
          // console.log(filledField, field)
          return filledField;
        });
        // console.log(group.fields, groupFields)
        return { ...group, fields: groupFields };
      });

      return {
        ...view, groups: viewGroups
      };
    });

    return {
      ...group, views: groupViews
    };
  });

  return currentPage;
}

export function getPageDefaultValues(currentPage) {
  let defaultValues = {}

  currentPage?.groups?.map(group => {
    if (!!group) {
      switch (group.type) {
        case 'collection-tabs':
        case 'collection-add':
          let collectionDefaults = getCollectionFieldsAndDefaults(group);
          if (defaultValues[collectionDefaults.collectionName] === undefined) {
            defaultValues[collectionDefaults.collectionName] = [collectionDefaults.fieldValues];
          }
          break;

        case 'collection-grid':
          const gridDefaults = getCollectionFieldsAndDefaults(group);
          if (defaultValues[gridDefaults.collectionName] === undefined) {
            defaultValues[gridDefaults.collectionName] = [];
          }
          break;

        default:
          group.views?.map((view, index) => {
            const { viewFieldValues } = getViewFieldValues(view);
            defaultValues = { ...defaultValues, ...viewFieldValues };
          });
          break;
      }
    }
  });

  return defaultValues;
}

