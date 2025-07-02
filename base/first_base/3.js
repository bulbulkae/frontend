'use strict';

// Interaction with user

console.log('Hello from console!');

// alert('Hello from alert');

// let userAnswer = confirm('are you ok?', ''); //true or false
// console.log(userAnswer);

// const PROMPT = prompt('Where are you going to?', 'Home, sweet home!');

// console.log(PROMPT);

let a = 15;
// console.log(typeof a);
a = String(a);
// console.log(typeof a);

let bool = true;
// console.log(typeof bool);
// console.log(typeof Number(bool), Number(bool));
bool = String(bool);
// console.log(typeof bool);

let str = 'hello';
str = Number(str);
// console.log(typeof str, str);

// console.log('5' / '2');
// console.log('5' + '2');
// console.log(typeof ('2' * '9'), '2' * '9');
// console.log(Number('123d'));

// console.log(Number(null));
// console.log(Number(undefined));

// console.log(Boolean(''));
// console.log(Boolean(' '));
// console.log(Boolean('a'));
// console.log(Boolean(5));
// console.log(Boolean(0));
// console.log(Boolean(-5));

// console.log(5 / 2);
// console.log(7 % 2);
// console.log(5 * 2);

let inc = 10,
  decr = 12;

// console.log(inc++);
// console.log(inc);
// console.log(++inc);
// console.log(inc);

// console.log(inc--);
// console.log(inc);
// console.log(--inc);
// console.log(inc);

// console.log(8 > 9);
// console.log(8 < 9);

// console.log(9 == '9');
// console.log(9 === '9');

// console.log(undefined == null);
// console.log(undefined === null);

// console.log(0 == null);

// console.log(9 !== '9');
// console.log(9 != '9');

// console.log('asd' > 'bsd');

// console.log('z' && 'f');
// console.log('z' || 'f');
// console.log(!'z');
// let comp;
// console.log(comp ?? 'another');

const burger = 10;
const fries = 3;
const fuse_tea = 3;
let fuse_tea2 = 2;
fuse_tea2 = fuse_tea2 ?? 1;

// console.log('fuse', fuse_tea2);

const salad = 2;

if (burger > 3 && fuse_tea) {
  // console.log('its ok');
} else if (fries > 3 && fuse_tea) {
  // console.log('friessss ok');
} else {
  // console.log('nope');
}

let years = 20;
switch (years) {
  case 20:
    // console.log('yeah 20');
    break;

  case 30:
  // console.log('30');

  default:
  // console.log('hbdaaay');
}

let b = 0;
do {
  // console.log(b);
  b++;
} while (b < 4);

let b1 = 0;
while (b1 < 4) {
  // console.log(b1);
  b1++;
}

// let triangle = '';
// for (let i = 0; i <= 4; i++) {
//   for (let j = 0; j <= i; j++) {
//     triangle += '*';
//   }
//   triangle += '\n';
// }
// console.log(triangle);

let triangle = '';
for (let i = 0; i <= 4; i++) {
  for (let j = 0; j <= i; j++) {
    triangle += '*';
  }
  triangle += '\n';
}
console.log(triangle);

let arr = [
  ['ads', 'zxc'],
  ['qew', 'qwrewet', 'rjbg'],
];

console.log(arr);
for (let e in arr) {
  console.log(arr[e]);
}

for (let e = 0; e < arr.length; e++) {
  for (let j = 0; j < arr[e].length; j++) {
    console.log(arr[e][j]);
  }
}

const user = [
  {
    name: 'Molya',
    age: 24,
  },
  {
    name: 'Bula',
    age: 22,
  },
];

for (let i = 0; i < user.length; i++) {
  for (let key in user[i]) {
    console.log(key, user[i][key]);
  }
}

let test = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

let res = '';
let res2 = '';
for (let i = 0; i < test.length; i++) {
  for (let j = 0; j < test[i].length; j++) {
    res += test[i][j];
    // console.log(test[i][j]);
    switch (test[i][j]) {
      case 0:
        test[i][j] = '*';
        res2 += '*';
        break;
      case 1:
        test[i][j] = '+';
        res2 += '+';
        break;
    }
  }
  res += '\n';
  res2 += '\n';
}
console.log(res);
console.log(res2);

let res3 = '';
for (let i = 0; i < test.length; i++) {
  for (let j = 0; j < test[i].length; j++) {
    res3 += test[i][j];
  }
  res3 += '\n';
}
console.log(res3);
