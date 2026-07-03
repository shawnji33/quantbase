export default function Template({ children }: { children: React.ReactNode }) {
  // Re-mounts on every route change, so this animation fires on page navigation.
  return (
    <div className="animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none">
      {children}
    </div>
  )
}
