import type { ActionFunction } from "@remix-run/node";
import { Button, Card, Page } from "@shopify/polaris";
import { useCallback } from "react";
import { Form } from "@remix-run/react";
import { $Enums } from "@prisma/client";
import { getAdminContext } from "app/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const adminContext = await getAdminContext(request);

  const { id: shopId } = await prisma.shop.findUniqueOrThrow({
    where: { domain: adminContext.session.shop },
  });

  await prisma.syncOrdersTask.create({
    data: {
      shop: { connect: { id: shopId } },
      stage: $Enums.SyncOrdersTaskStage.CREATE_BULK_TASK,
      inProgress: false,
    },
  });

  return 123;
};

export default function BulkOrderExport() {
  const primaryAction = useCallback(
    () => (
      <Button submit={true} variant="primary">
        Start importing orders
      </Button>
    ),
    [],
  );
  return (
    <Form method="post">
      <Card>
        <Page
          primaryAction={primaryAction()}
          subtitle="Click the button to initiate a bulk order export for orders."
        ></Page>
      </Card>
    </Form>
  );
}
