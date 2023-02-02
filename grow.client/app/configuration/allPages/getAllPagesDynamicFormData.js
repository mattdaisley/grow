'use client';

import { getFieldValues } from '../../../services/getFieldValues';

export function getAllPagesDynamicFormData(item) {

  const fields = getFieldValues(item.fields);
  // console.log(fields)
  const dynamicFormData = {
    currentPage: {
      name: "All Fields",
      groups: [
        {
          id: 0,
          views: [
            {
              id: 0,
              groups: [
                {
                  id: 0,
                  fields: [...fields.viewFields]
                }
              ]
            }
          ]
        }
      ]
    },
    fieldValues: { ...fields.viewFieldValues },
    timestamp: Date.now()
  };

  return dynamicFormData;
}
