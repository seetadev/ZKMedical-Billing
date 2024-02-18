import Link from "next/link"

export default function Header() {
  return (
    <header className="flex flex-wrap justify-between p-5 mb-5">
      <Link
        href="/"
        className="text-xl md:mb-auto mb-5 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        Feedback
      </Link>
      <a
        href={`${process.env.NEXT_PUBLIC_BANDADA_DASHBOARD_URL}/groups/off-chain/${process.env.NEXT_PUBLIC_BANDADA_GROUP_ID}`}
        className="flex space-x-1 text-blue-600 hover:underline"
        target="_blank"
        rel="noreferrer noopener nofollow"
      >
        <span>Bandada group</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-external-link"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </header>
  )
}
