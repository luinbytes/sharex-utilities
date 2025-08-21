import { ActionPanel, Action, List, showToast, Toast, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  accessories?: List.Item.Accessory[];
  icon?: Icon | string;
}

export default function ListCommand() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ListItem[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function fetchItems() {
      try {
        // Example: Get system information using Windows commands
        // This is a template - replace with your actual data fetching logic
        const { stdout } = await execAsync('wmic process get Name,ProcessId,PageFileUsage /format:csv');
        
        // Parse the output (this is just an example)
        const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
        const processes = lines.slice(1, 11).map((line, index) => { // Limit to first 10 for demo
          const parts = line.split(',');
          return {
            id: `process-${index}`,
            title: parts[1] || `Process ${index + 1}`,
            subtitle: `PID: ${parts[2] || 'N/A'}`,
            accessories: [
              { text: `${parts[3] || '0'}KB`, icon: Icon.MemoryChip }
            ],
            icon: Icon.Gear
          };
        });

        setItems(processes);
      } catch (error) {
        // Fallback to example data if command fails
        const exampleItems: ListItem[] = [
          {
            id: "1",
            title: "Example Item 1",
            subtitle: "This is a sample list item",
            accessories: [{ text: "Active", icon: Icon.CheckCircle }],
            icon: Icon.Document
          },
          {
            id: "2", 
            title: "Example Item 2",
            subtitle: "Another sample item with actions",
            accessories: [{ text: "Inactive", icon: Icon.XMarkCircle }],
            icon: Icon.Folder
          },
          {
            id: "3",
            title: "Example Item 3", 
            subtitle: "Demonstrates search functionality",
            accessories: [{ text: "Pending", icon: Icon.Clock }],
            icon: Icon.Star
          }
        ];
        setItems(exampleItems);
        
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch real data",
          message: "Showing example data instead"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search items..."
      throttle
    >
      {filteredItems.map((item) => (
        <List.Item
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          accessories={item.accessories}
          icon={item.icon}
          actions={
            <ActionPanel>
              <Action
                title="Primary Action"
                onAction={async () => {
                  await showToast({
                    style: Toast.Style.Success,
                    title: "Action Executed",
                    message: `Performed action on ${item.title}`
                  });
                }}
              />
              <Action.CopyToClipboard
                title="Copy Title"
                content={item.title}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
              <Action
                title="Secondary Action"
                onAction={async () => {
                  await showToast({
                    style: Toast.Style.Animated,
                    title: "Processing...",
                    message: `Working on ${item.title}`
                  });
                }}
                shortcut={{ modifiers: ["cmd"], key: "s" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
