import { Form } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  Page,
  RangeSlider,
  Text,
  TextField,
} from "@shopify/polaris";
import StatusToggle from "app/components/StatusToggle";
import { useCallback, useState } from "react";

export { action } from "app/actions/app/report-settings.action";

export const DEFAULT_RANGE_VALUE = 30;
export const DEFAULT_SUSPICIOUS_RANGE_VALUE = 30;
export const DEFAULT_SUSPICIOUS_RETURN_VALUE = 2;

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
  const [suspiciousRangeValue, setsuspiciousRangeValue] = useState(
    DEFAULT_SUSPICIOUS_RANGE_VALUE,
  );
  const [returnValue, setReturnValue] = useState(
    `${DEFAULT_SUSPICIOUS_RETURN_VALUE}`,
  );

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

  const handleSuspiciousRangeSliderChange = useCallback(
    (value: number) => setsuspiciousRangeValue(value),
    [],
  );

  const handlereturnValueChange = useCallback(
    (newValue: string) => setReturnValue(newValue),
    [],
  );

  return (
    <Form method="post">
      <Page
        title="Settings"
        backAction={{ url: `app/return-report` }} //FIXME: Update route!
        primaryAction={primaryAction()}
      >
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
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
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Suspicious customer threshhold
              </Text>
              <Text as="p">
                Specify the percentage of returns at which the customer will be
                considered suspicious
              </Text>
              <RangeSlider
                label=""
                value={suspiciousRangeValue}
                onChange={handleSuspiciousRangeSliderChange}
                output
                suffix={
                  <p
                    style={{
                      minWidth: "24px",
                      textAlign: "right",
                    }}
                  >
                    {suspiciousRangeValue}
                  </p>
                }
              />
              <TextField
                name="suspiciousReturnAmount"
                label="Specify the number of returns at which the customer will be considered suspicious"
                type="number"
                value={returnValue}
                onChange={handlereturnValueChange}
                autoComplete="off"
              />
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>
    </Form>
  );
}
