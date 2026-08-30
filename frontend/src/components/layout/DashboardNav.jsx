import Link from "next/link";

export function DashboardNav({ active = "overview" }) {
  const links = [
    ["Overview", "/dashboard", "overview"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#c6c6cc] bg-[#fcf8fa]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-6">
        <div className="flex items-center gap-8">
          <Link className="font-serif text-xl font-semibold text-black" href="/">
            BlockEstate
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([label, href, key]) => (
              <Link
                className={`rounded-md px-3 py-2 text-sm transition ${active === key ? "font-semibold text-[#0453cd]" : "text-[#45474c] hover:bg-[#f0edee] hover:text-black"}`}
                href={href}
                key={key}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-[#c6c6cc] bg-white px-3 py-2 text-sm font-medium text-[#1b1b1d] hover:bg-[#f0edee]"
            href="/dashboard/properties/new"
          >
            + New Listing
          </Link>
        </div>
      </div>
    </header>
  );
}
