# Learn German App 🇩🇪

A comprehensive React-based application designed to help users learn German from A1 to B2 levels. This app leverages AI technologies to provide personalized learning experiences, including vocabulary building, grammar explanations, reading comprehension, and writing practice.

## Features 🚀

-   **AI-Powered Learning**: Integrates DeepSeek AI for generating dynamic exercises and providing detailed feedback.
-   **Vocabulary Trainer**: Extensive vocabulary lists for different levels (A1-B2) with examples.
-   **Grammar Guide**: Interactive grammar lessons and exercises.
-   **Skill Practice**: dedicated sections for Reading ("Lesen"), Writing ("Schreiben"), Listening ("Hören"), and Speaking ("Sprechen").
-   **Quizzes & Tests**: Model tests simulating real exam conditions.
-   **Progress Tracking**: Monitor your daily goals and learning streak.
-   **Text-to-Speech**: Integrated Google TTS for pronunciation practice.

## Prerequisites 📋

Before you begin, ensure you have the following installed:
-   **Node.js** (v14 or higher)
-   **npm** (usually comes with Node.js)

## Installation 🛠️

1.  Clone the repository (if you haven't already):
    ```bash
    git clone <repository-url>
    cd learn-german-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration ⚙️

Create a `.env` file in the root directory of the project to store your API keys. You can start by copying the example file:

```bash
cp .env.example .env
```

Or create it manually and add the following variables:

```env
# Required for AI features (vocabulary generation, writing feedback, etc.)
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Required for Text-To-Speech functionality
REACT_APP_GOOGLE_TTS_API_KEY=your_google_cloud_api_key_here

# Required for some data fetching features
REACT_APP_GITHUB_ACCESS_TOKEN=your_github_token_here
```

> **Note**: This file is ignored by git to keep your secrets safe. Never commit your `.env` file.

## Running the App 🏃‍♂️

### Local Development
To run the app on your local machine:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

### Running on Other Devices (Same Network) 📱
To access the app from your phone or tablet connected to the same Wi-Fi network:

1.  Make sure your computer and mobile device are on the **same Wi-Fi network**.

2.  Start the app with the host configuration (already configured in `package.json`):
    ```bash
    npm start
    ```

3.  Find your computer's local IP address:
    -   **Mac**: Open Terminal and type `ipconfig getifaddr en0` (or check System Settings > Wi-Fi > Details).
    -   **Windows**: Open Command Prompt and type `ipconfig`. Look for "IPv4 Address".
    -   **Linux**: Open Terminal and type `hostname -I`.

4.  On your mobile device, open a browser and navigate to:
    ```
    http://<YOUR_LOCAL_IP>:3000
    ```
    *Example: `http://192.168.1.5:3000`*

## Built With 🛠️
-   [React](https://reactjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Material UI](https://mui.com/)
-   [DeepSeek API](https://deepseek.com/)
