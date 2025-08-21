# Raycast Extension Template - Setup Guide

This file contains instructions for converting this template into your own extension.

## Quick Setup Checklist

1. **Update Extension Metadata**
   - [ ] Change `name` in `package.json` to your extension name (kebab-case)
   - [ ] Update `title` in `package.json` to your extension's display name
   - [ ] Update `description` in `package.json` to describe what your extension does
   - [ ] Replace `your-raycast-username` with your actual Raycast username in `author` field
   - [ ] Update `categories` array with appropriate categories for your extension
   - [ ] Update `keywords` array with relevant search terms

2. **Configure Commands**
   - [ ] Update the `commands` array in `package.json` with your actual commands
   - [ ] Rename or replace the example command files in `src/`
   - [ ] Update command names, titles, and descriptions

3. **Customize Icon**
   - [ ] Replace `assets/command-icon.png` with your 512x512px extension icon
   - [ ] Ensure icon works well in both light and dark themes
   - [ ] Use [Raycast Icon Generator](https://icon.ray.so/) if needed

4. **Add Screenshots**
   - [ ] Add 3-6 screenshots to the `metadata/` folder
   - [ ] Screenshots should be 2000x1250px (16:10 aspect ratio) PNG files
   - [ ] Show key features and functionality of your extension

5. **Update Documentation**
   - [ ] Replace this `README.md` content with your extension's documentation
   - [ ] Include setup instructions if your extension requires configuration
   - [ ] Add usage examples and feature descriptions

6. **Clean Up Template Files**
   - [ ] Delete this `TEMPLATE.md` file
   - [ ] Remove example commands you don't need
   - [ ] Clean up unused utility functions

## Development Workflow

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Test Your Extension**
   - Open Raycast and test all commands
   - Verify error handling and edge cases
   - Test with different inputs and scenarios

4. **Build and Validate**
   ```bash
   npm run build
   npm run lint
   ```

5. **Prepare for Store**
   - Ensure all checklist items above are completed
   - Test the distribution build thoroughly
   - Follow [Raycast Store Guidelines](https://developers.raycast.com/basics/prepare-an-extension-for-store)

## Common Customizations

### Adding New Commands
1. Create a new `.tsx` file in `src/`
2. Add the command to `package.json` commands array
3. Export default function with your command logic

### Adding Dependencies
```bash
npm install your-package-name
```

### Windows-Specific Features
- Use utilities in `src/utils/windows.ts` for Windows system integration
- Use `src/utils/parsers.ts` for parsing configuration files
- See `src/list-command.tsx` for Windows command execution examples

### Environment Variables
If your extension needs configuration:
1. Document required environment variables in README
2. Use Raycast preferences for user configuration
3. Handle missing configuration gracefully

## Resources

- [Raycast API Documentation](https://developers.raycast.com/)
- [Extension Guidelines](https://manual.raycast.com/extensions)
- [Store Submission Guide](https://developers.raycast.com/basics/prepare-an-extension-for-store)
- [Community Discord](https://raycast.com/community)

## Template Structure

```
src/
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── index.ts       # Common utilities
│   ├── windows.ts     # Windows-specific functions
│   └── parsers.ts     # File parsing utilities
├── example-command.tsx # Detail view example
└── list-command.tsx   # List view example
```

**Remember to delete this file once you've customized your extension!**
