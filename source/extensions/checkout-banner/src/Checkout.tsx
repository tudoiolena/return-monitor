import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  // Text,
  // useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";

type Status = "info" | "warning" | "critical" | "success";

// 1. Choose an extension target
// export default reactExtension("purchase.checkout.block.render", () => (
//   <Extension />
// ));
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
  // const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();

  // Use the merchant-defined settings to retrieve the extension's content
  const {
    title: merchantTitle,
    description,
    collapsible,
    status: merchantStatus,
  } = useSettings();

  // Set a default status for the banner if a merchant didn't configure the banner in the checkout editor
  const status: Status =
    merchantStatus === "info" ||
    merchantStatus === "warning" ||
    merchantStatus === "critical" ||
    merchantStatus === "success"
      ? merchantStatus
      : "info";
  const title = merchantTitle ?? "Custom Banner";

  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable

    return (
      <Banner title="checkout-banner" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  // 3. Render a UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      {/* <Banner title="checkout-banner">
        {translate("welcome", {
          target: <Text emphasis="italic">{extension.target}</Text>,
        })}
      </Banner> */}
      <Banner
        title={String(title)}
        status={status}
        collapsible={Boolean(collapsible)}
      >
        {description}
      </Banner>
      <Checkbox onChange={onCheckboxChange}>
        {translate("iWouldLikeAFreeGiftWithMyOrder")}
      </Checkbox>
    </BlockStack>
  );

  async function onCheckboxChange(isChecked) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}
