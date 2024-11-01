import {
  reactExtension,
  Banner,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect } from "react";

type Status = "info" | "warning" | "critical" | "success";

const checkoutBlock = reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));
export { checkoutBlock };

const deliveryAddress = reactExtension(
  "purchase.checkout.delivery-address.render-before",
  () => <Extension />,
);
export { deliveryAddress };

function Extension() {
  const translate = useTranslate();
  const instructions = useInstructions();

  const {
    title: merchantTitle,
    description,
    collapsible,
    status: merchantStatus,
  } = useSettings();

  const status: Status =
    merchantStatus === "info" ||
    merchantStatus === "warning" ||
    merchantStatus === "critical" ||
    merchantStatus === "success"
      ? merchantStatus
      : "info";
  const title = merchantTitle ?? "Custom Banner";

  if (!instructions.attributes.canUpdateAttributes) {
    return (
      <Banner title="checkout-banner" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  useEffect(() => {
    async function checkWarning() {
      try {
        const response = await fetch(
          "https://app-tutorial-test.myshopify.com/apps/proxytest",
          {
            method: "POST",
            redirect: "manual",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("data: ", data);
      } catch (error) {
        console.error("Failed to fetch warning data:", error);
      }
    }

    checkWarning();
  }, []);

  return (
    <Banner
      title={String(title)}
      status={status}
      collapsible={Boolean(collapsible)}
    >
      {description}
    </Banner>
  );
}
