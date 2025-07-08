import type { Metadata } from 'next';
import './globals.css';
import './lib/envSetup';

/**
 * Metadata for the application, including title and description.
 */
export const metadata: Metadata = {
  title: 'Realtime API Agents',
  description: 'A demo app from OpenAI.',
};

/**
 * The root layout component for the application.
 * It sets up the basic HTML structure and includes global styles.
 *
 * @param children The child components to be rendered within the layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
