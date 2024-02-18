import Header from "./header"
import Footer from "./footer"
import Head from "next/head"

export default function Layout({ children }: any) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>Feedback</title>
        <meta name="title" content="Feedback" />
        <meta name="description" content="Bandada-Semaphore demo app" />
        <meta name="theme-color" content="#3b82f6" />
      </Head>

      <div className="flex flex-col min-h-screen text-slate-900">
        <Header />
        <main className="mb-auto px-2">{children}</main>
        <Footer />
      </div>
    </>
  )
}
