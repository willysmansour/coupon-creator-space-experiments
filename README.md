# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/df5289f0-8e73-4575-87cf-e111381883d0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/df5289f0-8e73-4575-87cf-e111381883d0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
cp env.example .env
# Edit .env file with your Supabase credentials

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)
- React Query (State Management)

## Code Quality Improvements

This codebase has been optimized with:

### Security
- ✅ Environment variables for sensitive data (Supabase keys)
- ✅ Proper .gitignore configuration
- ✅ Type-safe configuration

### TypeScript
- ✅ Strict TypeScript configuration enabled
- ✅ Enhanced type checking rules
- ✅ Better null checking

### Code Quality
- ✅ Improved ESLint rules
- ✅ Unused variable detection
- ✅ Console log warnings
- ✅ Prefer const enforcement

### Error Handling
- ✅ Error Boundary component for graceful error handling
- ✅ Better loading states with dedicated components
- ✅ Improved authentication flow with error handling

### User Experience
- ✅ Loading spinners and states
- ✅ Better feedback during authentication
- ✅ Graceful error recovery options

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/df5289f0-8e73-4575-87cf-e111381883d0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
