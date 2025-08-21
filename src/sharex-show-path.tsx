import { Action, Toast, showToast, getPreferenceValues, Icon } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";
import { resolveShareXPathDetailed, type ResolvedShareXPath } from "./utils/sharex";
import { showFailure } from "./utils";
import { LoadingDetail, ResultDetail } from "./utils/ui";

export default function ShareXShowPathCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [resolved, setResolved] = useState<ResolvedShareXPath | undefined>(undefined);

  useEffect(() => {
    async function run() {
      try {
        const prefs = getPreferenceValues<{ sharexPath?: string }>();
        const fromPref = prefs.sharexPath?.trim();
        const res = await resolveShareXPathDetailed(fromPref);
        setResolved(res);
        if (!res.path) {
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

  const found = Boolean(resolved?.path);
  const markdown = found
    ? `# ShareX Path\n\n- **Path**: \`${resolved!.path}\``
    : `# ShareX Path\n\n- **Not found**\n\nPlease set the "ShareX Executable Path" in the extension preferences.`;

  if (isLoading) {
    return (
      <LoadingDetail
        navigationTitle="ShareX"
        title="Detecting ShareX Path"
        subtitle="Resolving from preference and system..."
        steps={["Preference override", "PATH lookup", "Registry query", "Common locations"]}
      />
    );
  }

  return (
    <ResultDetail
      navigationTitle="ShareX"
      markdown={markdown}
      status={found ? "success" : "failure"}
      statusText={found ? "Found" : "Not Found"}
      methodLabel={resolved?.methodLabel}
      methodDescription={resolved?.methodDescription}
      source={resolved?.source}
      executablePath={resolved?.path}
      actions={
        <>
          {resolved?.path && (
            <Action.CopyToClipboard title="Copy Path" content={resolved.path} icon={Icon.Clipboard} />
          )}
          <Action.OpenInBrowser title="ShareX Website" url="https://getsharex.com/" />
        </>
      }
    />
  );
}
