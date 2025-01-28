import Link from 'next/link'
import { Button } from './button'
import { History } from 'lucide-react'

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="font-semibold text-lg">
          Content Generator
        </Link>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            History
          </Button>
        </Link>
      </div>
    </nav>
  )
}
