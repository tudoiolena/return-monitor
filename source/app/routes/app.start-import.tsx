import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Page,
  ProgressBar,
  TextField,
  Text,
  Box,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { Form, json, useLoaderData } from "@remix-run/react";
import { $Enums } from "@prisma/client";
import { getAdminContext } from "app/shopify.server";
import { ApiNavigation } from "app/constants/navigation";

const progressMapping: Record<$Enums.SyncOrdersTaskStage, number> = {
  CREATE_BULK_TASK: 20,
  WAIT_FOR_FINISH: 40,
  DOWNLOAD_RESULT: 60,
  PROCESS_RESULT: 80,
  FINISH: 100,
};

export const loader: LoaderFunction = async ({ request }) => {
  const adminContext = await getAdminContext(request);
  const task = await prisma.syncOrdersTask.findFirst({
    where: {
      shop: { domain: adminContext.session.shop },
    },
    orderBy: { createdAt: "desc" },
  });
  return json({ task });
};

export const action: ActionFunction = async ({ request }) => {
  const adminContext = await getAdminContext(request);

  const { id: shopId } = await prisma.shop.findUniqueOrThrow({
    where: { domain: adminContext.session.shop },
  });

  const newTask = await prisma.syncOrdersTask.create({
    data: {
      shop: { connect: { id: shopId } },
      stage: $Enums.SyncOrdersTaskStage.CREATE_BULK_TASK,
      inProgress: false,
    },
  });

  return json(newTask);
};

export default function BulkOrderExport() {
  const { task } = useLoaderData<typeof loader>();
  const [taskData, setTaskData] = useState(task);

  const currentProgress = taskData?.task?.stage
    ? progressMapping[taskData.task.stage as $Enums.SyncOrdersTaskStage]
    : 0;

  const isLoading =
    taskData?.task?.stage != $Enums.SyncOrdersTaskStage.FINISH ||
    taskData?.task?.error;

  useEffect(() => {
    const fetchTaskData = async () => {
      const response = await fetch(ApiNavigation.bulkTask);
      if (response.ok) {
        const data = await response.json();
        setTaskData(data);
      } else {
        console.error("Failed to fetch task data");
        setTimeout(fetchTaskData, 2000);
      }
    };

    fetchTaskData();
    const intervalId = setInterval(fetchTaskData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Form method="post">
      <Page>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingLg">
                  Start
                </Text>
                <Text as="p">
                  Click the button to initiate a bulk export for orders.
                </Text>
                <Box>
                  <Button submit={true} variant="secondary" loading={isLoading}>
                    Start importing orders
                  </Button>
                </Box>
              </BlockStack>

              <BlockStack gap="400">
                <ProgressBar
                  progress={currentProgress}
                  tone={currentProgress === 100 ? "success" : "primary"}
                  size="small"
                />
                {currentProgress === 100 ? (
                  <Banner tone="success" title="Success">
                    <Text as="p">The import finish successfully</Text>
                  </Banner>
                ) : (
                  <Banner title="Wait the operation to be finished">
                    <Text as="p">
                      Wait until the order importing will be finished
                    </Text>
                  </Banner>
                )}
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <Text as="h4">Latest import task info</Text>
            <TextField
              label="Task ID:"
              value={taskData?.task?.id}
              disabled
              autoComplete="off"
            />
            <TextField
              label="Status:"
              value={taskData?.task?.stage}
              disabled
              autoComplete="off"
            />
            <TextField
              label="Created At:"
              value={taskData?.task?.createdAt}
              disabled
              autoComplete="off"
            />
          </Card>
        </BlockStack>
      </Page>
    </Form>
  );
}
