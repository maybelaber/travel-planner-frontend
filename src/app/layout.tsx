import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Planner',
  description: 'Plan your travel projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
