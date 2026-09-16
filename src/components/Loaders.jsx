export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-7 h-7', xl: 'w-10 h-10' }
  return (
    <span
      className={`loader-spinner ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading</span>
    </span>
  )
}

export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return <span aria-hidden="true" className={`loader-skeleton ${rounded} ${className}`} />
}

export function TableSkeletonRows({ count = 5, columns = 7 }) {
  return (
    <>
      {Array.from({ length: count }, (_, row) => (
        <tr key={row} aria-hidden="true">
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className="px-5 py-4">
              <Skeleton className={column === 0 ? 'h-4 w-32' : column === columns - 1 ? 'h-5 w-16 ml-auto' : 'h-4 w-20'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm" aria-hidden="true">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9" rounded="rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading list">
      <span className="sr-only">Loading list</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-xl" aria-hidden="true">
          <Skeleton className="w-10 h-10" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessageSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading messages">
      <span className="sr-only">Loading messages</span>
      {Array.from({ length: count }, (_, index) => {
        const mine = index % 2 === 1
        return <div key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`} aria-hidden="true"><Skeleton className={`h-12 ${mine ? 'w-2/3' : 'w-3/5'}`} rounded="rounded-2xl" /></div>
      })}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F2FB] gap-4" role="status" aria-live="polite">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border border-purple-100">
        <img src="/logo.png" alt="Shmeta" className="w-full h-full object-contain" />
      </div>
      <Spinner size="lg" />
      <span className="sr-only">Loading application</span>
    </div>
  )
}
