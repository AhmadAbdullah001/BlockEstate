"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Eye,
  Home,
  LogOut,
  MapPin,
  Save,
  UploadCloud,
} from "lucide-react";
import { MediaGallery } from "../../components/property/MediaGallery";
import { propertyService } from "../../services/property.service";

const defaultLocation = { lat: 28.6139, lng: 77.209 };

const LocationMap = dynamic(
  async () => {
    const [{ MapContainer, Marker, TileLayer, useMapEvents }, { default: L }] = await Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]);

    const icon = L.icon({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    function DraggableMarker({ latitude, longitude, onPositionChange, map }) {
      const position = [
        Number(latitude) || defaultLocation.lat,
        Number(longitude) || defaultLocation.lng,
      ];

      const MapEvents = () => {
        useMapEvents({
          click(event) {
            onPositionChange(event.latlng.lat, event.latlng.lng);
          },
        });
        return null;
      };

      useEffect(() => {
        if (!map || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return;
        map.flyTo([Number(latitude), Number(longitude)], 15, {
          animate: true,
          duration: 0.7,
        });
      }, [map, latitude, longitude]);

      return (
        <>
          <MapEvents />
          <Marker
            draggable
            eventHandlers={{
              dragend(event) {
                const marker = event.target;
                const { lat, lng } = marker.getLatLng();
                onPositionChange(lat, lng);
              },
            }}
            icon={icon}
            position={position}
          />
        </>
      );
    }

    function MapComponent({ latitude, longitude, onPositionChange }) {
      const lat = Number(latitude) || defaultLocation.lat;
      const lng = Number(longitude) || defaultLocation.lng;
      const mapRef = useRef(null);

      useEffect(() => {
        if (!mapRef.current) return;
        mapRef.current.flyTo([lat, lng], 15, {
          animate: true,
          duration: 0.7,
        });
      }, [lat, lng]);

      return (
        <MapContainer
          center={[lat, lng]}
          className="h-72 w-full"
          ref={mapRef}
          scrollWheelZoom
          style={{ zIndex: 1 }}
          zoom={15}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker
            latitude={lat}
            longitude={lng}
            map={mapRef.current}
            onPositionChange={onPositionChange}
          />
        </MapContainer>
      );
    }

    return MapComponent;
  },
  {
    ssr: false,
    loading: () => <div className="flex h-72 w-full items-center justify-center bg-[#eef3ff] text-sm text-[#45474c]">Loading map...</div>,
  },
);

const steps = [
  ["Property Details", Building2],
  ["Location", MapPin],
  ["Features & Amenities", BadgeCheck],
  ["Media Upload", UploadCloud],
  ["Review Listing", Eye],
  ["Verification Fee", CreditCard],
];
const propertyTypes = [
  "House",
  "Apartment",
  "Villa",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
  "Other",
];
const initial = {
  title: "",
  description: "",
  propertyType: "House",
  price: "",
  year: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  floors: "",
  kitchenCount: "",
  livingRooms: "",
  diningRooms: "",
  balconies: "",
  builtUpArea: "",
  plotSize: "",
  frontage: "",
  zoning: "",
  businessType: "",
  furnishing: "",
  country: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  amenities: [],
  images: [],
  videos: [],
};
const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgZ4GILz0xm30RgMQmjEu8rIcYVGv54B9Iaw_9lLqoUMFd35155444GflrL5pfiPYCRD3SjAxomSC6p_GA9265-lE9mEpR4krLunMrVOYYAW28mstKKFdamYYDCS1pjU7oybHnhRdCu0T2LxEWGyAnqerlLD-FyC88RHia2zD1Sj7-fn-uA2MdUx6LeYbRwp2IbxHs2uD1kTaNPLH-g0aDmdGe2b0zNcVh4EnGhoYbcQ8NZdE3Cg7",
];
const input =
  "w-full rounded-lg border border-[#c6c6cc] bg-white px-4 py-3 text-base outline-none transition focus:border-[#0453cd] focus:ring-4 focus:ring-[#0453cd]/10 placeholder:text-[#76777d]";

function Field({ label, optional, children }) {
  return (
    <label className="block text-sm font-medium">
      <span className="mb-2 block">
        {label}{" "}
        {optional && (
          <span className="font-normal text-[#76777d]">(Optional)</span>
        )}
      </span>
      {children}
    </label>
  );
}

export default function ListingWizard({ initialStep = 0 }) {
  const router = useRouter();
  const completed = initialStep > steps.length - 1;
  const [step, setStep] = useState(Math.min(initialStep, steps.length - 1));
  const [propertyId, setPropertyId] = useState("");
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = sessionStorage.getItem("blockestate-listing");
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        setForm({ ...initial, ...(data.form || {}) });
        setPropertyId(data.propertyId || "");
      } catch {
        sessionStorage.removeItem("blockestate-listing");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const update = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };
  const asOptionalNumber = (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const payload = () => ({
    ...form,
    price: Number(form.price || 0),
    area: asOptionalNumber(form.area),
    bedrooms: asOptionalNumber(form.bedrooms),
    bathrooms: asOptionalNumber(form.bathrooms),
    parking: asOptionalNumber(form.parking),
    floors: asOptionalNumber(form.floors),
    kitchenCount: asOptionalNumber(form.kitchenCount),
    livingRooms: asOptionalNumber(form.livingRooms),
    diningRooms: asOptionalNumber(form.diningRooms),
    balconies: asOptionalNumber(form.balconies),
    builtUpArea: asOptionalNumber(form.builtUpArea),
    plotSize: asOptionalNumber(form.plotSize),
    frontage: asOptionalNumber(form.frontage),
    latitude: form.latitude === "" ? undefined : Number(form.latitude || 0),
    longitude: form.longitude === "" ? undefined : Number(form.longitude || 0),
    images: form.images.length ? form.images : fallbackImages,
    videos: form.videos || [],
  });
  const persist = (id = propertyId) =>
    sessionStorage.setItem(
      "blockestate-listing",
      JSON.stringify({ form, propertyId: id }),
    );
  async function saveDraft() {
    persist();
    if (!propertyId || !form.title || !form.price) return;
    setSaving(true);
    try {
      await propertyService.update(propertyId, payload());
    } catch (e) {
      setError(
        e.response?.data?.error?.message || "Unable to save this listing.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function uploadMedia(files) {
    if (!files.length) return;
    setError("");
    setSaving(true);
    try {
      const response = await propertyService.uploadImages(files);
      const uploadedMedia = response.data.data.images || [];
      const imageUrls = uploadedMedia.filter((url) => !/\.(mp4|webm|ogg|mov|avi|m4v)(\?.*)?$/i.test(url) && !/video/i.test(url));
      const videoUrls = uploadedMedia.filter((url) => /\.(mp4|webm|ogg|mov|avi|m4v)(\?.*)?$/i.test(url) || /video/i.test(url));

      setForm((current) => ({
        ...current,
        images: [...current.images, ...imageUrls],
        videos: [...current.videos, ...videoUrls],
      }));
    } catch (e) {
      setError(e.response?.data?.error?.message || "Unable to upload media.");
    } finally {
      setSaving(false);
    }
  }
  async function geocodeAddressFromForm() {
    const addressText = [
      form.address,
      form.city,
      form.state,
      form.pincode,
      form.country,
    ]
      .filter(Boolean)
      .join(", ")
      .trim();

    if (!addressText) {
      setError("Add the property address before locating it on the map.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await propertyService.geocode({
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
      });

      const coords = response.data?.data?.coordinates;
      if (!coords) {
        setError("We could not find this address on the map. Please confirm the address and adjust the pin manually.");
        return;
      }

      setForm((current) => ({
        ...current,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
    } catch (e) {
      setError(
        e.response?.data?.error?.message || "Unable to locate this address on the map.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function next() {
    setError("");
    if (step === 0 && (form.title.trim().length < 3 || !Number(form.price)))
      return setError(
        "Enter a listing title and a price greater than zero before continuing.",
      );
    if (
      step === 1 &&
      ["address", "city", "state", "country", "pincode"].some(
        (key) => !form[key].trim(),
      )
    )
      return setError("Complete all address fields before continuing.");
    setSaving(true);
    try {
      let id = propertyId;
      if (!id) {
        const response = await propertyService.create(payload());
        id = response.data.data.property._id;
        setPropertyId(id);
      } else {
        try {
          await propertyService.update(id, payload());
        } catch (e) {
          if (e.response?.status !== 404) throw e;
          const response = await propertyService.create(payload());
          id = response.data.data.property._id;
          setPropertyId(id);
        }
      }
      persist(id);
      setStep(step + 1);
      router.push(
        `/dashboard/properties/new/${["location", "amenities", "media", "review", "payment", "success"][step]}`,
      );
    } catch (e) {
      setError(
        e.response?.data?.error?.message || "Unable to save this listing step.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function submitListing() {
    if (!propertyId)
      return setError("Save the property details before submitting.");
    setSaving(true);
    setError("");
    try {
      try {
        await propertyService.submit(propertyId);
      } catch (e) {
        if (e.response?.status !== 404) throw e;
        const response = await propertyService.create(payload());
        const replacementId = response.data.data.property._id;
        setPropertyId(replacementId);
        await propertyService.submit(replacementId);
      }
      sessionStorage.removeItem("blockestate-listing");
      router.push("/dashboard/properties/new/success");
    } catch (e) {
      setError(
        e.response?.data?.error?.message || "Unable to submit property.",
      );
    } finally {
      setSaving(false);
    }
  }
  const card =
    "rounded-xl border border-[#c6c6cc] bg-white p-6 shadow-[0_2px_4px_rgba(11,18,32,.04)] md:p-8";
  const typeSpecificFields = {
    House: [
      ["Bedrooms", "bedrooms"],
      ["Bathrooms", "bathrooms"],
      ["Floors", "floors"],
      ["Kitchen Count", "kitchenCount"],
      ["Living Rooms", "livingRooms"],
      ["Dining Rooms", "diningRooms"],
      ["Balcony Count", "balconies"],
      ["Furnishing", "furnishing"],
    ],
    Apartment: [
      ["Bedrooms", "bedrooms"],
      ["Bathrooms", "bathrooms"],
      ["Floors", "floors"],
      ["Parking Spaces", "parking"],
      ["Built-up Area", "builtUpArea"],
      ["Furnishing", "furnishing"],
    ],
    Villa: [
      ["Bedrooms", "bedrooms"],
      ["Bathrooms", "bathrooms"],
      ["Floors", "floors"],
      ["Parking Spaces", "parking"],
      ["Balcony Count", "balconies"],
      ["Built-up Area", "builtUpArea"],
    ],
    Condo: [
      ["Bedrooms", "bedrooms"],
      ["Bathrooms", "bathrooms"],
      ["Floors", "floors"],
      ["Parking Spaces", "parking"],
      ["Built-up Area", "builtUpArea"],
    ],
    Townhouse: [
      ["Bedrooms", "bedrooms"],
      ["Bathrooms", "bathrooms"],
      ["Floors", "floors"],
      ["Parking Spaces", "parking"],
      ["Living Rooms", "livingRooms"],
    ],
    Land: [
      ["Plot Size (sqft)", "plotSize"],
      ["Frontage (ft)", "frontage"],
      ["Zoning", "zoning"],
      ["Land Use", "businessType"],
    ],
    Commercial: [
      ["Built-up Area", "builtUpArea"],
      ["Floors", "floors"],
      ["Parking Spaces", "parking"],
      ["Business Type", "businessType"],
    ],
    Other: [
      ["Structure Type", "zoning"],
      ["Area", "area"],
      ["Bedrooms", "bedrooms"],
      ["Bathrooms", "bathrooms"],
    ],
  };
  const title =
    completed
      ? "Property submitted successfully"
      : step === 0
      ? "Tell us about your property"
      : step === 1
        ? "Where is your property located?"
        : steps[step]?.[0] || "New Listing";
  const subtitle =
    completed
      ? "Your property has been submitted for verification. We will review your details shortly."
      : step === 0
      ? "Provide accurate details to ensure your listing attracts the right investors."
      : step === 1
        ? "Provide the exact address to help buyers locate your asset and verify its position."
        : "Complete this step to prepare your property for verification.";
  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d]">
      <header className="sticky top-0 z-30 border-b border-[#c6c6cc] bg-[#fcf8fa]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-6">
          <div className="flex items-center gap-8">
            <Link className="text-2xl font-black tracking-tight" href="/">
              BlockEstate
            </Link>
            <nav className="hidden gap-6 text-sm text-[#45474c] md:flex">
              <Link href="/properties">Marketplace</Link>
              <Link
                className="border-b-2 border-[#0453cd] pb-1 font-semibold text-[#0453cd]"
                href="/dashboard"
              >
                Portfolio
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="mr-2 hidden text-sm font-medium text-[#0453cd] md:block"
              href="/dashboard"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-10 px-5 py-8 lg:px-6 lg:py-10">
        <aside className="sticky top-24 hidden h-fit w-72 shrink-0 rounded-xl border border-[#c6c6cc] bg-[#f6f3f4] p-6 shadow-sm md:block">
          <h2 className="text-xl font-bold">New Listing</h2>
          <p className="mt-1 text-sm text-[#45474c]">
            Listing Progress: {Math.min((step + 1) * 20, 100)}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5e2e3]">
            <div
              className="h-full rounded-full bg-[#0453cd]"
              style={{ width: `${Math.min((step + 1) * 20, 100)}%` }}
            />
          </div>
          <nav className="mt-6 space-y-1">
            {steps.map(([label, Icon], index) => (
              <div
                className={`flex items-center gap-3 rounded-lg p-3 text-sm ${index === step ? "border border-[#0453cd]/20 bg-[#dae2ff]/50 font-semibold text-[#0453cd]" : index < step ? "text-[#45474c]" : "text-[#76777d]"}`}
                key={label}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${index < step ? "border-[#0453cd] bg-[#0453cd] text-white" : index === step ? "border-[#0453cd]" : "border-[#c6c6cc]"}`}
                >
                  {index < step ? <Check size={14} /> : <Icon size={14} />}
                </span>
                {label}
              </div>
            ))}
          </nav>
          <div className="mt-8 border-t border-[#c6c6cc] pt-5">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c6c6cc] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#f0edee] disabled:opacity-60"
              disabled={saving}
              onClick={saveDraft}
              type="button"
            >
              <Save size={17} />
              Save Draft
            </button>
            <div className="mt-5 space-y-2 border-t border-[#c6c6cc] pt-4 text-sm">
              <button className="flex items-center gap-2 text-[#45474c]">
                <CircleHelp size={17} />
                Support
              </button>
              <Link className="flex items-center gap-2 text-[#ba1a1a]" href="/">
                <LogOut size={17} />
                Logout
              </Link>
            </div>
          </div>
        </aside>
        <main className="min-w-0 max-w-3xl flex-1">
          <div className="mb-8">
            {!completed && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#0453cd] md:hidden">
                Step {step + 1} of 6
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-lg text-[#45474c]">{subtitle}</p>
          </div>
          {completed && (
            <section className={`${card} text-center`}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0052cc] text-white">
                <Check size={40} />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Property submitted successfully</h2>
              <p className="mx-auto mt-3 max-w-md text-[#45474c]">
                Your property has been submitted for verification. We will review your details shortly.
              </p>
              <Link
                className="mt-8 inline-flex rounded-lg bg-[#0052cc] px-6 py-3 font-semibold text-white hover:bg-[#0040a2]"
                href="/dashboard"
              >
                Go to Dashboard
              </Link>
            </section>
          )}
          {!completed && step === 0 && (
            <section className={card}>
              <div>
                <p className="mb-3 text-sm font-medium">Property Type</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {propertyTypes.map((type) => (
                    <button
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${form.propertyType === type ? "border-[#0453cd] bg-[#0453cd]/5 text-[#0453cd]" : "border-[#c6c6cc] text-[#45474c] hover:bg-[#f0edee]"}`}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          propertyType: type,
                        }))
                      }
                      type="button"
                      key={type}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 space-y-6">
                <Field label="Listing Title">
                  <input
                    className={input}
                    name="title"
                    onChange={update}
                    placeholder="Modern 3-bedroom villa with ocean view"
                    value={form.title}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className={`${input} resize-y`}
                    name="description"
                    onChange={update}
                    placeholder="Describe the key features, neighborhood, and unique selling points..."
                    rows="5"
                    value={form.description}
                  />
                </Field>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Price (USD)">
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[#45474c]">
                        $
                      </span>
                      <input
                        className={`${input} pl-8`}
                        name="price"
                        onChange={update}
                        placeholder="0.00"
                        type="number"
                        value={form.price}
                      />
                    </div>
                  </Field>
                  <Field label="Year Built" optional>
                    <input
                      className={input}
                      name="year"
                      onChange={update}
                      placeholder="YYYY"
                      type="number"
                      value={form.year}
                    />
                  </Field>
                </div>

                {typeSpecificFields[form.propertyType] && (
                  <div className="mt-8 rounded-xl border border-[#e5e2e3] bg-[#f6f3f4] p-5">
                    <h3 className="mb-4 text-lg font-semibold">{form.propertyType} details</h3>
                    <div className="grid gap-5 md:grid-cols-2">
                      {typeSpecificFields[form.propertyType].map(([label, fieldName]) => (
                        <Field key={fieldName} label={label} optional>
                          <input
                            className={input}
                            name={fieldName}
                            onChange={update}
                            placeholder={fieldName === "zoning" || fieldName === "businessType" || fieldName === "furnishing" ? "Enter value" : "0"}
                            type={
                              fieldName === "zoning" || fieldName === "businessType" || fieldName === "furnishing"
                                ? "text"
                                : "number"
                            }
                            value={form[fieldName] || ""}
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
          {!completed && step === 1 && (
            <div className="space-y-8">
              <section className={card}>
                <h2 className="text-xl font-semibold">Address Details</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <Field label="Country">
                    <div className="relative">
                      <select
                        className={`${input} appearance-none`}
                        name="country"
                        onChange={update}
                        value={form.country}
                      >
                        <option value="">Select Country</option>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>India</option>
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-3.5 text-[#76777d]"
                        size={18}
                      />
                    </div>
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Street Address">
                      <div className="relative">
                        <Home
                          className="absolute left-3 top-3.5 text-[#76777d]"
                          size={18}
                        />
                        <input
                          className={`${input} pl-10`}
                          name="address"
                          onChange={update}
                          placeholder="123 Main St, Apt 4B"
                          value={form.address}
                        />
                      </div>
                    </Field>
                  </div>
                  <Field label="City">
                    <input
                      className={input}
                      name="city"
                      onChange={update}
                      placeholder="San Francisco"
                      value={form.city}
                    />
                  </Field>
                  <Field label="State / Province">
                    <input
                      className={input}
                      name="state"
                      onChange={update}
                      placeholder="California"
                      value={form.state}
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      className={input}
                      name="pincode"
                      onChange={update}
                      placeholder="94105"
                      value={form.pincode}
                    />
                  </Field>
                </div>

                <div className="mt-6 rounded-xl border border-[#dfe7ff] bg-[#f6f8ff] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Map location</h3>
                      <p className="text-sm text-[#45474c]">
                        Find the exact spot and drag the pin to the right location.
                      </p>
                    </div>
                    <button
                      className="rounded-lg bg-[#0453cd] px-4 py-2 text-sm font-medium text-white hover:bg-[#003da3] disabled:opacity-60"
                      disabled={saving}
                      onClick={geocodeAddressFromForm}
                      type="button"
                    >
                      Find on map
                    </button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-[#c6c6cc] bg-white">
                    <LocationMap
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onPositionChange={(lat, lng) => {
                        setForm((current) => ({
                          ...current,
                          latitude: Number(lat),
                          longitude: Number(lng),
                        }));
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-[#dfe7ff] bg-[#edf3ff] px-3 py-2 text-sm text-[#1d3a6d]">
                    <span>
                      Marker: {Number(form.latitude || 0).toFixed(5)}, {Number(form.longitude || 0).toFixed(5)}
                    </span>
                    <button
                      className="rounded-md bg-[#0453cd] px-3 py-1.5 font-medium text-white hover:bg-[#003da3]"
                      onClick={() => setError("")}
                      type="button"
                    >
                      Confirm location
                    </button>
                  </div>

                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <Field label="Latitude">
                      <input
                        className={input}
                        name="latitude"
                        onChange={(event) => {
                          const value = event.target.value;
                          setForm((current) => ({
                            ...current,
                            latitude: value === "" ? "" : Number(value),
                          }));
                        }}
                        placeholder="28.6139"
                        step="any"
                        type="number"
                        value={form.latitude}
                      />
                    </Field>
                    <Field label="Longitude">
                      <input
                        className={input}
                        name="longitude"
                        onChange={(event) => {
                          const value = event.target.value;
                          setForm((current) => ({
                            ...current,
                            longitude: value === "" ? "" : Number(value),
                          }));
                        }}
                        placeholder="77.2090"
                        step="any"
                        type="number"
                        value={form.longitude}
                      />
                    </Field>
                  </div>
                </div>
              </section>
              <div className="rounded-xl border border-[#dae2ff] bg-[#f6f8ff] p-4 text-sm text-[#45474c]">
                Your address will be saved with this listing when you continue.
              </div>
            </div>
          )}
          {!completed && step === 2 && (
            <section className={card}>
              <h2 className="text-xl font-semibold">
                What does your property offer?
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  "Swimming Pool",
                  "Parking",
                  "Garden",
                  "Balcony",
                  "Gym",
                  "Security",
                  "Elevator",
                  "Air Conditioning",
                ].map((amenity) => (
                  <button
                    className={`rounded-lg border p-4 text-sm font-medium ${form.amenities.includes(amenity) ? "border-[#0453cd] bg-blue-50 text-[#0453cd]" : "border-[#c6c6cc]"}`}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        amenities: current.amenities.includes(amenity)
                          ? current.amenities.filter(
                              (value) => value !== amenity,
                            )
                          : [...current.amenities, amenity],
                      }))
                    }
                    type="button"
                    key={amenity}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </section>
          )}
          {!completed && step === 3 && (
            <section className={card}>
              <h2 className="text-xl font-semibold">
                Show buyers your property
              </h2>
              <p className="mt-2 text-[#45474c]">
                Upload high-quality photos. Storage integration will save them
                permanently in the next phase.
              </p>
              <input
                className="mt-6 block w-full rounded-lg border-2 border-dashed border-[#c6c6cc] p-10 text-sm"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska"
                disabled={saving}
                multiple
                onChange={(event) =>
                  uploadMedia(Array.from(event.target.files || []))
                }
                type="file"
              />
            </section>
          )}
          {!completed && step === 4 && (
            <section className={card}>
              <h2 className="text-xl font-semibold">Review your property</h2>
              <div className="mt-6 overflow-hidden rounded-xl border border-[#c6c6cc] bg-[#f6f3f4] p-3">
                <MediaGallery
                  media={[...(form.images || []), ...(form.videos || [])]}
                  title={form.title || "Property preview"}
                />
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Title", form.title],
                  ["Type", form.propertyType],
                  ["Price", `$${form.price}`],
                  ["Address", `${form.address}, ${form.city}, ${form.state}`],
                  ["Type Details", Object.entries({
                    bedrooms: form.bedrooms,
                    bathrooms: form.bathrooms,
                    floors: form.floors,
                    kitchenCount: form.kitchenCount,
                    livingRooms: form.livingRooms,
                    builtUpArea: form.builtUpArea,
                    plotSize: form.plotSize,
                    zoning: form.zoning,
                    businessType: form.businessType,
                    furnishing: form.furnishing,
                  }).filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== 0).map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}: ${value}`).join(" | ") || "No extra details"],
                  ["Amenities", form.amenities.join(", ") || "None selected"],
                  ["Photos", `${(form.images.length || 0) + (form.videos.length || 0) || 1} files`],
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-[#f6f3f4] p-4" key={label}>
                    <dt className="text-xs uppercase tracking-wider text-[#76777d]">
                      {label}
                    </dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {!completed && step === 5 && (
            <section className={card}>
              <h2 className="text-xl font-semibold">
                Complete your submission
              </h2>
              <p className="mt-3 text-[#45474c]">
                A verification fee will be required before the review process
                begins.
              </p>
              <div className="mt-6 rounded-lg bg-blue-50 p-5 text-[#0040a2]">
                <strong>Verification fee</strong>
                <p className="mt-1">$499.00 + applicable processing fee</p>
              </div>
            </section>
          )}
          {!completed && error && (
            <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
          {!completed && <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-[#c6c6cc] pt-6 sm:flex-row sm:items-center">
            <button
              className="rounded-lg border border-[#c6c6cc] bg-white px-6 py-3 text-sm font-medium hover:bg-[#f0edee]"
              onClick={() =>
                step ? (setStep(step - 1), router.back()) : saveDraft()
              }
              type="button"
            >
              {step ? "Back" : "Save Draft"}
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0052cc] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0040a2] disabled:opacity-60"
              disabled={saving}
              onClick={step === 5 ? submitListing : next}
              type="button"
            >
              {saving
                ? "Saving..."
                : step === 5
                  ? "Pay & Submit Property"
                  : "Continue"}
              <ArrowRight size={18} />
            </button>
          </div>}
        </main>
      </div>
    </div>
  );
}
