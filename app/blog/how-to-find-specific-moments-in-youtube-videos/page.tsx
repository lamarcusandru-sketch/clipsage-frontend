import Image from "next/image";
import Link from "next/link";

export default function BlogPost() {
  return (
    <main style={styles.page}>
      
      {/* NAV */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoWrap}>
            <Image src="/logo.png" alt="ClipSage Logo" width={140} height={40} />
          </div>

          <nav style={styles.nav}>
            <Link href="/" style={styles.navLink}>How It Works</Link>
            <Link href="/" style={styles.navLink}>Features</Link>
            <Link href="/pricing" style={styles.navLink}>Pricing</Link>
            <Link href="#" style={styles.navLink}>Blog</Link>
            <Link href="/" style={styles.button}>Try ClipSage</Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <article style={styles.container}>
        
        <div style={styles.badge}>BLOG</div>

        <h1 style={styles.title}>
          How to Find Specific Moments in YouTube Videos (Without Wasting Hours)
        </h1>

        <p style={styles.meta}>
          By ClipSage • April 30, 2026 • 8 min read
        </p>

        <p style={styles.lead}>
          For decades, finding specific moments inside video content has been a nightmare for creators.
        </p>

        <p>
          <strong>Finding the exact moment you need inside a video.</strong>
        </p>

        <p>It sounds simple. It never has been.</p>

        {/* TOC */}
        <div style={styles.toc}>
          <h4 style={styles.tocTitle}>In this article</h4>
          <ul style={styles.tocList}>
            <li>The Problem That Never Got Solved</li>
            <li>Why It’s Been So Hard</li>
            <li>The Old Way (And Why It Fails)</li>
            <li>The Shift: Searching Inside Video</li>
            <li>Why This Matters</li>
            <li>Try It Yourself</li>
          </ul>
        </div>

        <h2>The Problem That Never Got Solved</h2>
        <p>
          This has been a problem for decades — from DVDs to YouTube to modern podcasts.
        </p>

        <ul>
          <li>You scrub timelines blindly</li>
          <li>You rely on vague timestamps</li>
          <li>You rewatch entire sections</li>
          <li>You hope someone already clipped it</li>
        </ul>

        <p>
          <strong>We solved streaming. We solved distribution. We never solved navigation.</strong>
        </p>

        <h2>Why It’s Been So Hard</h2>
        <p>
          Video is locked behind time. Unlike text, you can’t instantly scan it.
        </p>

        <ul>
          <li>Transcripts are unreliable</li>
          <li>They’re hard to search properly</li>
          <li>They don’t map cleanly to moments</li>
        </ul>

        <h2>The Old Way (And Why It Fails)</h2>
        <ol>
          <li>Watch everything</li>
          <li>Scrub and guess</li>
          <li>Clip manually</li>
          <li>Repeat</li>
        </ol>

        <p><strong>It doesn’t scale.</strong></p>

        <h2>The Shift: Searching Inside Video</h2>
        <p>
          Now you can treat video like something you search — not something you sit through.
        </p>

        <p>
          Type what you’re looking for and jump straight to the moment.
        </p>

        <h2>Why This Matters</h2>
        <ul>
          <li>Post faster</li>
          <li>Find better clips</li>
          <li>Stay consistent</li>
        </ul>

        <p><strong>Speed is leverage.</strong></p>

        <h2>Try It Yourself</h2>
        <p>
          👉 <a href="https://www.clipsage.org" style={styles.link}>Try ClipSage</a>
        </p>

        <h2>Final Thought</h2>
        <p>
          This problem existed for decades. Now it’s solved.
        </p>

      </article>
    </main>
  );
}

/* STYLES */

const styles: any = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },

  headerInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
  },

  nav: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },

  navLink: {
    textDecoration: "none",
    color: "#374151",
    fontSize: "14px",
  },

  button: {
    background: "#111827",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
  },

  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
    background: "#ffffff",
    borderRadius: "12px",
    paddingBottom: "40px",
  },

  badge: {
    display: "inline-block",
    background: "#e0edff",
    color: "#2563eb",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    marginBottom: "20px",
  },

  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#111827",
  },

  meta: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "20px",
  },

  lead: {
    fontSize: "18px",
    marginBottom: "10px",
  },

  toc: {
    background: "#f1f5f9",
    padding: "20px",
    borderRadius: "10px",
    margin: "30px 0",
  },

  tocTitle: {
    marginBottom: "10px",
  },

  tocList: {
    paddingLeft: "20px",
    lineHeight: "1.8",
  },

  link: {
    color: "#2563eb",
    textDecoration: "underline",
  },
};