export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#171616' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm">Loading...</p>
      </div>
    </div>
  );
}
