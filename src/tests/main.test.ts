import NestedAccessorException from '../NestedAccessorException';
import { NestedAccessor } from '../NestedAccessor';

function fail(reason = "fail was called in a test.") {
  throw new Error(reason);
}

test('Simple test', () => {
  const input = {
    countries: [
      {
        name: 'Russia',
        cities: [
          {name: 'Moscow'},
          {name: 'St. Petersburg'},
        ]
      },
      {
        name: 'Belarus',
        cities: [
          {name: 'Minsk'},
        ]
      },
      {
        name: 'Ukraine',
        cities: [
          {name: 'Kiev'},
        ]
      },
    ],
    test: {
      a: {
        b: 3
      }
    }
  };

  const accessor = new NestedAccessor(input);

  expect(accessor.get('countries.cities.name')).toStrictEqual([
    'Moscow',
    'St. Petersburg',
    'Minsk',
    'Kiev',
  ]);

  expect(accessor.get('countries.name')).toStrictEqual([
    'Russia',
    'Belarus',
    'Ukraine',
  ]);

  expect(accessor.get('test.a.b')).toBe(3);

  accessor.set('test.a.c', [1, 2, 3]);
  expect(accessor.get('test.a.c')).toStrictEqual([1, 2, 3]);
});

test('Simple read', () => {
  const input = {
    "id": 100,
    "name": "Novgorod",
    "status": null,
    "country":
      {
        "id": 10,
        "name": "Russia",
        "friends": ["Kazakhstan", "Belarus", "Armenia"],
        "capitals":
          {
            "msk": "Moscow",
            "spb": "St. Petersburg"
          }
      },
    "streets": [
      {
        "id": 1000,
        "name": "Tverskaya",
        "houses": [1, 5, 9]
      },
      {
        "id": 1002,
        "name": "Leninskiy",
        "houses": [22, 35, 49]
      },
      {
        "id": 1003,
        "name": "Tarusskaya",
        "houses": [11, 12, 15],
        "unknown": "some value"
      }],
    "msk_path": "country.capitals.msk"
  };

  const accessor = new NestedAccessor(input);

  expect(accessor.get('name')).toBe('Novgorod');
  expect(accessor.get(['name'])).toBe('Novgorod');
  expect(accessor.get('name', true)).toBe('Novgorod');
  expect(accessor.get('name', false)).toBe('Novgorod');

  expect(accessor.get('name1', false)).toBe(null);

  try {
    accessor.get('name1', true);
    fail();
  } catch (e) {
    const error = e as NestedAccessorException;
    expect(error.code).toBe(NestedAccessorException.CANNOT_GET_VALUE);
    expect(error.data?.key).toBe('name1');
    expect(error.data?.count).toBe(1);
  }

  try {
    accessor.get('name1');
    fail();
  } catch (e) {
    const error = e as NestedAccessorException;
    expect(error.code).toBe(NestedAccessorException.CANNOT_GET_VALUE);
    expect(error.data?.key).toBe('name1');
    expect(error.data?.count).toBe(1);
  }

  try {
    accessor.get('name1', true);
    fail();
  } catch (e) {
    const error = e as NestedAccessorException;
    expect(error.code).toBe(NestedAccessorException.CANNOT_GET_VALUE);
    expect(error.data?.key).toBe('name1');
    expect(error.data?.count).toBe(1);
  }

  expect(accessor.get('status')).toBe(null);
  expect(accessor.get('status', true)).toBe(null);
  expect(accessor.get('status', false)).toBe(null);

  expect(accessor.get('country.capitals.msk')).toBe('Moscow');
  expect(accessor.get(['country', 'capitals', 'msk'])).toBe('Moscow');
  expect(accessor.get('country.capitals.msk1', false)).toBe(null);

  try {
    accessor.get('country.capitals.msk1');
    fail();
  } catch (e) {
    const error = e as NestedAccessorException;
    expect(error.code).toBe(NestedAccessorException.CANNOT_GET_VALUE);
    expect(error.data?.key).toBe('country.capitals.msk1');
    expect(error.data?.count).toBe(1);
  }
});

test('Read with flattening', () => {
  {
    const input = {
      "countries": [
        {
          "name": "Russia",
          "cities": [
            {
              "name": "Moscow",
              "extra": {
                "codes": [
                  {"value": 7495},
                  {"value": 7499}
                ],
              },
            },
            {
              "name": "Petersburg",
              "extra": {
                "codes": [
                  {"value": 7812},
                ],
              },
            }
          ],
        },
        {
          "name": "Belarus",
          "cities": [
            {
              "name": "Minsk",
              "extra": {
                "codes": [
                  {"value": 375017},
                ],
              },
            }
          ],
        }
      ],
    };

    const accessor = new NestedAccessor(input);
    expect(accessor.get('countries.name')).toStrictEqual(['Russia', 'Belarus']);
    expect(accessor.get('countries.cities.name')).toStrictEqual(['Moscow', 'Petersburg', 'Minsk']);
    expect(accessor.get('countries.cities.extra.codes.value')).toStrictEqual([7495, 7499, 7812, 375017]);
  }

  {
    const input = {
      "countries": [
        {
          "name": "Russia",
          "cities": [
            {
              "name": "Moscow",
              "extra": {
                "codes": [7495, 7499],
              },
            },
            {
              "name": "Petersburg",
              "extra": {
                "codes": [7812],
              },
            }
          ],
        },
        {
          "name": "Belarus",
          "cities": [
            {
              "name": "Minsk",
              "extra": {
                "codes": [375017],
              },
            }
          ],
        }
      ],
    };

    const accessor = new NestedAccessor(input);
    expect(accessor.get('countries.cities.extra.codes')).toStrictEqual([[7495, 7499], [7812], [375017]]);
  }

  {
    const input = {
      "countries": [{
        "name": "Russia",
        "cities": [{
          "name": "Moscow"
        },
          {
            "name": "Petersburg",
            "extra": {
              "codes": [{
                "value": 7812
              }]
            }
          }
        ]
      },
        {
          "name": "Belarus"
        },
        {
          "name": "Kazakhstan",
          "cities": {
            "extra": {
              "codes": {
                "value": 123
              }
            }
          }
        },
        {
          "name": "Armenia",
          "cities": {
            "extra": {
              "codes": 999
            }
          }
        },
        {
          "name": "Serbia",
          "cities": {
            "extra": {
              "codes": []
            }
          }
        }
      ]
    };

    const accessor = new NestedAccessor(input);

    expect(accessor.get('countries.cities.extra.codes.value', false)).toStrictEqual([7812, 123]);

    try {
      accessor.get('countries.cities.extra.codes.value');
      fail();
    } catch (e) {
      const error = e as NestedAccessorException;
      expect(error.code).toBe(NestedAccessorException.CANNOT_GET_VALUE);
      expect(error.data?.key).toBe('countries.cities.extra.codes.value');
      expect(error.data?.count).toBe(3);
    }
  }
});

test('Simple write', () => {
  {
    const accessor = new NestedAccessor({});
    accessor.set('test.a.a', 1, false);
    expect(accessor.get()).toStrictEqual({test: {a: {a: 1}}});
    expect(accessor.get('')).toStrictEqual({test: {a: {a: 1}}});
    expect(accessor.get(null)).toStrictEqual({test: {a: {a: 1}}});

    accessor.set('test.a.b', 2);
    accessor.set('test.b.a', 3, false);
    expect(accessor.get('test.a')).toStrictEqual({a: 1, b: 2});
    expect(accessor.get('test.b')).toStrictEqual({a: 3});

    accessor.set('test.b.a', 33);
    expect(accessor.get('test.b')).toStrictEqual({a: 33});

    accessor.set('test.b.c', {d: 'e'});
    expect(accessor.get('test.b.c.d')).toBe('e');

    accessor.set('test.b', 0);
    expect(accessor.get('test.b')).toStrictEqual(0);
    expect(accessor.get('test.b.c.d', false)).toBeNull();

    try {
      accessor.set('test.b.c', 123, true);
      fail();
    } catch (e) {
      const error = e as NestedAccessorException;
      expect(error.code).toBe(NestedAccessorException.CANNOT_SET_VALUE);
      expect(error.data?.key).toBe('test.b.c');
    }

    accessor.set('test.b.c', {'d': 'e'}, false);
    expect(accessor.get('test.b.c', false)).toStrictEqual({'d': 'e'});

    expect(accessor.get('test.b.c.d')).toBe('e');

    accessor.set('test.b.c.f', 123);
    expect(accessor.get('test.b.c.f')).toBe(123);
    expect(accessor.get('test.a')).toStrictEqual({a: 1, b: 2});
  }

  {
    const input = {a: 1};
    const accessor = new NestedAccessor(input);
    expect(accessor.get('a')).toBe(1);
    expect(accessor.get()).toStrictEqual({a: 1});
    expect(accessor.get('')).toStrictEqual({a: 1});

    accessor.set('a.b', 22, false);
    expect(accessor.get('a')).toStrictEqual({b: 22});

    accessor.set('c', 33);
    expect(accessor.get()).toStrictEqual({a: {b: 22}, c: 33});
  }
});
