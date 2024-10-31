import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  process().catch(console.error);
  //200 milisec for webhook response

  return new Response();
};

const process = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
};
