# Raycast Extension Template

A comprehensive template for creating Raycast extensions on Windows with example commands, utilities, and best practices.

## 🚀 Quick Start

1. **Clone or download this template**
2. **Customize the extension**:
   - Update `package.json` with your extension details
   - Replace `your-raycast-username` with your actual Raycast username
   - Modify the extension name, title, description, and keywords
   - Update the icon in `assets/command-icon.png` (512x512px PNG)
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and helpers
│   ├── example-command.tsx    # Basic detail view example
│   └── list-command.tsx       # List view with search example
├── assets/
│   └── command-icon.png       # Extension icon (512x512px)
├── metadata/                  # Screenshots for store submission
├── package.json              # Extension manifest and dependencies
├── README.md                 # This file
└── tsconfig.json             # TypeScript configuration
```

## 🛠 Included Examples

### Example Command (`src/example-command.tsx`)
- Basic detail view with markdown content
- Loading states and error handling
- Action panel with common actions
- Toast notifications

### List Command (`src/list-command.tsx`)
- List view with search functionality
- Windows system integration example
- Item accessories and icons
- Keyboard shortcuts

### Utilities (`src/utils/`)
- Common helper functions
- Windows-specific utilities
- Type definitions

### UI Utilities (`src/utils/ui.tsx`)
- __LoadingDetail__ – Skeleton view with steps while async work is running.
  - Props:
    - `title?: string`
    - `subtitle?: string`
    - `navigationTitle?: string`
    - `steps?: string[]`
    - `currentStepIndex?: number`
    - `actions?: ReactNode`
  - Behavior:
    - Steps are shown twice: as a compact TagList in metadata and as a full list in the markdown body to prevent truncation. Use longer, descriptive step text safely.
  - Example:
    ```tsx
    <LoadingDetail
      navigationTitle="ShareX"
      title="Detecting ShareX Path"
      subtitle="Resolving from preference and system..."
      steps={["Preference override", "PATH lookup", "Registry query", "Common locations"]}
      currentStepIndex={1}
    />
    ```

  - __ResultDetail__ – Reusable success/failure/info result screen with Raycast-style metadata.
    - Props:
      - `markdown: string`
      - `status: "success" | "failure" | "info"`
      - `statusText?: string`
      - `methodLabel?: string` – optional method description (e.g., "Preference override (validated)")
      - `methodDescription?: string` – optional detailed explanation of how the method resolved the path. Rendered in the markdown body as a "Method Details" section to avoid metadata truncation.
      - `source?: string` – optional source identifier
      - `executablePath?: string` – optional path shown as a label
      - `navigationTitle?: string`
      - `actions?: ReactNode`
    - Example:
      ```tsx
      <ResultDetail
        navigationTitle="ShareX"
        markdown="# ShareX: Open Main Window\n\nSuccessfully triggered ShareX."
        status="success"
        statusText="Launched"
        methodLabel={resolved.methodLabel}
        methodDescription={resolved.methodDescription}
        source={resolved.source}
        executablePath={resolved.path}
      />
      ```

## 🔧 ShareX Commands

- __ShareX: Show Detected Path__ (`src/sharex-show-path.tsx`)
  - Resolves the ShareX executable path (preference override > auto-detect) and displays it.
  - Shows Raycast-style status and method metadata via `ResultDetail`, including "Method" and "Method Details".
  - Actions: Copy path to clipboard.

- __ShareX: Capture Region__ (`src/sharex-capture-region.tsx`)
  - Triggers ShareX region capture overlay using CLI flag `-RectangleRegion`.
  - Uses the same path resolution flow. Shows progress in `LoadingDetail` and full method details in `ResultDetail`.
  - Action: Open ShareX CLI docs.

- __ShareX: Open Main Window__ (`src/sharex-open-main.tsx`)
  - Opens the ShareX main window using the resolved path.
  - Shows success/failure toasts and a `ResultDetail` with status, method, method details, and executable path.

## 🧩 ShareX Path Detection & CLI

This template includes ShareX-specific utilities in `src/utils/sharex.ts`:

- __Auto-detect ShareX path__: Attempts to locate `ShareX.exe` in the following order:
  1) PATH (`where ShareX.exe`)
  2) Registry (Uninstall keys: `HKLM` 32/64-bit) using PowerShell
  3) Common install locations: `%ProgramFiles%`, `%ProgramFiles(x86)%`, `%LocalAppData%`

- __Manual override__: If auto-detection fails, set the preference `ShareX Executable Path` (`sharexPath`) in the extension settings. You can use environment variables, e.g. `%LocalAppData%\Programs\ShareX\ShareX.exe`.

- __CLI helper__: Use `runShareX(args, { pathHint, timeout })` to invoke ShareX safely.

Example (inside a command):

```ts
import { runShareX, resolveShareXPathDetailed } from "./utils/sharex";

const detailed = await resolveShareXPathDetailed(Preferences.sharexPath);
if (!detailed.path) {
  // handle not found
}
// e.g. trigger an action or open ShareX using the resolved path
await runShareX(["-OpenMainWindow"], { pathHint: detailed.path });
```

## 📝 Customization Guide

### 1. Update Package Information

Edit `package.json`:
```json
{
  "name": "your-extension-name",
  "title": "Your Extension Title",
  "description": "Brief description of what your extension does",
  "author": "your-raycast-username",
  "categories": ["Productivity"],
  "keywords": ["relevant", "keywords"]
}
```

### 2. Configure Commands

Update the `commands` array in `package.json`:
```json
"commands": [
  {
    "name": "your-command",
    "title": "Your Command Title",
    "description": "What this command does",
    "mode": "view"
  }
]
```

### 3. Create Your Commands

- Copy and modify the example commands in `src/`
- Follow Raycast's component patterns
- Use TypeScript for better development experience

### 4. Add Dependencies

```bash
npm install your-package
```

Common packages for Raycast extensions:
- `@raycast/utils` - Additional utilities
- `node-fetch` - HTTP requests
- `fs-extra` - File system operations

## 🎨 Icon Guidelines

- **Size**: 512x512px PNG format
- **Theme**: Should work in both light and dark themes
- **Quality**: High-resolution, clean design
- **Tool**: Use [Raycast Icon Generator](https://icon.ray.so/) for easy creation

## 📸 Screenshots for Store

Place screenshots in the `metadata/` folder:
- **Format**: PNG, 2000x1250px (16:10 aspect ratio)
- **Count**: 3-6 screenshots recommended
- **Content**: Show key features and functionality
- **Tip**: Use Raycast's built-in screenshot tool with "Save to Metadata" enabled

## 🧪 Development Workflow

1. **Development**: `npm run dev`
2. **Linting**: `npm run lint`
3. **Fix linting**: `npm run fix-lint`
4. **Build**: `npm run build`
5. **Publish**: `npm run publish`

## ✅ Pre-submission Checklist

- [ ] Updated `package.json` with correct author username
- [ ] Extension has a unique, descriptive name
- [ ] Icon is 512x512px PNG and works in light/dark themes
- [ ] Added 3-6 screenshots in `metadata/` folder
- [ ] README explains any required setup or configuration
- [ ] Tested with `npm run build` and verified functionality
- [ ] Followed [Raycast Extension Guidelines](https://manual.raycast.com/extensions)

## 🔧 Common Patterns

### Loading States
```tsx
const [isLoading, setIsLoading] = useState(true);

return <List isLoading={isLoading}>...</List>;
```

### Error Handling
```tsx
try {
  // Your code
} catch (error) {
  await showToast({
    style: Toast.Style.Failure,
    title: "Error occurred",
    message: error instanceof Error ? error.message : "Unknown error"
  });
}
```

### Toast Notifications
```tsx
await showToast({
  style: Toast.Style.Success,
  title: "Success!",
  message: "Operation completed"
});
```

## 🐛 Troubleshooting

- **Extension not appearing**: Check `package.json` syntax and command configuration
- **Build errors**: Run `npm run lint` to identify issues
- **TypeScript errors**: Ensure all types are properly imported from `@raycast/api`
- **Icon not showing**: Verify icon path in `package.json` and file exists in `assets/`

## 📚 Resources

- [Raycast API Documentation](https://developers.raycast.com/)
- [Extension Guidelines](https://manual.raycast.com/extensions)
- [Store Submission Guide](https://developers.raycast.com/basics/prepare-an-extension-for-store)
- [Community Discord](https://raycast.com/community)

## 📄 License

MIT - Feel free to use this template for your own extensions.

---

**Happy coding! 🚀** 

Remove this template content and replace with your extension's specific documentation once you've customized it.
