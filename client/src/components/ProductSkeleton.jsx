function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-56 bg-slate-200" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />

        <div className="flex justify-between pt-3">
          <div className="h-7 w-20 rounded bg-slate-200" />
          <div className="h-10 w-28 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default ProductSkeleton;
