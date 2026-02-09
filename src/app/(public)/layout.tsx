export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      {children}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-body text-xs text-zinc-400">
        Desenvolvido por{" "}
        <span className="font-medium text-zinc-500">@menux</span>
      </p>
    </div>
  );
}
