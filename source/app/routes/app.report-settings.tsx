import { Form } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  Page,
  RangeSlider,
  Text,
} from "@shopify/polaris";
import StatusToggle from "app/components/StatusToggle";
import { useCallback, useState } from "react";

export { action } from "app/actions/app/report-settings.action";

export const DEFAULT_RANGE_VALUE = 30;

export default function ReportSettings() {
  const primaryAction = useCallback(
    () => (
      <Button variant="primary" submit={true}>
        Save
      </Button>
    ),
    [],
  );

  const [isReturnedEnabled, setIsReturnedEnabled] = useState(true);
  const [isRefundEnabled, setIsRefundEnabled] = useState(true);
  const [isPartiallyRefundedEnabled, setIsPartiallyRefundedEnabled] =
    useState(true);
  const [rangeValue, setRangeValue] = useState(DEFAULT_RANGE_VALUE);

  const handleReturnToggle = () => {
    setIsReturnedEnabled((prev) => !prev);
  };

  const handleRefundToggle = () => {
    setIsRefundEnabled((prev) => !prev);
  };

  const handlePartiallyRefundedToggle = () => {
    setIsPartiallyRefundedEnabled((prev) => !prev);
  };

  const handleRangeSliderChange = useCallback(
    (value: number) => setRangeValue(value),
    [],
  );

  return (
    <Form method="post">
      <Page
        title="Settings"
        backAction={{ url: `app/return-report` }} //FIXME: Update route!
        primaryAction={primaryAction()}
      >
        <Card>
          <BlockStack gap="500">
            <Text as="h2" variant="headingMd">
              Settings Returned Detection
            </Text>
            <StatusToggle
              title="Consider the RETURNED status?"
              isEnabled={isReturnedEnabled}
              onToggle={handleReturnToggle}
            />
            <input
              type="hidden"
              name="isReturnStatus"
              value={isReturnedEnabled.toString()}
            />

            <StatusToggle
              title="Consider the REFUND status?"
              isEnabled={isRefundEnabled}
              onToggle={handleRefundToggle}
            />
            <input
              type="hidden"
              name="isRefundEnabled"
              value={isRefundEnabled.toString()}
            />
            <StatusToggle
              title="Consider the PARTIALLY_REFUNDED status?"
              isEnabled={isPartiallyRefundedEnabled}
              onToggle={handlePartiallyRefundedToggle}
            />
            <input
              type="hidden"
              name="isPartiallyRefundedEnabled"
              value={isPartiallyRefundedEnabled.toString()}
            />
            {isPartiallyRefundedEnabled && (
              <>
                <Text as="p">PARTIALLY_REFUNDED percentage threshhold</Text>
                <RangeSlider
                  label=""
                  value={rangeValue}
                  onChange={handleRangeSliderChange}
                  output
                  suffix={
                    <p
                      style={{
                        minWidth: "24px",
                        textAlign: "right",
                      }}
                    >
                      {rangeValue}
                    </p>
                  }
                />
              </>
            )}
          </BlockStack>
        </Card>
      </Page>
    </Form>
  );
}
