export function PropertyCard({ title = "Property listing" }) {
  return (
    <article className="border border-slate-200 p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Verification details will appear here.
      </p>
    </article>
  );
}
