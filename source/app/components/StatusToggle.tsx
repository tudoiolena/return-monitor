import { Badge, Box, Button, InlineGrid, Text } from "@shopify/polaris";
import type { FC } from "react";

export enum BadgeTone {
  SUCCESS = "success",
  CRITICAL = "critical",
}

export enum BadgeText {
  ON = "On",
  OFF = "Off",
}

export interface StatusToggleProps {
  title: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const StatusToggle: FC<StatusToggleProps> = ({
  title,
  isEnabled,
  onToggle,
}) => {
  const badgeTone = isEnabled ? BadgeTone.SUCCESS : BadgeTone.CRITICAL;
  const badgeText = isEnabled ? BadgeText.ON : BadgeText.OFF;
  const buttonText = isEnabled ? "Enabled" : "Disabled";

  return (
    <>
      <InlineGrid columns={["oneThird", "twoThirds"]}>
        <Box>
          <Text as="p">{title}</Text>
        </Box>
        <Box>
          <Badge tone={badgeTone}>{badgeText}</Badge>
        </Box>
      </InlineGrid>
      <Box>
        <Button onClick={onToggle}>{buttonText}</Button>
      </Box>
    </>
  );
};

export default StatusToggle;
