# LinkedIn Post Editor

LinkedIn Post Editor is a web application built with [Next.js](https://nextjs.org) that allows users to create, format, and optimize LinkedIn posts. The app provides features like hashtag suggestions, formatting tools, and analytics to help users craft engaging content for LinkedIn.

## Features

- **Hashtag Suggestions**: Automatically extract and suggest hashtags based on the content of your post.
- **Formatting Tools**: Easily apply bold, italic, and other text styles.
- **Analytics Integration**: Track user interactions and events.
- **PDF Export**: Export your LinkedIn posts as PDFs using `html2pdf.js`.
- **Tailwind CSS**: Styled with Tailwind CSS for a modern and responsive design.

## Live 

Check out the live version of the LinkedIn Post Formatter here:

[https://linkedin-post-formatter-8tcn.vercel.app](https://linkedin-post-formatter-8tcn.vercel.app)

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Begiba/linkedin-post-formatter.git
   cd linkedin-post-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Development Server

Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### Build for Production

To build the app for production:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## Technologies Used

- **Next.js**: React framework for building server-side rendered and static web applications.
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework.
- **html2pdf.js**: Library for exporting content as PDFs.
- **Radix UI**: Accessible UI components.

## Folder Structure

- `app/`: Contains the main application logic and components.
  - `components/`: Reusable UI components.
  - `globals.css`: Global styles.
  - `layout.tsx`: Application layout.
  - `page.tsx`: Main page of the app.
- `components/ui/`: UI-specific components like buttons and cards.
- `lib/`: Utility functions.
- `public/`: Static assets.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the app.


