import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Find Specific Moments in YouTube Videos | ClipSage',
  description:
    'Learn how to find specific moments inside long YouTube videos, podcasts, interviews, and creator content faster with ClipSage.',
  alternates: {
    canonical:
      'https://www.clipsage.org/blog/how-to-find-specific-moments-in-youtube-videos',
  },
  openGraph: {
    title: 'How to Find Specific Moments in YouTube Videos',
    description:
      'Stop scrubbing through long videos. ClipSage helps creators, editors, and researchers find exact moments inside YouTube content.',
    url: 'https://www.clipsage.org/blog/how-to-find-specific-moments-in-youtube-videos',
    siteName: 'ClipSage',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Find Specific Moments in YouTube Videos',
    description:
      'Find exact moments inside YouTube videos, podcasts, and interviews faster with ClipSage.',
  },
}

export default function BlogPost() {
  return (
    <main className="bg-black text-white min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* LOGO */}
        <div className="mb-10 flex justify-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ClipSage Logo"
              width={180}
              height={60}
              priority
            />
          </Link>
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-6 text-center leading-tight">
          How to Find Specific Moments in YouTube Videos (Without Wasting Hours)
        </h1>

        {/* HERO IMAGE */}
        <div className="mb-8">
          <Image
            src="/blog/scrubbing-timeline.jpg"
            alt="Scrubbing through a long YouTube timeline"
            width={1200}
            height={600}
            className="rounded-xl"
          />
        </div>

        {/* INTRO */}
        <p className="text-lg text-gray-300 mb-6">
          For decades, finding a specific moment inside a YouTube video has been
          a slow, frustrating mess.
        </p>

        <p className="text-lg text-gray-300 mb-6">
          You drag the timeline. You guess timestamps. You skip forward. You miss
          it. You go back. Repeat.
        </p>

        <p className="text-lg text-gray-300 mb-10">
          If you’re a creator, editor, or researcher — you already know the pain.
        </p>

        {/* SECTION */}
        <h2 className="text-2xl font-semibold mb-4">
          The Old Way (And Why It’s Broken)
        </h2>

        <div className="mb-6">
          <Image
            src="/blog/youtube-timeline.jpg"
            alt="YouTube timeline scrubbing frustration"
            width={1200}
            height={600}
            className="rounded-xl"
          />
        </div>

        <p className="text-gray-300 mb-6">
          YouTube was never built for precision search inside videos. It’s built
          for discovery — not extraction.
        </p>

        <ul className="list-disc list-inside text-gray-300 mb-10 space-y-2">
          <li>No true transcript search (reliable or fast)</li>
          <li>No clip-level navigation</li>
          <li>No way to find exact quotes quickly</li>
        </ul>

        <p className="text-gray-300 mb-10">
          So creators have been stuck doing things the hard way… for years.
        </p>

        {/* SECTION */}
        <h2 className="text-2xl font-semibold mb-4">
          The New Way: Search Inside Videos
        </h2>

        <div className="mb-6">
          <Image
            src="/blog/search-interface.jpg"
            alt="Searching inside video content"
            width={1200}
            height={600}
            className="rounded-xl"
          />
        </div>

        <p className="text-gray-300 mb-6">
          This is where ClipSage comes in.
        </p>

        <p className="text-gray-300 mb-6">
          Instead of searching videos… you search moments inside them.
        </p>

        <ul className="list-disc list-inside text-gray-300 mb-10 space-y-2">
          <li>Type what you're looking for</li>
          <li>Get exact clips</li>
          <li>Jump directly to the moment</li>
        </ul>

        {/* SECTION */}
        <h2 className="text-2xl font-semibold mb-4">
          Why This Changes Everything
        </h2>

        <div className="mb-6">
          <Image
            src="/blog/content-creation.jpg"
            alt="Content creator editing clips"
            width={1200}
            height={600}
            className="rounded-xl"
          />
        </div>

        <p className="text-gray-300 mb-6">
          This isn’t just convenience. It’s leverage.
        </p>

        <ul className="list-disc list-inside text-gray-300 mb-10 space-y-2">
          <li>Find viral clips instantly</li>
          <li>Pull quotes without rewatching hours</li>
          <li>Create short-form content faster</li>
          <li>Research smarter</li>
        </ul>

        <p className="text-gray-300 mb-10">
          What used to take hours… now takes seconds.
        </p>

        {/* CTA */}
        <div className="bg-yellow-400 text-black p-6 rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">
            Try ClipSage Now
          </h3>
          <p className="mb-4">
            Stop scrubbing. Start finding.
          </p>
          <Link
            href="/"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold inline-block"
          >
            Search Clips Now
          </Link>
        </div>

        {/* FOOTER SPACING */}
        <div className="h-16" />

      </div>
    </main>
  )
}