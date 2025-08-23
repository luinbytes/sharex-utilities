import { Action, Toast, showToast, getPreferenceValues } from "@raycast/api";
import React, { useEffect, useRef, useState } from "react";
import { resolveShareXPathDetailed, type ResolvedShareXPath, runShareX } from "./utils/sharex";
import { LoadingDetail, ResultDetail } from "./utils/ui";
import { showFailure } from "./utils";

export default function ShareXCaptureActiveWindowCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [resultText, setResultText] = useState("Running ShareX -ActiveWindow...");
  const [resolved, setResolved] = useState<ResolvedShareXPath | undefined>(undefined);
  const [launched, setLaunched] = useState<boolean | undefined>(undefined);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      try {
        const prefs = getPreferenceValues<{ sharexPath?: string }>();
        const res = await resolveShareXPathDetailed(prefs.sharexPath?.trim());
        setResolved(res);
        await runShareX(["-ActiveWindow"], { pathHint: res.path });
        await showToast({ style: Toast.Style.Success, title: "Active window capture triggered" });
        setResultText("Active window capture started successfully.");
        setLaunched(true);
      } catch (error) {
        await showFailure(error, { title: "Failed to trigger active window capture" });
        setResultText("Failed to trigger active window capture. Ensure ShareX is installed or set its path in settings.");
        setLaunched(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <LoadingDetail
        navigationTitle="ShareX"
        title="ShareX: Capture Active Window"
        subtitle="Invoking -ActiveWindow..."
        steps={["Resolve ShareX path", "Start active window capture"]}
      />
    );
  }

  return (
    <ResultDetail
      navigationTitle="ShareX"
      markdown={`# ShareX: Capture Active Window\n\n${resultText}`}
      status={launched ? "success" : "failure"}
      statusText={launched ? "Triggered" : "Failed"}
      methodLabel={resolved?.methodLabel}
      methodDescription={resolved?.methodDescription}
      source={resolved?.source}
      executablePath={resolved?.path}
      actions={
        <>
          <Action.OpenInBrowser title="ShareX CLI Docs" url="https://getsharex.com/docs/command-line-arguments" />
        </>
      }
    />
  );
}
