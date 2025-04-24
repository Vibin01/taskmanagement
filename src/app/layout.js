import Header from "@/components/Header";
import "./globals.css";

export const metadata = {
  title: "Task Managemnt",
  description: "Task Management App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
