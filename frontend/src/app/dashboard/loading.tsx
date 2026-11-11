export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div role="status" className="flex flex-col items-center gap-3">
        <div className="size-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-medium text-muted-foreground">
          Loading your dashboard…
        </p>
      </div>
    </div>
  );
}
