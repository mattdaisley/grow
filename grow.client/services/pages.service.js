import { useState, useEffect } from 'react';
import { getFieldDefault } from '../components/getFieldDefault';

import useView from './views.service';

const usePages = (pageId) => {
  const [allPagesJson, setAllPagesJson] = useState("");
  const [allPagesDefinition, setAllPagesDefinition] = useState([]);

  const [currentPageId, setCurrentPageId] = useState();
  const [currentPageJson, setCurrentPageJson] = useState("");
  const [currentPageDefinition, setCurrentPageDefinition] = useState();
  const [currentPageFieldDefaults, setCurrentPageFieldDefaults] = useState(undefined);

  const {
    allViewsJson,
    allViewsDefinition,

    allFieldsJson,
    allFieldsDefinition
  } = useView()

  useEffect(() => {
    const loadPages = () => {
      const localAllPagesJson = localStorage.getItem('allpages');
      // console.log(localAllPagesJson, allFieldsDefinition);
      if (allFieldsDefinition !== undefined && allViewsJson !== "") {

        try {
          if (localAllPagesJson && localAllPagesJson !== allPagesJson) {
            var allPages = JSON.parse(localAllPagesJson);
            setAllPagesDefinition(allPages);
            setAllPagesJson(localAllPagesJson);
          }

          // console.log(pageId, pageId !== undefined, currentPageId);
          if (pageId !== undefined && pageId !== currentPageId) {
            setCurrentPageId(pageId);
          }
        }
        catch (e) {
          console.log(e);
        }
      }
      // setAllViewsLoaded(true)
    }

    loadPages(allPagesJson, pageId);

    let loadPageInterval
    if (pageId !== currentPageId) {
      clearInterval(loadPageInterval)
      loadPageInterval = setInterval(loadPages, 2000);
    }

    return () => { if (loadPageInterval !== undefined) clearInterval(loadPageInterval); }
  }, [allPagesJson, allViewsJson, JSON.stringify(allFieldsDefinition), pageId, currentPageId]);
  // console.log(allFieldsDefinition)

  useEffect(() => {
    if (allPagesDefinition?.pages === undefined || allPagesDefinition.pages.length === 0) {
      return;
    }

    const currentPage = allPagesDefinition?.pages.find(x => x.id === currentPageId)
    if (currentPage) {
      // console.log(currentPage);
      setCurrentPageJson(JSON.stringify(currentPage, null, 2));

      currentPage?.groups?.map(group => {
        group.views = group.views?.map((view) => {

          const viewDefinition = allViewsDefinition?.views.find(x => x.id === view.viewId);
          // console.log(viewDefinition, allFieldsDefinition)
          const filledGroups = viewDefinition?.groups?.map(group => {
            const filledFields = group.fields?.map((field) => {
              const fieldDefinition = allFieldsDefinition?.fields.find(x => x.id === field.fieldId);
              return fieldDefinition;
            })
            // console.log(group.fields, filledFields)
            return { ...group, fields: filledFields }
          })
          return {
            ...viewDefinition, groups: filledGroups
          };
        })
      })
      // console.log(currentPage)
      setCurrentPageDefinition(currentPage);
    }
    else {
      const newPage = { id: currentPageId }
      setCurrentPageJson(JSON.stringify(newPage, null, 2));
      setCurrentPageDefinition(newPage);
    }
  }, [currentPageId])


  useEffect(() => {
    if (allFieldsJson === "" || allViewsJson === "" || currentPageJson === "") {
      return;
    }
    // console.log(currentPageJson, currentPageDefinition)
    let fieldValues = {};
    currentPageDefinition?.groups?.map(group => {
      group?.views?.map(view => {
        view?.groups?.map(group => {
          group.fields?.map((fieldDefinition) => {
            if (fieldDefinition) {
              const { key, defaultValue } = getFieldDefault(fieldDefinition)
              fieldValues[key] = defaultValue;
            }
          })
        })
      })
    })
    // reset({ ['testform']: [fieldValues] });
    setCurrentPageFieldDefaults(fieldValues);

  }, [allFieldsJson, allViewsJson, currentPageJson])

  const updatePage = (newPageJson) => {
    setCurrentPageJson(newPageJson);

    try {
      var parsedJson = JSON.parse(newPageJson);
      // console.log(parsedJson)
      const newGroups = parsedJson.groups?.map(group => {
        const newViews = group.views?.map((view) => {
          // console.log(view)
          return { viewId: view.viewId }
        })

        return { ...group, views: newViews }
      })

      const newPage = { ...parsedJson, groups: newGroups }
      // setCurrentViewDefinition(parsedJson);
      // console.log(newView);
      const currentPageIndex = allPagesDefinition.pages.findIndex(x => x?.id === pageId)
      // console.log(currentViewIndex, parsedJson);
      if (currentPageIndex > -1) {
        allPagesDefinition.pages[currentPageIndex] = newPage;
      }
      else {
        if (!allPagesDefinition.pages) {
          allPagesDefinition.pages = []
        }

        allPagesDefinition.pages.push(newPage);
      }

      localStorage.setItem('allpages', JSON.stringify(allPagesDefinition));
      setAllPagesJson(JSON.stringify(allPagesDefinition, null, 2))
    }
    catch (e) {
      // console.log(e);
    }
  }

  return {
    allPagesJson,
    allPagesDefinition,

    currentPageDefinition,
    currentPageJson,
    currentPageFieldDefaults,
    updatePage,

    allViewsJson,
    allViewsDefinition,

    allFieldsJson,
    allFieldsDefinition
  }
}

export default usePages;