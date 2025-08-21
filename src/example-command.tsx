import { ActionPanel, Action, Detail, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";

export default function ExampleCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Simulate some async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setContent("# Welcome to Raycast Windows Extension Template\n\nThis is an example command that demonstrates:\n- Basic component structure\n- Loading states\n- Error handling\n- Actions\n\n## Getting Started\n\n1. Customize the `package.json` with your extension details\n2. Modify or replace the example commands\n3. Add your own business logic\n4. Test with `npm run dev`\n\n## Common Patterns\n\n- Use `showToast()` for user feedback\n- Handle loading states appropriately\n- Provide meaningful error messages\n- Use TypeScript for better development experience");
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load content",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Detail
      isLoading={isLoading}
      markdown={content}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Open Raycast Documentation"
            url="https://developers.raycast.com/"
          />
          <Action.CopyToClipboard
            title="Copy Template Info"
            content="Raycast Windows Extension Template - Ready to customize!"
          />
          <Action
            title="Show Success Toast"
            onAction={async () => {
              await showToast({
                style: Toast.Style.Success,
                title: "Action Executed",
                message: "This is how you show feedback to users"
              });
            }}
          />
        </ActionPanel>
      }
    />
  );
}
