import type { Shop, SyncOrdersTask } from "@prisma/client";
import { $Enums } from "@prisma/client";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { runTaskWrapper } from "../helper/handle-task-wrapper";

const DOWNLOADS_FOLDER = "downloads";

export const downloadResult = async (task: SyncOrdersTask) => {
  const taskRunner = async (task: SyncOrdersTask, shop: Shop) => {
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

    // Handle writer events
    await new Promise<void>((resolve, reject) => {
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
        resolve();
      });

      writer.on("error", (error) => {
        reject(error);
      });
    });
  };

  await runTaskWrapper(task, taskRunner);
};
