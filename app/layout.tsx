import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FoodRescue - Sharing Good Food Together',
  description: 'Connect food providers with NGOs and shelters to share available food and strengthen communities.',
  keywords: 'food rescue, food donation, available food, NGO, food sharing, hunger relief',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50">
          {children}
        </div>
      </body>
    </html>
  )
}
