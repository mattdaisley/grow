export const constants = []

export const itemTypes = ['pages', 'sections', 'views', 'groups', 'fields'];

export const fieldTypes = [{ value: '0', label: 'textfield' }, { value: '1', label: 'autocomplete' }, { value: '2', label: 'systemdate' }]

export const fieldOptionsTypes = [{ value: '0', label: 'collection' }, { value: '1', label: 'list' }]

export const collectionSources = [{ value: '0', label: 'current-context' }, { value: '1', label: 'external' }]

export const externalCollectionSources = [{ value: '0', label: 'gpio' }]

export const collectionTypes = [
  { value: '0', label: 'collection-tabs' },
  { value: '1', label: 'collection-grid' },
  { value: '2', label: 'collection-add' },
  { value: '3', label: 'collection-chart' },
  { value: '4', label: 'collection-chess' },
]