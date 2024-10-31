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

export default function ReportSettings() {
  const primaryAction = useCallback(
    () => <Button variant="primary">Save</Button>,
    [],
  );

  const [isReturnedEnabled, setIsReturnedEnabled] = useState(true);
  const [isRefundEnabled, setIsRefundEnabled] = useState(true);
  const [isPartiallyRefundedEnabled, setIsPartiallyRefundedEnabled] =
    useState(true);
  const [rangeValue, setRangeValue] = useState(30);

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
          <StatusToggle
            title="Consider the REFUND status?"
            isEnabled={isRefundEnabled}
            onToggle={handleRefundToggle}
          />
          <StatusToggle
            title="Consider the PARTIALLY_REFUNDED status?"
            isEnabled={isPartiallyRefundedEnabled}
            onToggle={handlePartiallyRefundedToggle}
          />

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
        </BlockStack>
      </Card>
    </Page>
  );
}
