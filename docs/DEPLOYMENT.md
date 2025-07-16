# 🚀 Deployment Guide

This guide provides detailed instructions for deploying the Bank Statement Converter SaaS application, both for local development and to Vercel for production.

## 💻 Local Development Deployment

Setting up the project for local development allows you to run and test the application on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 18 or higher. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** or **Yarn**: Node.js comes with npm. If you prefer Yarn, you can install it via `npm install -g yarn`.
-   **Supabase Account**: A free account is sufficient for development. Sign up at [supabase.com](https://supabase.com/).

### Steps

1.  **Clone the Repository**:
    Open your terminal or command prompt and clone the project repository:
    ```bash
    git clone https://github.com/yourusername/bank-statement-converter.git
    cd bank-statement-converter
    ```

2.  **Install Dependencies**:
    Navigate into the project directory and install the required Node.js packages:
    ```bash
    npm install
    # or if you use yarn
    # yarn install
    ```

3.  **Set Up Supabase Credentials**:
    The application requires Supabase credentials to connect to its backend services (database, authentication, storage).
    -   Go to your Supabase project dashboard.
    -   Navigate to `Project Settings` > `API`.
    -   Locate your `Project URL` and `anon public` key.
    -   Create a new file named `.env.local` in the root of your project directory. You can copy the example file:
        ```bash
        cp env.example .env.local
        ```
    -   Open `.env.local` and populate it with your Supabase credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        NEXT_PUBLIC_APP_URL=http://localhost:3000
        NEXT_PUBLIC_APP_NAME="Bank Statement Converter"
        ```
        Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual credentials.

4.  **Set Up Database Schema**:
    The application uses a PostgreSQL database managed by Supabase. You need to set up the necessary tables and Row Level Security (RLS) policies.
    -   In your Supabase dashboard, go to `SQL Editor`.
    -   Run the SQL commands provided in the `docs/ARCHITECTURE.md` file under the "Database Schema" section. This will create the `users` and `files` tables and configure RLS.

5.  **Run the Development Server**:
    Once all dependencies are installed and environment variables are set, start the Next.js development server:
    ```bash
    npm run dev
    # or if you use yarn
    # yarn dev
    ```
    The application will typically start on `http://localhost:3000`. Open this URL in your web browser to view the application.

## ☁️ Vercel Deployment

Vercel is the recommended platform for deploying Next.js applications due to its seamless integration, automatic scaling, and serverless functions.

### Prerequisites

-   **GitHub Account**: Your project code should be hosted on GitHub (or GitLab/Bitbucket).
-   **Vercel Account**: Sign up for a free Vercel account at [vercel.com](https://vercel.com/).

### Steps

1.  **Push Your Code to GitHub**:
    Ensure your project is pushed to a GitHub repository. Vercel will connect directly to your repository.

2.  **Connect Your Repository to Vercel**:
    -   Log in to your Vercel dashboard.
    -   Click on "Add New..." > "Project".
    -   Select your Git provider (e.g., GitHub) and choose the repository for your Bank Statement Converter project.
    -   Vercel will automatically detect that it's a Next.js project and pre-configure the build settings.

3.  **Configure Environment Variables**:
    This is a crucial step for Vercel deployments. Your Supabase credentials must be securely configured in the Vercel project settings.
    -   In your Vercel project settings, navigate to `Settings` > `Environment Variables`.
    -   Add the following environment variables:
        -   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (from Supabase dashboard).
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase `anon public` key (from Supabase dashboard).
        -   `NEXT_PUBLIC_APP_URL`: The production URL of your Vercel deployment (e.g., `https://your-app-name.vercel.app`).
        -   `NEXT_PUBLIC_APP_NAME`: (Optional) The name of your application.
    -   Ensure these are marked as "Production" (and "Development" if you plan to use Vercel for preview deployments).

4.  **Deploy**:
    -   After configuring the environment variables, Vercel will automatically trigger a new deployment.
    -   Subsequent pushes to your connected Git branch (typically `main` or `master`) will automatically trigger new deployments, providing a continuous deployment workflow.

### Vercel-Specific Considerations

-   **Serverless Functions**: Next.js API routes (`app/api/convert/route.ts`) are automatically deployed as serverless functions on Vercel, scaling automatically with demand.
-   **Edge Network**: Vercel deploys your application to its global Edge Network, providing fast load times for users worldwide.
-   **Automatic SSL**: Vercel automatically provides and renews SSL certificates for your deployments.
-   **Custom Domains**: You can easily configure custom domains for your Vercel project through the dashboard.
-   **Monitoring**: Vercel provides built-in analytics and logging for your deployments, accessible from your dashboard.

### Deploy to Other Platforms

The application is built with Next.js, making it highly portable. It can be deployed to any platform that supports Next.js applications, such as:

-   **Railway**: `railway up`
-   **Render**: Connect GitHub repository
-   **Netlify**: `netlify deploy`
-   **AWS Amplify**: Connect repository

Refer to the documentation of your chosen platform for specific deployment instructions.
