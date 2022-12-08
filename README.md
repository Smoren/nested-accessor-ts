# nested-accessor

Accessor for getting and setting values of nested data structures (arrays or objects).

### Unit testing
```
npm i
npm run test
```

### Usage

#### NestedAccessor

```ts

const source = {
  "data": {
    "id": 1,
    "name": "Countries classifier"
  },
  "countries": [{
    "name": "Russia",
    "cities": [{
      "name": "Moscow",
      "extra": {
        "codes": [{
          "value": 7495
        },
          {
            "value": 7499
          }
        ]
      }
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
      "name": "Belarus",
      "cities": [{
        "name": "Minsk",
        "extra": {
          "codes": [{
            "value": 375017
          }]
        }
      }]
    }
  ]
};

const accessor = new NestedAccessor(input);

console.log(accessor.get('data.name')); // 'Countries classifier'
console.log(accessor.get('countries.name')); // ['Russia', 'Belarus']
console.log(accessor.get('countries.cities.name')); // ['Moscow', 'Petersburg', 'Minsk']
console.log(accessor.get('countries.cities.extra.codes.value')); // [7495, 7499, 7812, 375017]

accessor.set('data.name', 'New name');
console.log(accessor.get('data.name')); // 'New name'
```
