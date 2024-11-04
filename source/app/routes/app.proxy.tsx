import type { LoaderFunction } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("----------hit app proxy ---------");

  const { session } = await authenticate.public.appProxy(request);
  if (session) {
    console.log("session: ", session);
  }

  if (!session) {
    console.error("Session not established");
  }

  return null;
};
