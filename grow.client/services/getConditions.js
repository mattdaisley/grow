'use client';
export function getConditions(fieldDefinition, pageFields) {
  const conditions = { visible: true };
  // console.log(fieldDefinition.conditions)
  fieldDefinition.conditions?.map(condition => {
    const fieldToCompare = pageFields[condition.key];

    // console.log(condition, fieldToCompare)
    switch (condition.type) {
      case 'visibility':
        if (fieldToCompare && condition.comparison === "equals" && fieldToCompare.value !== condition.value) {
          conditions.visible = false;
        }
        break;
    }
  });

  return conditions;
}
