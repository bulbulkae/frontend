const ROLE = prompt('Who are you?');

let answer;
// if (ROLE === 'Chef') {
//   answer = 'Hello, Chef!';
// } else if (ROLE === 'Manager') {
//   answer = 'Hello, Manager!';
// } else if (ROLE === 'Programmer') {
//   answer = 'Hello, bro, you are so fantastic!';
// } else {
//   answer = 'Hmm....';
// }

answer =
  ROLE === 'Chef'
    ? 'Hello, Chef'
    : ROLE === 'Manager'
    ? 'Hi, Manager'
    : ROLE === 'Programmer'
    ? 'Hi, bro, that is so fantastic!!'
    : 'hmm';

alert(answer);
