import { Action, ActionPanel, Detail, Toast, showToast, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { runShareX } from "./utils/sharex";
import { showFailure } from "./utils";

export default function ShareXOpenMainCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [resultText, setResultText] = useState("Running ShareX -OpenMainWindow...");

  useEffect(() => {
    async function run() {
      try {
        const prefs = getPreferenceValues<{ sharexPath?: string }>();
        await runShareX(["-OpenMainWindow"], { pathHint: prefs.sharexPath });
        await showToast({ style: Toast.Style.Success, title: "ShareX opened" });
        setResultText("Successfully triggered ShareX main window.");
      } catch (error) {
        await showFailure(error, { title: "Failed to open ShareX" });
        setResultText(
          "Failed to open ShareX main window. Ensure ShareX is installed or set its path in extension settings.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    run();
  }, []);

  return (
    <Detail
      isLoading={isLoading}
      markdown={`# ShareX: Open Main Window\n\n${resultText}`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="ShareX Website" url="https://getsharex.com/" />
        </ActionPanel>
      }
    />
  );
}
