import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { NicheFiltersProvider } from './contexts/NicheFiltersContext';
import ErrorBoundary from './components/ErrorBoundary';
import './utils/extensionPrevention';
import ChatWidget from './components/ChatWidget';

const jost = Jost({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SurveyHustler - Earn Money Filling Surveys",
  description: "SurveyHustler is a micro-task marketplace for academic research. Students earn cash by completing surveys. Researchers access targeted respondents at Covenant University.",
  keywords: "survey, earn money, Covenant University, research, students, marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="survey-app" content="true" />
      </head>
      <body className={jost.className}>
        <ErrorBoundary>
          <AuthProvider>
            <NicheFiltersProvider>
              {children}
              <ChatWidget />
            </NicheFiltersProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}