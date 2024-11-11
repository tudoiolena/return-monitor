import { checkAndUpdateCustomerSuspicion } from "./metafields";
import { syncOrders } from "./syncOrders";

setInterval(() => {
  console.log("Worker is running");

  syncOrders().catch(console.error);
}, 1000 * 30);

setInterval(() => {
  console.log("Checking suspicious customers worker is running");

  checkAndUpdateCustomerSuspicion().catch(console.error);
}, 1000 * 30);
