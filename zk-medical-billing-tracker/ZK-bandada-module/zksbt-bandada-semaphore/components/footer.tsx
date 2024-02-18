import ViewSourceCode from "./viewSourceCode"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-20 py-5 border-t-2 bg-slate-100 flex items-center justify-center space-x-5">
      <div>
        <Link href="/about" className="text-blue-600 hover:underline">
          About
        </Link>
      </div>
      <div>&#8226;</div>
      <div>
        <ViewSourceCode />
      </div>
    </footer>
  )
}
