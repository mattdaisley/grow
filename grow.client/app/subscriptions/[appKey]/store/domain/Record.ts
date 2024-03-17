import { ISchema } from './Schema';


export class Record {
  key: string;
  schema: ISchema;
  _record: object;

  constructor(schema: ISchema, key: string, record: object) {
    this.key = key;
    this.schema = schema;
    this._record = record;
  }

  get value(): Object {
    const fields = {};

    Object.entries(this._record).forEach(([fieldKey, record]) => {
      const field = this.schema.fields[fieldKey];

      fields[field.name] = record;
    });

    return fields;
  }
}
