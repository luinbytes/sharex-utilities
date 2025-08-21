import { Action, Toast, showToast, getPreferenceValues } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";
import { runShareX } from "./utils/sharex";
import { showFailure } from "./utils";
import { LoadingDetail, ResultDetail } from "./utils/ui";
import { resolveShareXPathDetailed, type ResolvedShareXPath } from "./utils/sharex";

export default function ShareXOpenMainCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [resultText, setResultText] = useState("Running ShareX -OpenMainWindow...");
  const [resolved, setResolved] = useState<ResolvedShareXPath | undefined>(undefined);
  const [launched, setLaunched] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    async function run() {
      try {
        const prefs = getPreferenceValues<{ sharexPath?: string }>();
        const res = await resolveShareXPathDetailed(prefs.sharexPath?.trim());
        setResolved(res);
        await runShareX(["-OpenMainWindow"], { pathHint: res.path });
        await showToast({ style: Toast.Style.Success, title: "ShareX opened" });
        setResultText("Successfully triggered ShareX main window.");
        setLaunched(true);
      } catch (error) {
        await showFailure(error, { title: "Failed to open ShareX" });
        setResultText(
          "Failed to open ShareX main window. Ensure ShareX is installed or set its path in extension settings.",
        );
        setLaunched(false);
      } finally {
        setIsLoading(false);
      }
    }

    run();
  }, []);

  if (isLoading) {
    return (
      <LoadingDetail
        navigationTitle="ShareX"
        title="Opening ShareX"
        subtitle="Running -OpenMainWindow..."
        steps={["Resolve ShareX path", "Launch ShareX"]}
      />
    );
  }

  return (
    <ResultDetail
      navigationTitle="ShareX"
      markdown={`# ShareX: Open Main Window\n\n${resultText}`}
      status={launched ? "success" : "failure"}
      statusText={launched ? "Launched" : "Failed"}
      methodLabel={resolved?.methodLabel}
      methodDescription={resolved?.methodDescription}
      source={resolved?.source}
      executablePath={resolved?.path}
      actions={
        <>
          <Action.OpenInBrowser title="ShareX Website" url="https://getsharex.com/" />
        </>
      }
    />
  );
}
