import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tika",
  description: "Ticket-based Kanban board",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
