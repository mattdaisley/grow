import { useState, useEffect } from 'react';

import usePage from './pages.service';

const useGardens = (gardenId) => {

  const [allGardensJson, setAllGardensJson] = useState("");
  const [allGardensDefinition, setAllGardensDefinition] = useState([]);

  const [currentGardenJson, setCurrentGardenJson] = useState("");
  const [currentGardenDefinition, setCurrentGardenDefinition] = useState();
  const [currentGardenFieldDefaults, setCurrentGardenFieldDefaults] = useState(undefined);

  const {
    allPagesJson,
    allPagesDefinition,

    currentPageDefinition,
    currentPageJson,
    currentPageFieldDefaults,

    allViewsJson,
    allViewsDefinition,

    allFieldsJson,
    allFieldsDefinition
  } = usePage()

  useEffect(() => {
    const loadGardens = () => {
      const localAllGardensJson = localStorage.getItem('allgardens');

      if (allPagesDefinition?.pages !== undefined && allPagesDefinition.pages.length > 0 && localAllGardensJson && localAllGardensJson !== allGardensJson) {

        // console.log(localAllGardensJson, allPagesDefinition);
        setAllGardensJson(localAllGardensJson);
        try {
          var allGardens = JSON.parse(localAllGardensJson);
          setAllGardensDefinition(allGardens);

          // console.log(gardenId, gardenId !== undefined);
          if (gardenId !== undefined) {
            const currentGarden = allGardens?.gardens.find(x => x.id === gardenId)
            // console.log(currentGarden, allGardens.gardens);
            if (currentGarden) {
              setCurrentGardenJson(JSON.stringify(currentGarden, null, 2));

              currentGarden.pages = currentGarden.pages?.map(page => {
                const pageDefinition = allPagesDefinition?.pages.find(x => x.id === page.pageId);
                // console.log(pageDefinition)
                return { ...pageDefinition }
              })
              // console.log(currentGarden)
              setCurrentGardenDefinition(currentGarden);
            }
            else {
              // const newPage = { id: pageId }
              // setCurrentPageJson(JSON.stringify(newPage, null, 2));
              // setCurrentPageDefinition(newPage);
            }
          }
        }
        catch (e) {
          console.log(e);
        }
      }
      // setAllViewsLoaded(true)
    }

    loadGardens(allGardensJson, gardenId);

    const loadGardenInterval = setInterval(loadGardens, 2000);

    return () => clearInterval(loadGardenInterval);
  }, [allGardensJson, JSON.stringify(allPagesDefinition)]);
  // console.log(allFieldsDefinition)

  const updateGarden = (newGardenJson) => {
    setCurrentGardenJson(newGardenJson);

    try {
      var parsedJson = JSON.parse(newGardenJson);
      // console.log(parsedJson)

      // setCurrentViewDefinition(parsedJson);
      // console.log(newView);
      const currentGardenIndex = allGardensDefinition.gardens.findIndex(x => x?.id === gardenId)
      // console.log(currentViewIndex, parsedJson);
      if (currentGardenIndex > -1) {
        allGardensDefinition.gardens[currentGardenIndex] = parsedJson;
      }
      else {
        if (!allGardensDefinition.gardens) {
          allGardensDefinition.gardens = []
        }

        allGardensDefinition.gardens.push(parsedJson);
      }

      localStorage.setItem('allgardens', JSON.stringify(allGardensDefinition));
      setAllGardensJson(JSON.stringify(allGardensDefinition, null, 2))
    }
    catch (e) {
      // console.log(e);
    }
  }

  return {
    allGardensJson,
    allGardensDefinition,
    currentGardenDefinition,
    currentGardenJson,
    currentGardenFieldDefaults,
    updateGarden,

    allPagesJson,
    allPagesDefinition,

    allViewsJson,
    allViewsDefinition,

    allFieldsJson,
    allFieldsDefinition
  }
}

export default useGardens;