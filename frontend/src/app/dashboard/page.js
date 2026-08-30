"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardNav } from "../../components/layout/DashboardNav";
import { getCurrentUser, updateLocation } from "../../services/auth.service";
import { propertyService } from "../../services/property.service";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const response = await updateLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
            setUser((current) => ({ ...current, ...response.data?.data?.user }));
          } catch {
            // Ignore location permission failures gracefully.
          }
        },
        () => {
          // Ignore denied geolocation permission.
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }

    Promise.all([getCurrentUser(), propertyService.mine()])
      .then(([userResponse, propertyResponse]) => {
        setUser(userResponse.data?.data?.user);
        setProperties(propertyResponse.data?.data?.properties || []);
      })
      .catch(() => setError("Unable to load your seller workspace."));
  }, []);
  const verified = properties.filter(
    (property) => property.verificationStatus === "VERIFIED",
  ).length;
  const pending = properties.filter(
    (property) => property.listingStatus === "PENDING_VERIFICATION",
  ).length;
  return (
    <>
      <DashboardNav active="overview" />
      <main className="min-h-screen bg-[#fcf8fa] p-6 text-[#1b1b1d] lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-[#45474c]">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </p>
            <h1 className="mt-1 font-serif text-4xl">Seller Dashboard</h1>
            <p className="mt-2 text-[#45474c]">
              Manage your properties and track verification progress.
            </p>
          </div>
          <Link
            className="rounded bg-[#0453cd] px-5 py-3 text-center font-semibold text-white hover:bg-[#0040a2]"
            href="/dashboard/properties/new"
          >
            + New Listing
          </Link>
        </div>
        <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-[#c6c6cc] bg-white p-5">
            <span className="text-sm text-[#45474c]">Total Listings</span>
            <strong className="mt-3 block text-3xl">{properties.length}</strong>
          </div>
          <div className="rounded-lg border border-[#c6c6cc] bg-white p-5">
            <span className="text-sm text-[#45474c]">Under Verification</span>
            <strong className="mt-3 block text-3xl">{pending}</strong>
          </div>
          <div className="rounded-lg border border-[#c6c6cc] bg-white p-5">
            <span className="text-sm text-[#45474c]">Verified</span>
            <strong className="mt-3 block text-3xl">{verified}</strong>
          </div>
          <div className="rounded-lg border border-[#c6c6cc] bg-white p-5">
            <span className="text-sm text-[#45474c]">New Inquiries</span>
            <strong className="mt-3 block text-3xl">0</strong>
          </div>
        </section>
        <section className="mt-10 overflow-hidden rounded-lg border border-[#c6c6cc] bg-white">
          <div className="flex items-center justify-between border-b border-[#c6c6cc] p-5">
            <h2 className="text-xl font-semibold">Your Properties</h2>
            <Link
              className="text-sm font-semibold text-[#0453cd]"
              href="/dashboard/properties"
            >
              View all
            </Link>
          </div>
          {error && <p className="p-5 text-sm text-red-700">{error}</p>}
          {!error && properties.length === 0 && (
            <div className="p-10 text-center text-[#45474c]">
              <p>No listings yet.</p>
              <Link
                className="mt-4 inline-block font-semibold text-[#0453cd]"
                href="/dashboard/properties/new"
              >
                Create your first listing
              </Link>
            </div>
          )}
          {properties.map((property) => (
            <Link
              className="flex flex-col justify-between gap-4 border-b border-[#e5e2e3] p-5 transition hover:bg-[#f6f3f4] sm:flex-row sm:items-center"
              key={property._id}
              href={`/dashboard/properties/${property._id}`}
            >
              <div>
                <h3 className="font-semibold">{property.title}</h3>
                <p className="mt-1 text-sm text-[#45474c]">
                  {property.city || "Location pending"} -{" "}
                  {property.price
                    ? `$${property.price.toLocaleString()}`
                    : "Price pending"}
                </p>
              </div>
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0453cd]">
                {property.verificationStatus.replaceAll("_", " ")}
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
    </>
  );
}
