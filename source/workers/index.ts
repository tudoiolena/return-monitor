import {syncOrders} from './syncOrders';

setInterval(() => {
  console.log('Worker is running');

  syncOrders().catch(console.error);

}, 1000 * 30);


// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
//
// const main = async () => {
//   while (true) {
//     syncOrders().catch(console.error);
//
//     await sleep(1000 * 30);
//   }
// }
//
// main().catch(console.error);
