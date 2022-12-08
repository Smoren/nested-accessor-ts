export default class NestedAccessorException extends Error {
  public static CANNOT_GET_VALUE = 1;
  public static CANNOT_SET_VALUE = 2;

  public code: number;
  public data: Record<string, unknown>|null;

  constructor(message: string, code: number, data: Record<string, unknown>|null = null) {
    super(message);
    this.code = code;
    this.data = data;
  }

  public static createAsCannotGetValue(key: string, count: number): NestedAccessorException {
    return new NestedAccessorException(
      `cannot get value by key '${key}'`,
      NestedAccessorException.CANNOT_GET_VALUE,
      { key, count }
    );
  }

  public static createAsCannotSetValue(key: string): NestedAccessorException {
    return new NestedAccessorException(
      `cannot set value by key '${key}'`,
      NestedAccessorException.CANNOT_SET_VALUE,
      { key }
    );
  }
}
