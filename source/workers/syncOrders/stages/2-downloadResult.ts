import { $Enums, type SyncOrdersTask } from "@prisma/client";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const DOWNLOADS_FOLDER = "downloads";

export const downloadResult = async (task: SyncOrdersTask) => {
  console.log("hello downloadResult");
  await prisma.syncOrdersTask.update({
    where: { id: task.id },
    data: {
      retryCount: { increment: 1 },
      inProgress: true,
      updatedAt: new Date(),
    },
  });

  const shop = await prisma.shop.findFirst({ where: { id: task.shopId } });
  if (!shop) {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        retryCount: { increment: 1 },
        inProgress: false,
        updatedAt: new Date(),
        error: "Shop not found",
      },
    });
    return;
  }

  const taskData = task.data ? JSON.parse(task.data as string) : {};
  const url = taskData.url;

  // Ensure the Downloads folder exists
  if (!fs.existsSync(DOWNLOADS_FOLDER)) {
    fs.mkdirSync(DOWNLOADS_FOLDER, { recursive: true });
  }

  const response = await axios.get(url, { responseType: "stream" });

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers["content-disposition"];
  const filenameMatch = contentDisposition?.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
  );
  const filename = filenameMatch
    ? filenameMatch[1].replace(/['"]/g, "")
    : "default_filename.jsonl";
  const filePath = path.join(DOWNLOADS_FOLDER, filename);

  // Save file to the specified path
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  writer.on("finish", async () => {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        stage: $Enums.SyncOrdersTaskStage.PROCESS_RESULT,
        inProgress: false,
        updatedAt: new Date(),
        data: filePath,
      },
    });
    console.log(`${task.id}, File download completed successfully.`);
  });

  writer.on("error", async (error) => {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        retryCount: { increment: 1 },
        inProgress: false,
        updatedAt: new Date(),
        error: error.message,
      },
    });
    console.error(`${task.id} Error saving the file:`, error);
  });
};
