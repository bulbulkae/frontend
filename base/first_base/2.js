'use strict'; //строгий режим

// a =2;

let c = 'Dindin';

const shop = `I love ${c}`;
console.log(shop);

c = 'New name';

console.log(shop);

let car123 = 'bmw';
let _newcar = 'nissan';

const CONST_VALUE = 'Aroo';

let number = 12;
let String = 'text';
let bool = true;
let bool1 = Boolean('');
console.log(bool1);

let null1 = null;

let undef;
console.log(undef);

console.log(2 * 'nan');
console.log(1 / 0);

// ____________________________
// Object { key: value}

const user = {
  name: 'Aika',
  age: 23,
  isProger: true,
  friends: {
    first: 'Dayna',
    second: 'Mika',
  },

  'phone number': 7073057588,
};
console.log(user.name, user['phone number']);

user.age = 34;
console.log(user);

console.log(user);

let user2 = {
  name: 'Beka',
  isProger: true,
  'phone number': 7073057588,
};

user2.young = true;
user2['isAnimelover'] = false;

console.log(user2);
delete user.isProger;
delete user['phone number'];
console.log(user);

for (let key in user) {
  console.log(`${key}: ${user[key]}`);
}

// user = {
//   age: 21,
// };

// Arrays
const arr = [100, 13, '23'];
console.log(arr);

console.log(typeof arr);
