import { Record } from './Record';
import { ISchema } from './Schema';

export interface ICollection {
  schema: ISchema;
  records: {
    [key: string]: Object;
  }
}

export class Collection {
  key: string;
  schema: ISchema;
  _records: {
    [key: string]: Object;
  }

  constructor({key, schema, records }) {
    this.key = key;
    this.schema = schema;
    this._records = records;
  }

  get records(): { [key: string]: Record } {
    const recordsMapped = {};

    Object.entries(this._records).forEach(([recordKey, record]) => {
      recordsMapped[recordKey] = new Record(this.schema, recordKey, record);
    });

    return recordsMapped;
  }
}


