"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicFooter, PublicNav } from "../../../components/layout/PublicNav";
import { MediaGallery } from "../../../components/property/MediaGallery";
import { propertyService } from "../../../services/property.service";

const images = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJvozTVEbxPkPWAqTSnKPSlrVqf11XMBffGyMngi-emlZpGHLJzdMAOLJ9WkQiyFnz89325CCxH6UsFrtdN4uDBwPSoKIjtT9xZOgTXDTgnGTPvO_xB0vpsKGQYuTDvD0kXiB2Xrc1hDIBqfMIX6I_a_v6EcSbFY0C-c9NeOnPPA1T5Ip5iy0HzWVymzp1GF9n8qvKHKuYbS4hMCzv0GJrpDxh_cq38cMw5-w28pWhmRYj33ihBzHB",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCgIkJj5EWJGqixDD6pqQO5mdBSOsMbr7NnQoBP036h1_nP5ePXuZ0xLCi-Z5D1HK03u8jW18qG4Db5N1a4PPsY-F8FplnN-EbqFDVuukz5l2dt3R0Jj5YxdqcCLN6Uy0HZ5aHpx9e7d5XBqFZ2RqVHdXFhud9Nlq5pm84Ug9FDsI5NsXP6FTMtA7As33FySNZZjvYCbe3ofeZ-kQ0wT3GzhB4jKLvcFS_omWH-DiwFGOi-XB8mPXWQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAS81M1XtN0269eW96LemOBGuYuKsj6ZDkLtsahgwDzddlQe0xMjF6KSeiXeg9XiBRwAq9vnBAJYp8g3Yy_1OIM_RcdSIeVSj45bbw_-zbE54PU-cvtNr4OUZg5ZU2VUl0AsBHh50bCeM7iNPebiVy3fEI65iYOWW8FtXr3P_YUZhP7IH-kDPG09oHnqmnNpMEqdPblobvVCrRpZeEzgMblRovKA1_bZMBJEj35Z3vxxxrBM1XJfXyS",
];
export default function PropertyPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    propertyService
      .get(propertyId)
      .then((response) => setProperty(response.data?.data?.property || null))
      .catch(() => setProperty(null));
  }, [propertyId]);

  const lat = Number(property?.latitude);
  const lng = Number(property?.longitude);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const media = [...(property?.images || []), ...(property?.videos || [])];

  const title = property?.title || "The Glasshouse Retreat";
  const location =
    [property?.address, property?.city, property?.state, property?.country]
      .filter(Boolean)
      .join(", ") || "142 Luxury Lane, Beverly Hills, CA 90210";
  const price = property?.price
    ? `$${Number(property.price).toLocaleString()}`
    : "$4,250,000";

  return (
    <>
      <PublicNav active="buy" />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 text-[#1b1b1d] lg:px-10">
        <div className="rounded-xl border border-[#c6c6cc] bg-white p-3 shadow-sm">
          <MediaGallery media={media.length ? media : images} title={title} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              &#10003; BlockEstate Verified
            </span>
            <h1 className="mt-5 font-serif text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-3 text-lg text-[#45474c]">{location}</p>
            <div className="mt-5 text-4xl font-semibold">{price}</div>
            <div className="mt-8 grid grid-cols-2 gap-5 border-y border-[#c6c6cc] py-6 text-sm text-[#45474c] sm:grid-cols-5">
              <div>
                <span className="block">Beds</span>
                <strong className="text-lg text-black">4</strong>
              </div>
              <div>
                <span className="block">Baths</span>
                <strong className="text-lg text-black">4.5</strong>
              </div>
              <div>
                <span className="block">Area</span>
                <strong className="text-lg text-black">4,200 sqft</strong>
              </div>
              <div>
                <span className="block">Type</span>
                <strong className="text-lg text-black">Single Family</strong>
              </div>
              <div>
                <span className="block">Year</span>
                <strong className="text-lg text-black">2023</strong>
              </div>
            </div>
            {hasCoordinates && (
              <div className="mt-10 rounded-lg border border-[#c6c6cc] bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Property location</h2>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&marker=${lat},${lng}`}
                  style={{ width: "100%", height: 220, border: "none", borderRadius: 4 }}
                  title="Property location"
                />
              </div>
            )}
            <div className="mt-10 rounded-lg border border-[#c6c6cc] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">
                BlockEstate Verification
              </h2>
              <p className="mt-3 text-[#475569]">
                This property passed our four-point institutional verification
                process. Verified on Oct 24, 2024.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <strong className="block text-emerald-700">
                    &#10003; Physical Inspection
                  </strong>
                  <p className="mt-2 text-sm text-[#475569]">
                    On-site structural and condition assessment completed by
                    certified professionals.
                  </p>
                </div>
                <div>
                  <strong className="block text-emerald-700">
                    &#10003; Title &amp; Legal Docs
                  </strong>
                  <p className="mt-2 text-sm text-[#475569]">
                    Clear title confirmed, liens checked, and legal boundaries
                    verified.
                  </p>
                </div>
              </div>
              <button className="mt-6 font-semibold text-[#0052cc] hover:underline">
                Download Verification Report (PDF)
              </button>
            </div>
          </section>
          <aside>
            <div className="sticky top-24 rounded-lg border border-[#c6c6cc] bg-white p-6 shadow-sm">
              <div className="text-3xl font-semibold">{price}</div>
              <p className="mt-1 text-[#475569]">Est. $18,400/mo</p>
              <button className="mt-6 w-full rounded bg-[#0052cc] py-3 font-semibold text-white hover:bg-[#0040a2]">
                Contact Owner
              </button>
              <button className="mt-3 w-full rounded border border-[#c6c6cc] py-3 font-semibold hover:bg-[#f6f3f4]">
                Make an Offer
              </button>
              <button className="mt-3 w-full py-2 font-semibold text-[#0052cc]">
                Start Transaction Process
              </button>
              <div className="mt-6 border-t border-[#e5e2e3] pt-6">
                <h3 className="font-semibold">Seller Profile</h3>
                <p className="mt-3 font-semibold">EstateCorp LLC &#10003;</p>
                <p className="text-sm text-[#475569]">
                  100% Response Rate - Verified Seller
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
