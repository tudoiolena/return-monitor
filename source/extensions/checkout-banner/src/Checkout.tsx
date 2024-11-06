import {
  reactExtension,
  Banner,
  useSettings,
  // useApi,
  useCustomer,
  useAppMetafields,
} from "@shopify/ui-extensions-react/checkout";

type Status = "info" | "warning" | "critical" | "success";

const checkoutBlock = reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  () => <Extension />,
);
export { checkoutBlock };

function Extension() {
  // const { query, sessionToken, shop } = useApi();

  const customer = useCustomer();
  const customerId = customer.id.split("/").pop();

  const metafieldValue = useAppMetafields({
    namespace: "custom_data",
    key: "isCustomerSuspicious",
  });

  console.log("isCustomerSuspicious", metafieldValue);

  const isSuspicious = metafieldValue[1]?.metafield.value
    ? JSON.parse(metafieldValue[1]?.metafield.value as string).includes(
        customerId,
      )
    : false;

  const {
    title: merchantTitle,
    description: merchantDescription,
    collapsible,
    status: merchantStatus,
  } = useSettings();

  const status: Status =
    merchantStatus === "info" ||
    merchantStatus === "warning" ||
    merchantStatus === "critical" ||
    merchantStatus === "success"
      ? merchantStatus
      : "warning";

  const title = merchantTitle ?? "Custom Banner";
  const description = merchantDescription ?? "Some description";

  return (
    <>
      {isSuspicious && (
        <Banner
          title={String(title)}
          status={status}
          collapsible={Boolean(collapsible)}
        >
          {description}
        </Banner>
      )}
    </>
  );
}
