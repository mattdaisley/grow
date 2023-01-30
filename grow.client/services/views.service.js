import { useState, useEffect } from 'react';
import { getFieldDefault } from './getFieldDefault';

const useView = (viewId) => {
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [allFieldsJson, setAllFieldsJson] = useState("");
  const [allFieldsDefinition, setAllFieldsDefinition] = useState();

  const [allViewsJson, setAllViewsJson] = useState("");
  const [allViewsDefinition, setAllViewsDefinition] = useState([]);
  const [allViewsCombined, setAllViewsCombined] = useState([]);

  const [currentViewJson, setCurrentViewJson] = useState("");
  const [currentViewDefinition, setCurrentViewDefinition] = useState();

  const [currentViewFieldDefaults, setCurrentViewFieldDefaults] = useState(undefined);

  useEffect(() => {
    const loadAllFields = () => {
      const localAllFieldsJson = localStorage.getItem('allfields');
      if (localAllFieldsJson && localAllFieldsJson !== allFieldsJson) {
        // console.log('loading new allFieldsJson: ', allFieldsJson, localAllFieldsJson)
        setAllFieldsJson(localAllFieldsJson);
        try {
          var parsedJson = JSON.parse(localAllFieldsJson);
          setAllFieldsDefinition(parsedJson);
          // console.log(parsedJson)
        }
        catch (e) {
          console.log(e);
        }
      }
    }

    loadAllFields()

    const loadInterval = setInterval(loadAllFields, 2000);

    return () => clearInterval(loadInterval);
  }, [allFieldsJson]);

  useEffect(() => {
    const loadView = () => {
      const localAllViewsJson = localStorage.getItem('allviews');
      if (allFieldsJson !== "" && localAllViewsJson && localAllViewsJson !== allViewsJson) {

        setAllViewsJson(localAllViewsJson);
        try {
          var allViews = JSON.parse(localAllViewsJson);
          setAllViewsDefinition(allViews);

          const viewsCombined = allViews?.views.map(viewToCombine => {
            // console.log(viewToCombine)
            const viewGroups = viewToCombine?.groups?.map(group => {
              const groupFields = group.fields?.map((field) => {
                const fieldDefinition = allFieldsDefinition?.fields.find(x => x.id === field.fieldId);

                const combinedField = { ...fieldDefinition }
                if (field.conditions) {
                  combinedField.conditions = [...field.conditions]
                }
                // console.log(field, combinedField)
                return combinedField;
              })
              return { ...group, fields: groupFields };
            })
            return { ...viewGroups }
          })
          // console.log(allViews)
          // console.log(viewsCombined)
          setAllViewsCombined({ views: viewsCombined });

          // console.log(viewId !== undefined);
          if (viewId !== undefined) {
            const currentView = allViews?.views?.find(x => x.id === viewId)
            if (currentView) {
              // console.log(currentView);
              setCurrentViewJson(JSON.stringify(currentView, null, 2));

              currentView?.groups?.map(group => {
                group.fields = group.fields?.map((field) => {
                  const fieldDefinition = allFieldsDefinition?.fields.find(x => x.id === field.fieldId);
                  // console.log(field, fieldDefinition)
                  const combinedField = { ...fieldDefinition }
                  if (field.conditions) {
                    combinedField.conditions = [...field.conditions]
                  }

                  return combinedField;
                })
              })
              // console.log(currentView);
              setCurrentViewDefinition(currentView);
            }
            else {
              const newView = { id: viewId }
              setCurrentViewJson(JSON.stringify(newView, null, 2));
              setCurrentViewDefinition(newView);
            }
          }
        }
        catch (e) {
          console.log(e);
        }
      }
      // setAllViewsLoaded(true)
    }

    loadView(allViewsJson, viewId);

    const loadViewInterval = setInterval(loadView, 2000);

    return () => clearInterval(loadViewInterval);
  }, [allViewsJson, allFieldsJson]);

  useEffect(() => {
    if (allFieldsJson === "" || currentViewJson === "") {
      return;
    }
    // console.log(currentViewJson, currentViewDefinition)
    let fieldValues = {};
    currentViewDefinition?.groups?.map(group => {
      group.fields?.map((fieldDefinition) => {
        if (fieldDefinition) {
          const fieldDefault = getFieldDefault(fieldDefinition)
          fieldValues[fieldDefinition.name] = fieldDefault;
        }
      })
    })
    // reset({ ['testform']: [fieldValues] });
    setCurrentViewFieldDefaults(fieldValues);

  }, [allFieldsJson, currentViewJson])

  const updateCurrentView = (newViewJson) => {
    setCurrentViewJson(newViewJson);

    try {
      var parsedJson = JSON.parse(newViewJson);
      console.log(parsedJson)
      const newGroups = parsedJson.groups?.map(group => {
        const newFields = group.fields?.map((field) => {
          // console.log(field)
          return { fieldId: field.fieldId }
        })

        return group;
      })

      const newView = { ...parsedJson, groups: newGroups }
      // setCurrentViewDefinition(parsedJson);
      console.log(newView);
      const currentViewIndex = allViewsDefinition.views.findIndex(x => x?.id === viewId)
      // console.log(currentViewIndex, parsedJson);
      if (currentViewIndex > -1) {
        allViewsDefinition.views[currentViewIndex] = newView;
      }
      else {
        if (!allViewsDefinition.views) {
          allViewsDefinition.views = []
        }

        allViewsDefinition.views.push(newView);
      }

      const formattedJson = JSON.stringify(allViewsDefinition, null, 2);
      localStorage.setItem('allviews', formattedJson);
      setAllViewsJson(formattedJson)
    }
    catch (e) {
      // console.log(e);
    }
  }

  return {
    currentViewDefinition,
    currentViewJson,
    currentViewFieldDefaults,
    updateCurrentView,

    allViewsJson,
    allViewsDefinition,
    allViewsCombined,

    allFieldsJson,
    allFieldsDefinition
  }
}

export default useView;