import Image from 'next/image'
import Blog from './blog/page.js'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Blog></Blog>
    </main>
  )
}
