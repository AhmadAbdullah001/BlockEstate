"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardNav } from "../../../components/layout/DashboardNav";
import { propertyService } from "../../../services/property.service";

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    propertyService
      .mine()
      .then((response) => {
        setProperties(response.data?.data?.properties || []);
      })
      .catch(() => setError("Unable to load your listings."));
  }, []);

  return (
    <>
      <DashboardNav active="properties" />
      <main className="min-h-screen bg-[#fcf8fa] p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-4xl">My properties</h1>
            <Link
              className="rounded bg-[#0453cd] px-4 py-3 font-semibold text-white"
              href="/dashboard/properties/new"
            >
              New Listing
            </Link>
          </div>
          <p className="mt-3 text-[#45474c]">
            Manage listings and verification progress from your seller workspace.
          </p>

          {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

          <div className="mt-8 space-y-4">
            {properties.length === 0 && !error && (
              <div className="rounded border border-[#c6c6cc] bg-white p-6 text-[#45474c]">
                No listings yet.
              </div>
            )}

            {properties.map((property) => (
              <Link
                key={property._id}
                href={`/dashboard/properties/${property._id}`}
                className="flex flex-col gap-4 rounded-xl border border-[#c6c6cc] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center"
              >
                <div className="h-24 w-full overflow-hidden rounded-lg bg-[#f2f2f3] md:w-36">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#45474c]">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{property.title}</h2>
                  <p className="mt-1 text-sm text-[#45474c]">
                    {property.city || "Location pending"} • {property.price ? `$${Number(property.price).toLocaleString()}` : "Price pending"}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0453cd]">
                  {property.verificationStatus?.replaceAll("_", " ") || "DRAFT"}
                </span>
              </Link>
            ))}
          </div>

          <Link
            className="mt-8 inline-block font-semibold text-[#0453cd]"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    </>
  );
}
