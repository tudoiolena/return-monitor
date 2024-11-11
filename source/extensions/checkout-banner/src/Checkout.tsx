import {
  reactExtension,
  Banner,
  useSettings,
  // useApi,
  useCustomer,
  useAppMetafields,
  useExtensionEditor,
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
  const customerId = customer?.id?.split("/").pop();

  const metafieldValue = useAppMetafields({
    namespace: "return_monitor",
    key: "suspiciousCustomers",
  });

  // console.log("suspiciousCustomers", metafieldValue);

  const isSuspicious = metafieldValue[0]?.metafield.value
    ? JSON.parse(metafieldValue[0]?.metafield.value as string).includes(
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

  const chekoutEditor = useExtensionEditor();

  if (chekoutEditor?.type === "checkout") {
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
