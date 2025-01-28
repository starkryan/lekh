import { Plus_Jakarta_Sans } from "next/font/google"
import './globals.css'
import type { Metadata } from 'next'


const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta'
})

export const metadata: Metadata = {
  title: "Likhni - AI Content Generator | Create Professional Content Instantly",
  description: "Transform your content creation with Likhni's AI-powered platform. Generate professional emails, engaging YouTube scripts, and more in seconds. Experience smarter, faster content generation.",
  keywords: [
    "AI content generator",
    "email generator",
    "YouTube script generator",
    "AI writing assistant",
    "content creation",
    "professional email writer",
    "video script generator",
    "content automation",
    "AI writing tool",
    "business communication",
    "content optimization",
    "automated content creation"
  ],
  authors: [
    {
      name: "Your Name",
      url: "https://github.com/yourusername",
    },
  ],
  creator: "Your Name",
  metadataBase: new URL("https://likhni.com"),
  alternates: {
    canonical: "https://likhni.com",
    languages: {
      'en-US': 'https://likhni.com',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://likhni.com",
    title: "Likhni - AI Content Generator | Create Professional Content Instantly",
    description: "Transform your content creation with Likhni's AI-powered platform. Generate professional emails, engaging YouTube scripts, and more in seconds.",
    siteName: "Likhni",
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Likhni AI Content Generator',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Likhni - AI Content Generator | Professional Content in Seconds",
    description: "Transform your content creation with Likhni's AI-powered platform. Generate professional emails, engaging YouTube scripts, and more instantly.",
    creator: "@yourusername",
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Likhni",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Transform your content creation with Likhni's AI-powered platform. Generate professional emails, engaging YouTube scripts, and more in seconds.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1000"
              },
              "featureList": [
                "AI-powered email generation",
                "YouTube script creation",
                "Professional content writing",
                "Business communication tools"
              ]
            })
          }}
        />
      </head>
      <body className={jakarta.className}>
    
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}