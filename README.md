# HookVault365

A static web application that displays and helps you search through 365 hook sentences, filterable by niche and tone. Perfect for marketers, copywriters, and content creators looking for pattern interrupt swipe files.

## Features

- 📊 Display 365 hook sentences
- 🔍 Powerful search with Fuse.js fuzzy matching
- 🏷️ Filter by niche, tone, and length
- 📋 Copy hooks to clipboard with one click
- 🔄 Update hooks from Google Sheets

## Tech Stack

- [Astro](https://astro.build/) - Static site generation with React islands
- [React](https://reactjs.org/) - UI components
- [Fuse.js](https://fusejs.io/) - Client-side fuzzy search

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hookVault365
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`

## Build for Production

```bash
npm run build
```

The static site will be generated in the `dist` directory.

## Updating Hooks

The application uses a `hooks.json` file in the public directory to store all hook data.

### Automatic update from Google Sheets

1. Create a Google Sheet with the following columns:
   - `id` (numeric)
   - `text` (the hook sentence)
   - `niche` (marketing, health, fitness, etc.)
   - `tone` (curious, urgent, authoritative, etc.)
   - `length` (short, medium, long)

2. Make the Google Sheet publicly accessible for reading (File > Share > Anyone with the link > Viewer)

3. Get the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

4. Run the update script:
   ```bash
   npm run update YOUR_SHEET_ID_HERE
   ```

### Manual update

You can also manually edit the `public/hooks.json` file. The structure should follow this format:

```json
[
  {
    "id": 1,
    "text": "Hook sentence text",
    "niche": "marketing",
    "tone": "curious",
    "length": "medium"
  },
  ...
]
```

## Deployment

This is a static site that can be deployed to any hosting platform:

- Netlify
- Vercel
- GitHub Pages
- Any static web hosting

## License

This project is licensed under the MIT License.

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
