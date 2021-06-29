interface Error {
  error: string;
}

export interface Descriptor<T> {
  // TODO: must be one of the valid http code (use enums or something)
  statusCode: number;
  body: Error | T;
}
