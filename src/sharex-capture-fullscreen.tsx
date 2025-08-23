import { Action, Toast, showToast, getPreferenceValues } from "@raycast/api";
import React, { useEffect, useRef, useState } from "react";
import { resolveShareXPathDetailed, type ResolvedShareXPath, runShareX } from "./utils/sharex";
import { LoadingDetail, ResultDetail } from "./utils/ui";
import { showFailure } from "./utils";

export default function ShareXCaptureFullscreenCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [resultText, setResultText] = useState("Running ShareX -PrintScreen...");
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
        await runShareX(["-PrintScreen"], { pathHint: res.path });
        await showToast({ style: Toast.Style.Success, title: "Fullscreen capture triggered" });
        setResultText("Fullscreen capture started successfully.");
        setLaunched(true);
      } catch (error) {
        await showFailure(error, { title: "Failed to trigger fullscreen capture" });
        setResultText("Failed to trigger fullscreen capture. Ensure ShareX is installed or set its path in settings.");
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
        title="ShareX: Capture Fullscreen"
        subtitle="Invoking -PrintScreen..."
        steps={["Resolve ShareX path", "Start fullscreen capture"]}
      />
    );
  }

  return (
    <ResultDetail
      navigationTitle="ShareX"
      markdown={`# ShareX: Capture Fullscreen\n\n${resultText}`}
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
