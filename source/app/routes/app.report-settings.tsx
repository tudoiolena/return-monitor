import type { LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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
import { AdminNavigation } from "app/constants/navigation";
import { settingsLoader } from "app/loaders/settings.loader";
import { useCallback, useState } from "react";

export const DEFAULT_RANGE_VALUE = 30;
export const DEFAULT_SUSPICIOUS_RANGE_VALUE = 30;
export const DEFAULT_SUSPICIOUS_RETURN_VALUE = 2;

export { action } from "app/actions/report-settings.action";

export const loader: LoaderFunction = settingsLoader;

export default function ReportSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const primaryAction = useCallback(
    () => (
      <Button variant="primary" submit={true}>
        Save
      </Button>
    ),
    [],
  );

  const [isReturnedEnabled, setIsReturnedEnabled] = useState(
    settings.isReturnStatus,
  );
  const [isRefundEnabled, setIsRefundEnabled] = useState(
    settings.isRefundStatus,
  );
  const [isPartiallyRefundedEnabled, setIsPartiallyRefundedEnabled] = useState(
    settings.isPartiallyRefundedStatus,
  );
  const [rangeValue, setRangeValue] = useState(
    settings.partialRefundPercentage || DEFAULT_RANGE_VALUE,
  );
  const [suspiciousRangeValue, setsuspiciousRangeValue] = useState(
    settings.suspiciousReturnPercentage || DEFAULT_SUSPICIOUS_RANGE_VALUE,
  );
  const [returnValue, setReturnValue] = useState(
    `${settings.suspiciousReturnAmount}` ||
      `${DEFAULT_SUSPICIOUS_RETURN_VALUE}`,
  );

  const handleReturnToggle = () => {
    setIsReturnedEnabled((prev: boolean) => !prev);
  };

  const handleRefundToggle = () => {
    setIsRefundEnabled((prev: boolean) => !prev);
  };

  const handlePartiallyRefundedToggle = () => {
    setIsPartiallyRefundedEnabled((prev: boolean) => !prev);
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
        backAction={{ url: AdminNavigation.report }}
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
                  <input
                    type="hidden"
                    name="partialRefundPercentage"
                    value={rangeValue}
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
              <input
                type="hidden"
                name="suspiciousReturnPercentage"
                value={suspiciousRangeValue}
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
