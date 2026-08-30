import Link from "next/link";
import { PublicFooter, PublicNav } from "../components/layout/PublicNav";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC90JLujQBUrUMUnnTnQuU21AdkMvebxkiqvba5utYjabHqH--07CR9RjbgvisLwGIYDtYXo_v1LM6rBla4K_OkVVIatkLQlUZCfYm3CejBr7oVK2zdTzsozyGOuaDnScnQopzxCepMdQadDOWOXu0eLwOmbEGIWpYuiQsFIYhhoZpKj4oW-2QyBpnnTOgwtcrUbxJQyUpFIHNXLPgMNbjh6Rds4oHgkBpqb4F2s4C929fYUldEzUlV";
const featured = [
  {
    title: "The Glasshouse Penthouse",
    location: "1200 Skyline Blvd, Metropolis",
    price: "$4,850,000",
    beds: "4",
    baths: "4.5",
    area: "4,200 sqft",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtbimdqu-K8PPOBWg-w9GPKe_EQNvYeB9c6HE3Inz3jskFSWWtPGdaBxCISP0XnYsp2HIkcBbk3PyJjP5z9N9N8m4yY51lUZUmFtOV1B62RuZo83KpvvSb-xptG4ZMFhQNKXrktki_a29RK4o8WlTwGPHZrz6yjes1YCAoOT5jEGxOd20HK1PxmONR586WfhVDBxH7jrVy61ocYVH1jrAM7wABMY2UWuSXnf7zXDTgGo8dAxBsXY80",
  },
  {
    title: "Modern Urban Retreat",
    location: "45 West End Ave",
    price: "$1,250,000",
    beds: "3",
    baths: "2",
    area: "1,800 sqft",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJN0MzeAzlFBfOxITGzcRT245thcM3soT-Z_QKEp_SWqxjY9YfCFsdBCa46H4mB4nC3nHAIcduHja8-8MLa4ctSd15cyR5srL2OOtoyt75aCNN1vSTTPVlOprCLFeP0afTrjnFDGxR2tueJzeyhE8RaK93CTILdNUy7hG4dp8R8yHhybmg5ea3D-uAeGSuIcYCnVD88dr2ftOfLgMk92h_f9G293-LNf05wU6c3CniDPwz3sCWtua1",
  },
];

export default function Home() {
  return (
    <>
      <PublicNav />
      <main className="pt-[72px]">
        <section className="relative flex min-h-[760px] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
          <img
            src={heroImage}
            alt="Modern luxury villa overlooking the ocean"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#fcf8fa]/55 backdrop-blur-[2px]" />
          <div className="relative z-10 max-w-4xl">
            <h1 className="font-serif text-5xl font-medium leading-tight text-black sm:text-7xl">
              Real Estate, Verified
              <br />
              From The Ground Up.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#45474c]">
              Discover verified properties and move from finding a home to
              completing the transaction with less friction.
            </p>
            <div className="mt-10 rounded-xl border border-[#c6c6cc] bg-white/95 p-4 text-left shadow-xl backdrop-blur">
              <div className="mb-3 flex gap-2">
                <button className="rounded-md bg-[#0453cd] px-4 py-2 text-sm font-semibold text-white">
                  Buy
                </button>
                <Link
                  className="rounded-md px-4 py-2 text-sm text-[#45474c] hover:bg-[#f0edee]"
                  href="/signup"
                >
                  Sell
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
                <label className="rounded-lg border border-[#c6c6cc] p-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#76777d]">
                    Location
                  </span>
                  <input
                    className="mt-2 w-full border-0 p-0 text-sm outline-none"
                    placeholder="City, neighborhood, or zip"
                  />
                </label>
                <label className="rounded-lg border border-[#c6c6cc] p-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#76777d]">
                    Property Type
                  </span>
                  <select className="mt-2 w-full border-0 p-0 text-sm outline-none">
                    <option>Any type</option>
                    <option>Single family</option>
                    <option>Condo</option>
                  </select>
                </label>
                <label className="rounded-lg border border-[#c6c6cc] p-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#76777d]">
                    Price Range
                  </span>
                  <select className="mt-2 w-full border-0 p-0 text-sm outline-none">
                    <option>Any price</option>
                    <option>Under $1M</option>
                    <option>$1M - $2M</option>
                  </select>
                </label>
                <Link
                  className="flex min-h-14 items-center justify-center rounded-lg bg-[#0052cc] px-6 font-semibold text-white hover:bg-[#0040a2]"
                  href="/properties"
                >
                  Search Properties
                </Link>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-14 flex flex-wrap justify-center gap-10">
            <div>
              <strong className="block text-4xl font-semibold">5,000+</strong>
              <span className="text-xs uppercase tracking-wider text-[#45474c]">
                Verified Properties
              </span>
            </div>
            <div>
              <strong className="block text-4xl font-semibold">$2.4B</strong>
              <span className="text-xs uppercase tracking-wider text-[#45474c]">
                Transaction Volume
              </span>
            </div>
            <div>
              <strong className="block text-4xl font-semibold">100%</strong>
              <span className="text-xs uppercase tracking-wider text-[#45474c]">
                Title Clarity
              </span>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl text-black sm:text-4xl">
                Featured Verified Properties
              </h2>
              <p className="mt-2 text-[#45474c]">
                Exceptional homes, cleared for seamless transaction.
              </p>
            </div>
            <Link
              className="hidden text-sm font-semibold text-[#0453cd] md:block"
              href="/properties"
            >
              View All Properties -&gt;
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-12">
            {featured.map((property, index) => (
              <Link
                href={`/properties/${index + 1}`}
                className={`group relative min-h-[360px] overflow-hidden rounded-xl border border-[#c6c6cc] shadow-sm ${index === 0 ? "lg:col-span-8 lg:min-h-[440px]" : "lg:col-span-4"}`}
                key={property.title}
              >
                <img
                  src={property.image}
                  alt={property.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                  &#10003; Verified
                </div>
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="text-xl font-semibold">{property.title}</h3>
                  <p className="mt-1 text-sm text-white/80">
                    {property.location}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span>{property.beds} beds</span>
                    <span>{property.baths} baths</span>
                    <span>{property.area}</span>
                  </div>
                  <strong className="mt-3 block text-2xl">
                    {property.price}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
