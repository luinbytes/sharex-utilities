import { Action, ActionPanel, Detail, Toast, showToast, getPreferenceValues, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { resolveShareXPath } from "./utils/sharex";
import { showFailure } from "./utils";

export default function ShareXShowPathCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [detectedPath, setDetectedPath] = useState<string | undefined>(undefined);
  const [source, setSource] = useState<string>("Auto-detect");

  useEffect(() => {
    async function run() {
      try {
        const prefs = getPreferenceValues<{ sharexPath?: string }>();
        const fromPref = prefs.sharexPath?.trim();
        const path = await resolveShareXPath(fromPref);
        if (path) {
          setDetectedPath(path);
          setSource(fromPref ? "Preference > Validated" : "Auto-detect");
        } else {
          setDetectedPath(undefined);
          await showToast({
            style: Toast.Style.Failure,
            title: "ShareX not found",
            message: "Set ShareX path in extension settings or install ShareX",
          });
        }
      } catch (error) {
        await showFailure(error, { title: "Failed to resolve ShareX path" });
      } finally {
        setIsLoading(false);
      }
    }

    run();
  }, []);

  const markdown = detectedPath
    ? `# ShareX Path\n\n- **Source**: ${source}\n- **Path**: \`${detectedPath}\``
    : `# ShareX Path\n\n- **Not found**\n\nPlease set the "ShareX Executable Path" in the extension preferences.`;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          {detectedPath && (
            <Action.CopyToClipboard title="Copy Path" content={detectedPath} icon={Icon.Clipboard} />
          )}
          <Action.OpenInBrowser title="ShareX Website" url="https://getsharex.com/" />
        </ActionPanel>
      }
    />
  );
}
