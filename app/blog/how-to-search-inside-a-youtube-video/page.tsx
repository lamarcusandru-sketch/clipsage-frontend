import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Search Inside a YouTube Video | ClipSage',
  description:
    'Learn how to search inside YouTube videos and find exact moments instantly. No more scrubbing through hours of content.',
  alternates: {
    canonical:
      'https://www.clipsage.org/blog/how-to-search-inside-a-youtube-video',
  },
  openGraph: {
    title: 'How to Search Inside a YouTube Video',
    description:
      'Stop scrubbing through videos. Learn how to search inside YouTube videos and jump to exact moments instantly.',
    url: 'https://www.clipsage.org/blog/how-to-search-inside-a-youtube-video',
    siteName: 'ClipSage',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Search Inside a YouTube Video',
    description:
      'Find exact moments inside YouTube videos without wasting time.',
  },
}

export default function BlogPost() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">
        How to Search Inside a YouTube Video
      </h1>

      <p className="mb-4 text-lg">
        Searching inside a YouTube video should be simple.
      </p>

      <p className="mb-4">
        But it’s not. If you’ve ever tried to find a specific moment in a long
        video, you already know how frustrating it can be.
      </p>

      <p className="mb-6">
        You drag the timeline, guess timestamps, skip forward, miss it, rewind…
        and repeat.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Why YouTube Search Falls Short
      </h2>

      <p className="mb-4">
        YouTube is great for discovering videos — but not for searching inside
        them.
      </p>

      <ul className="list-disc list-inside mb-6">
        <li>No fast way to search for exact phrases</li>
        <li>No reliable transcript navigation</li>
        <li>No clip-level results</li>
      </ul>

      <p className="mb-6">
        That’s why finding a single quote or moment can take way longer than it
        should.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        How to Search Inside a YouTube Video (Step-by-Step)
      </h2>

      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>Go to ClipSage</li>
        <li>Type what you’re looking for</li>
        <li>Browse matching clips</li>
        <li>Click and jump directly to that moment</li>
      </ol>

      <p className="mb-6">
        Instead of searching for videos, you’re searching for moments inside
        them.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Why This Matters for Creators
      </h2>

      <ul className="list-disc list-inside mb-6">
        <li>Find clips faster</li>
        <li>Create content more efficiently</li>
        <li>Pull quotes instantly</li>
        <li>Save hours of editing time</li>
      </ul>

      <p className="mb-6">
        What used to take hours can now take seconds.
      </p>

      {/* INTERNAL LINK */}
      <p className="mb-6">
        Want a deeper breakdown?{' '}
        <Link
          href="/blog/how-to-find-specific-moments-in-youtube-videos"
          className="text-blue-600 underline"
        >
          Learn how to find specific moments in YouTube videos
        </Link>
        .
      </p>

      <div className="border p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-2">
          Try ClipSage
        </h3>
        <p className="mb-4">
          Stop scrubbing. Start finding.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-black text-white rounded-lg"
        >
          Search Clips Now
        </a>
      </div>
    </main>
  )
}