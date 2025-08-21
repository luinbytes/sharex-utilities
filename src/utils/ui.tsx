import React, { ReactNode } from "react";
import { ActionPanel, Detail } from "@raycast/api";

/**
 * Loading skeleton for commands that fetch or resolve data.
 * Use while data is loading to avoid showing interim "not found" states.
 */
export function LoadingDetail({
  title = "Loading",
  subtitle = "Please wait...",
  navigationTitle,
  steps,
  currentStepIndex,
  actions,
}: {
  title?: string;
  subtitle?: string;
  navigationTitle?: string;
  steps?: string[];
  currentStepIndex?: number;
  actions?: ReactNode;
}) {
  const hasSteps = Array.isArray(steps) && steps.length > 0;
  const stepsMarkdown = hasSteps
    ? `\n\n### Steps\n${steps!
        .map((s, idx) => {
          let prefix = "•";
          if (typeof currentStepIndex === "number") {
            if (idx < currentStepIndex) prefix = "✅";
            else if (idx === currentStepIndex) prefix = "⏳";
          }
          return `- ${prefix} ${s}`;
        })
        .join("\n")}`
    : "";
  return (
    <Detail
      isLoading
      navigationTitle={navigationTitle}
      markdown={`# ${title}\n\n${subtitle}${stepsMarkdown}`}
      metadata={
        <Detail.Metadata>
          {hasSteps && (
            <Detail.Metadata.TagList title="Steps">
              {steps!.map((s, idx) => {
                let color: "green" | "yellow" | "gray" = "gray";
                if (typeof currentStepIndex === "number") {
                  if (idx < currentStepIndex) color = "green";
                  else if (idx === currentStepIndex) color = "yellow";
                  else color = "gray";
                }
                return <Detail.Metadata.TagList.Item key={`${idx}-${s}`} text={s} color={color} />;
              })}
            </Detail.Metadata.TagList>
          )}
          <Detail.Metadata.Label title="Status" text="Detecting..." />
        </Detail.Metadata>
      }
      actions={actions ? <ActionPanel>{actions}</ActionPanel> : undefined}
    />
  );
}

export function ResultDetail({
  markdown,
  status,
  statusText,
  methodLabel,
  methodDescription,
  source,
  executablePath,
  navigationTitle,
  actions,
}: {
  markdown: string;
  status: "success" | "failure" | "info";
  statusText?: string;
  methodLabel?: string;
  methodDescription?: string;
  source?: string;
  executablePath?: string;
  navigationTitle?: string;
  actions?: ReactNode;
}) {
  const defaultStatusText = status === "success" ? "Success" : status === "failure" ? "Failed" : "Info";
  const color = status === "success" ? "green" : status === "failure" ? "red" : "blue";
  const markdownWithDetails = methodDescription
    ? `${markdown}\n\n### Method Details\n${methodDescription}`
    : markdown;
  return (
    <Detail
      navigationTitle={navigationTitle}
      markdown={markdownWithDetails}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Status">
            <Detail.Metadata.TagList.Item text={statusText ?? defaultStatusText} color={color} />
          </Detail.Metadata.TagList>
          {methodLabel && <Detail.Metadata.Label title="Method" text={methodLabel} />}
          {source && <Detail.Metadata.Label title="Source" text={source} />}
          {executablePath && <Detail.Metadata.Label title="Executable" text={executablePath} />}
        </Detail.Metadata>
      }
      actions={actions ? <ActionPanel>{actions}</ActionPanel> : undefined}
    />
  );
}
