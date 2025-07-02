import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--zalama-bg)]", className)}
      {...props}
    />
  )
}

// Composants Skeleton spécialisés
export const CardSkeleton = () => (
  <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-4 border border-[var(--zalama-border)]">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center">
        <Skeleton className="h-6 w-6 mr-3" />
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
    <div className="space-y-2">
      <div>
        <div className="flex justify-between mb-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </div>
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--zalama-border)]">
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-14" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="px-6 py-3 text-right">
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--zalama-border)]">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="hover:bg-[var(--zalama-bg-lighter)]">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-24 rounded-full" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const StatsCardSkeleton = () => (
  <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  </div>
)

export const ResumeSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    {Array.from({ length: 3 }).map((_, index) => (
      <StatsCardSkeleton key={index} />
    ))}
  </div>
)

export { Skeleton }
