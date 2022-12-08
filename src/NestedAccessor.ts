import NestedAccessorException from './NestedAccessorException';

type SourceType = Record<string, unknown>;
type NestedAccessibleType = Array<unknown>|Record<string, unknown>|null;

interface CounterInterface {
    count: number;
}

class Counter implements CounterInterface {
    count: number = 0;
}

interface ResultWrapperInterface {
    wrapped: unknown;
}

class ResultWrapper implements ResultWrapperInterface {
    wrapped: unknown;
    constructor(wrapped: unknown) {
        this.wrapped = wrapped;
    }
}

export interface NestedAccessorInterface {
    get(path: string[]|string|null, strict: boolean): unknown;
    set(path: string[]|string|null, value: unknown, strict: boolean): void
}

export class NestedAccessor implements NestedAccessorInterface
{
    protected source: SourceType;
    protected pathDelimiter: string;

    constructor(source: SourceType, pathDelimiter: string = '.') {
        if(source === null) {
            source = {};
        }
        this.source = source;
        this.pathDelimiter = pathDelimiter;
    }

    public get(path: string[]|string|null = null, strict: boolean = true): unknown {
        // when path is not specified
        if(path === null || path === '') {
            // let's return the full source
            return this.source;
        }

        if(!(path instanceof Array)) {
            path = path.split(this.pathDelimiter);
        }

        // let result be null and there are no errors by default
        const result = new ResultWrapper(null);
        const errorsCount = new Counter();

        // getting result with internal recursive method
        this._get(
          this.source,
          [...path].reverse(), // path stack
          result,
          errorsCount
        );

        // when strict mode is on and we got errors
        if(strict && errorsCount.count) {
            throw NestedAccessorException.createAsCannotGetValue(path.join(this.pathDelimiter), errorsCount.count);
        }

        return result.wrapped;
    }

    public set(path: string[]|string|null, value: unknown, strict: boolean = true): void {
        if(path === null) {
            path = [];
        } else if(!(path instanceof Array)) {
            path = path.split(this.pathDelimiter);
        }
        this._set(this.source, path, value, strict);
    }

    protected _get(
      source: NestedAccessibleType,
      path: string[],
      result: ResultWrapperInterface,
      errors: CounterInterface
    ): void {
        // let's iterate every path part from stack
        while(path.length) {
            if(source instanceof Array) {
                // the result will be multiple
                if(!(result.wrapped instanceof Array)) {
                    result.wrapped = [];
                }
                // and we need to use recursive call for each item of this array
                for(const item of source) {
                    this._get(item as NestedAccessibleType, [...path], result, errors);
                }
                // we don't need to do something in this recursive branch
                return;
            }

            const key = path.pop() as string;

            if(typeof source === 'object' && source !== null) {
                if(source.hasOwnProperty(key)) {
                    // go to the next nested level
                    source = source[key] as NestedAccessibleType;
                } else {
                    // path part key is missing in source object
                    errors.count++;
                    // we cannot go deeper
                    return;
                }
            } else {
                // source is scalar, so we can't go to the next depth level
                errors.count++;
                // we cannot go deeper
                return;
            }
        }

        // now path stack is empty — we reached target value of given path in source argument
        // so if result is multiple
        if(result.wrapped instanceof Array) {
            // we append source to result
            result.wrapped.push(source);
        } else {
            // result is single
            result.wrapped = source;
        }
        // that's all folks!
    }

    protected _set(source: SourceType, path: string[], value: unknown, strict: boolean = false): void {
        const pathStack = [...path].reverse();
        while (true) {
            const key = pathStack.pop() as string;

            if (!pathStack.length) {
                source[key] = value;
                return;
            }

            if (
              !source.hasOwnProperty(key)
              || source[key] === null
              || typeof source[key] !== 'object'
              || source[key] instanceof Array
            ) {
                if (strict) {
                    throw NestedAccessorException.createAsCannotSetValue(path.join(this.pathDelimiter))
                }

                source[key] = {};
            }

            source = source[key] as SourceType;
        }
    }
}
