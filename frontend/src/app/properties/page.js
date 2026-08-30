"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicNav } from "../../components/layout/PublicNav";
import { propertyService } from "../../services/property.service";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProperties = async () => {
      try {
        const params = {};
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
            });
          }).catch(() => null);

          if (position) {
            params.lat = position.coords.latitude;
            params.lng = position.coords.longitude;
            params.radiusKm = 50;
          }
        }

        const response = await propertyService.list(params);
        if (!active) return;
        setProperties(response.data?.data?.properties || []);
      } catch {
        if (!active) return;
        setError("Unable to load properties right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProperties();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PublicNav active="buy" />
      <main className="flex min-h-screen bg-[#fcf8fa] pt-[72px] text-[#1b1b1d]">
        <aside className="hidden w-72 shrink-0 border-r border-[#c6c6cc] bg-white p-6 xl:block">
          <h2 className="text-lg font-semibold">Filter Properties</h2>
          <label className="mt-6 block text-sm font-semibold">
            Location
            <input
              className="mt-2 w-full rounded border border-[#c6c6cc] px-3 py-2 font-normal"
              placeholder="City or zip"
            />
          </label>
          <fieldset className="mt-6 space-y-3 text-sm">
            <legend className="mb-2 font-semibold">Property Type</legend>
            {[
              "Single Family",
              "Condo / Co-op",
              "Multi-Family",
              "Commercial",
            ].map((type) => (
              <label className="flex gap-2" key={type}>
                <input type="checkbox" defaultChecked={type !== "Commercial"} />
                {type}
              </label>
            ))}
          </fieldset>
          <label className="mt-6 block text-sm font-semibold">
            Price Range
            <div className="mt-2 flex gap-2">
              <input
                className="w-1/2 rounded border border-[#c6c6cc] px-2 py-2 font-normal"
                placeholder="Min"
              />
              <input
                className="w-1/2 rounded border border-[#c6c6cc] px-2 py-2 font-normal"
                placeholder="Max"
              />
            </div>
          </label>
          <label className="mt-6 flex items-center gap-2 rounded border border-[#c6c6cc] bg-[#f6f3f4] p-3 text-sm font-medium">
            <input type="checkbox" defaultChecked />
            &#10003; BlockEstate Verified
          </label>
        </aside>
        <section className="min-w-0 flex-1 p-6 lg:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-[#c6c6cc] pb-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-4xl">Marketplace</h1>
              <p className="mt-2 text-[#45474c]">
                {properties.length} Verified Properties Available
              </p>
            </div>
            <select className="rounded border border-[#c6c6cc] bg-white px-3 py-2 text-sm">
              <option>Newest Listed</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

          {!error && loading && (
            <div className="mt-6 text-[#45474c]">Loading properties...</div>
          )}

          {!error && !loading && properties.length === 0 && (
            <div className="mt-6 rounded border border-[#c6c6cc] bg-white p-6 text-[#45474c]">
              No verified properties are available right now.
            </div>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => {
              const image = property.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80";
              const locationText = [property.address, property.city, property.state].filter(Boolean).join(", ") || "Location pending";
              const priceText = property.price ? `$${Number(property.price).toLocaleString()}` : "Price pending";
              const beds = property.bedrooms || 0;
              const baths = property.bathrooms || 0;
              const area = property.area ? `${Number(property.area).toLocaleString()} sqft` : "Area pending";

              return (
                <Link
                  href={`/properties/${property._id}`}
                  className="group overflow-hidden rounded-xl border border-[#c6c6cc] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  key={property._id}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={image}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold">
                      &#10003; Verified
                    </span>
                    <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-lg">
                      &#9825;
                    </span>
                  </div>
                  <div className="p-4">
                    <strong className="text-xl">{priceText}</strong>
                    <h2 className="mt-2 font-semibold">{property.title}</h2>
                    <p className="mt-1 line-clamp-1 text-sm text-[#45474c]">
                      {locationText}
                    </p>
                    <div className="mt-4 flex justify-between border-t border-[#e5e2e3] pt-3 text-sm text-[#45474c]">
                      <span>{beds} beds</span>
                      <span>{baths} baths</span>
                      <span>{area}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
