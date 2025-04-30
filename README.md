# HookVault365 - Pattern Interrupt Hook Collection Tool

HookVault365 is a modern web application built with Astro and React that helps content creators collect, organize, and generate pattern interrupt hooks for their marketing content.

## Features

- User authentication system with demo access
- Modern, responsive UI design
- Hook management and organization
- Landing page with marketing content
- Secure API endpoints

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hookvault365.git
cd hookvault365
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

## Deployment

### Deploy to Vercel

This project is configured for easy deployment on Vercel.

1. Push your code to GitHub
2. Set up a new project on Vercel
3. Connect your GitHub repository
4. Set required environment variables in Vercel:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase API key

5. Deploy the project

Alternatively, using GitHub Actions:

1. Create the following secrets in your GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

2. Push to the main branch, and the deployment workflow will run automatically

## Project Structure

```
hookvault365/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── layouts/      # Astro layouts
│   ├── pages/        # Astro pages and API endpoints
│   │   ├── api/      # API routes
│   │   └── ...       # Page routes
│   ├── utils/        # Utility functions
│   └── styles/       # Global styles
├── astro.config.mjs  # Astro configuration
└── ...
```

## Authentication

The app includes a complete authentication system with:
- User registration
- User login
- Demo access for trying the app
- Secure session handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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
