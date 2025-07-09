import { ApertureIcon, PhoneIcon, EnvelopeIcon } from '@phosphor-icons/react/dist/ssr';

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <ApertureIcon className="block size-6" />
      <span className="text-foreground font-mono text-sm font-bold tracking-wider uppercase -mb-0.25">
        ACME Co
      </span>
    </div>
  );
}

export default async function Page() {
  return (
    <div>
      {/* Dummy app header */}
      <header className="fixed top-0 left-0 z-50 h-18 w-full flex flex-row justify-center p-6 bg-bg3">
        <div className="w-full px-2 max-w-4xl flex justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Product", "Contact"].map(label => (
              <span
                key={label}
                className="text-foreground font-mono text-sm font-bold tracking-wider uppercase hover:text-fgAccent hover:underline select-none"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Dummy app contents */}
      <div className="mx-auto my-auto mt-18 pt-4 px-2 max-w-4xl flex flex-col gap-4">
        <div className="h-[320px] border border-dashed border-fg4" />
        <div className="flex gap-4">
          <div className="h-[320px] border border-dashed border-fg4 grow shrink" />
          <div className="h-[320px] border border-dashed border-fg4 grow shrink" />
          <div className="h-[320px] border border-dashed border-fg4 grow shrink" />
        </div>
        <div className="h-[320px] border border-dashed border-fg4" />

        <div className="flex justify-between gap-8 border-t border-t-seperator1 py-8">
          <div>
            <Logo />
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-4 min-w-[120px]">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-fg3">Product</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Camera</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Aperture</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Light Box</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Backdrop</span>
            </div>
            <div className="flex flex-col gap-4 min-w-[120px]">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-fg3">Resources</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Camera</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Aperture</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Light Box</span>
              <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">Backdrop</span>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-fg3">Support</span>

              {/* Inline livekit embed */}
              <div className="h-[64px]">
                <iframe
                  className="w-[330px]"
                  src="/embed"
                />
              </div>

              <div className="flex gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <PhoneIcon size={20} />
                  <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">
                    555-123-4567
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon size={20} />
                  <span className="flex gap-2 items-baseline text-sm cursor-pointer hover:underline">
                    support@acme.co
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
