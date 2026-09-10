import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import Loading from "./loading";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Routh Agent",
  description: "Advanced AI Agent",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Script id="fb-init" strategy="lazyOnload">
            {`
              window.fbAsyncInit = function() {
                FB.init({
                  appId      : '${process.env.NEXT_PUBLIC_META_APP_ID}',
                  cookie     : true,
                  xfbml      : true,
                  version    : 'v21.0'
                });
              };
            `}
          </Script>
          <Script
            src="https://connect.facebook.net/es_LA/sdk.js"
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
          <ThemeProvider>
            <ClerkLoading>
              <Loading />
            </ClerkLoading>
            <ClerkLoaded>
              {children}
            </ClerkLoaded>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
