import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Search Inside a YouTube Video | ClipSage',
  description:
    'Learn how to search inside YouTube videos and find exact moments instantly. Stop scrubbing through hours of content.',
  alternates: {
    canonical:
      'https://www.clipsage.org/blog/how-to-search-inside-a-youtube-video',
  },
  openGraph: {
    title: 'How to Search Inside a YouTube Video',
    description:
      'Stop scrubbing through videos. Find exact moments instantly with ClipSage.',
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
    <main className="bg-white text-black min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 mb-2">BLOG</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            How to Search Inside a YouTube Video (Without Wasting Hours)
          </h1>
          <p className="text-gray-600">
            By ClipSage • 5 min read
          </p>
        </div>

        {/* INTRO */}
        <p className="text-lg text-gray-700 mb-6">
          For as long as online video has existed, one problem has quietly drained time,
          energy, and sanity:
        </p>

        <p className="text-xl font-semibold mb-6">
          Finding the exact moment you need inside a video.
        </p>

        <p className="text-gray-700 mb-10">
          Whether you're watching on{' '}
          <a href="https://www.youtube.com" target="_blank" className="text-blue-600 underline">
            YouTube
          </a>{' '}
          or analyzing long-form content, the process is painfully slow.
        </p>

        {/* SECTION */}
        <h2 className="text-2xl font-bold mb-4">
          1. The Problem That Never Got Solved
        </h2>

        <p className="text-gray-700 mb-4">
          Let’s be honest — this isn’t new.
        </p>

        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>You scrub through timelines blindly</li>
          <li>You rely on vague timestamps</li>
          <li>You rewatch entire sections</li>
          <li>You hope someone already clipped it</li>
        </ul>

        <p className="text-gray-700 mb-10">
          Even with platforms like{' '}
          <a href="https://www.google.com" target="_blank" className="text-blue-600 underline">
            Google
          </a>{' '}
          indexing the web instantly, video content remains locked behind time.
        </p>

        {/* SECTION */}
        <h2 className="text-2xl font-bold mb-4">
          2. Why It’s Been So Hard to Fix
        </h2>

        <p className="text-gray-700 mb-6">
          Video isn’t text. It’s linear.
        </p>

        <ul className="list-disc list-inside text-gray-700 mb-10 space-y-2">
          <li><strong>Transcripts are unreliable</strong></li>
          <li><strong>Search inside video is limited</strong></li>
          <li><strong>No true clip-level indexing</strong></li>
        </ul>

        {/* SECTION */}
        <h2 className="text-2xl font-bold mb-4">
          3. The Old Way (And Why It Fails)
        </h2>

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div>
            <p className="font-semibold">Watch Everything</p>
            <p className="text-sm text-gray-600">Hours of content</p>
          </div>
          <div>
            <p className="font-semibold">Scrub & Guess</p>
            <p className="text-sm text-gray-600">Timeline roulette</p>
          </div>
          <div>
            <p className="font-semibold">Clip Manually</p>
            <p className="text-sm text-gray-600">Slow editing</p>
          </div>
          <div>
            <p className="font-semibold">Repeat</p>
            <p className="text-sm text-gray-600">Again and again</p>
          </div>
        </div>

        <p className="text-gray-700 mb-10">
          It’s slow. It’s exhausting. And worst of all — it doesn’t scale.
        </p>

        {/* SECTION */}
        <h2 className="text-2xl font-bold mb-4">
          4. The Shift: Searching Inside Video
        </h2>

        <p className="text-gray-700 mb-6">
          Now here’s where things change.
        </p>

        <p className="text-gray-700 mb-6">
          Instead of treating video like something you watch through, you treat it like something you can search.
        </p>

        <p className="text-gray-700 mb-10">
          That’s exactly what <strong>ClipSage</strong> does.
        </p>

        {/* STEPS */}
        <h2 className="text-2xl font-bold mb-4">
          5. How to Search Inside a YouTube Video (Step-by-Step)
        </h2>

        <ol className="list-decimal list-inside text-gray-700 mb-10 space-y-2">
          <li>Go to ClipSage</li>
          <li>Type your search query</li>
          <li>Browse matching clips</li>
          <li>Click and jump instantly</li>
        </ol>

        {/* INTERNAL LINK */}
        <p className="mb-10">
          Want a deeper breakdown?{' '}
          <Link href="/blog/how-to-find-specific-moments-in-youtube-videos" className="text-blue-600 underline">
            Learn how to find specific moments in YouTube videos
          </Link>
        </p>

        {/* CTA */}
        <div className="bg-gray-100 p-8 rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">
            Try ClipSage
          </h3>
          <p className="mb-4 text-gray-700">
            Stop scrubbing. Start finding.
          </p>
          <a
            href="/"
            className="bg-black text-white px-6 py-3 rounded-lg inline-block"
          >
            Search Clips Now
          </a>
        </div>

      </div>
    </main>
  )
}