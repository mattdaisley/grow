
export const GetFields = () => {

  const allFieldsJson = localStorage.getItem('allfields');
  // console.log(allFieldsJson)

  if (allFieldsJson !== undefined) {
    try {
      var allFields = JSON.parse(allFieldsJson);
      return { allFieldsJson, allFields };
      // console.log(allFields)
    }
    catch (e) {
      console.log(e);
      return undefined;
    }
  }
}