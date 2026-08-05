export function HeroBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#ebbeba3c] dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">

      {/* Radial Glow Top-Right */}
      <div 
        className="absolute -top-20 -right-20 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-color-1, rgba(201,127,122,0.18)) 0%, transparent 70%)' }} 
      />
      {/* Radial Glow Bottom-Left */}
      <div 
        className="absolute -bottom-10 -left-10 w-[400px] h-[340px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, var(--glow-color-2, rgba(201,127,122,0.12)) 0%, transparent 70%)' }} 
      />

      {/* Decorative Outer Rings Top-Right */}
      <div className="absolute -top-24 -right-24 w-96 h-96 border-[55px] border-brand/20 dark:border-brand/30 rounded-full pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-60 h-60 border-[10px] border-brand/10 dark:border-brand/20 rounded-full pointer-events-none" />

      {/* Decorative Outer Rings Bottom-Left */}
      <div className="absolute bottom-28 -left-14 w-52 h-52 border-[28px] border-black/5 dark:border-white/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-36 -left-4 w-32 h-32 border-[6px] border-black/[0.035] dark:border-white/[0.05] rounded-full pointer-events-none" />

      {/* Dashed Arc */}
      <svg className="absolute right-0 top-1/3 w-32 h-64 pointer-events-none opacity-30 dark:opacity-40" viewBox="0 0 128 256" fill="none">
        <path d="M 128 8 A 120 120 0 0 1 128 248" className="stroke-brand" strokeWidth="1.5" strokeDasharray="6 6" />
      </svg>

      {/* Dot Pattern - Top Left */}
      <div 
        className="absolute top-8 left-6 w-44 h-36 pointer-events-none opacity-[0.13] dark:opacity-[0.2] rounded"
        style={{ 
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
          backgroundSize: '12px 12px' 
        }} 
      />
      
      {/* Dot Pattern - Bottom Right */}
      <div 
        className="absolute bottom-8 right-6 w-52 h-40 pointer-events-none opacity-[0.13] dark:opacity-[0.2] rounded text-black dark:text-white"
        style={{ 
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
          backgroundSize: '12px 12px' 
        }} 
      />

      {/* Repeating Linear Gradient - Top Right */}
      <div 
        className="absolute top-0 right-0 w-40 h-28 pointer-events-none opacity-[0.07] dark:opacity-[0.12] text-black dark:text-white"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', 
          backgroundSize: '8px 8px' 
        }} 
      />

      {/* Repeating Linear Gradient - Bottom Left */}
      <div 
        className="absolute bottom-0 left-0 w-40 h-28 pointer-events-none opacity-[0.07] dark:opacity-[0.12] text-black dark:text-white"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', 
          backgroundSize: '8px 8px' 
        }} 
      />

      {/* Diagonal Line Accents - Top Right */}
      <svg className="absolute top-0 right-0 w-24 h-24 pointer-events-none" viewBox="0 0 96 96" fill="none">
        <line x1="96" y1="0" x2="36" y2="60" className="stroke-brand" strokeWidth="1" opacity="0.2" />
        <line x1="96" y1="20" x2="56" y2="60" className="stroke-brand" strokeWidth="1" opacity="0.15" />
        <line x1="76" y1="0" x2="16" y2="60" className="stroke-brand" strokeWidth="1" opacity="0.1" />
      </svg>

      {/* Diagonal Line Accents - Bottom Left */}
      <svg className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none" viewBox="0 0 96 96" fill="none">
        <line x1="0" y1="96" x2="60" y2="36" className="stroke-brand" strokeWidth="1" opacity="0.2" />
        <line x1="0" y1="76" x2="40" y2="36" className="stroke-brand" strokeWidth="1" opacity="0.15" />
        <line x1="20" y1="96" x2="80" y2="36" className="stroke-brand" strokeWidth="1" opacity="0.1" />
      </svg>

      {/* Side Border Bar - Left */}
      <div className="absolute left-0 top-1/3 pointer-events-none flex">
        <div className="w-[5px] h-32 bg-brand rounded-r" />
        <div className="w-[3px] h-32 bg-black/[0.05] dark:bg-white/[0.08]" />
      </div>

      {/* Side Border Bar - Right */}
      <div className="absolute right-0 bottom-1/3 pointer-events-none flex">
        <div className="w-[3px] h-32 bg-black/[0.05] dark:bg-white/[0.08]" />
        <div className="w-[5px] h-32 bg-brand rounded-l" />
      </div>

      {/* Horizontal Line Accents */}
      <div className="absolute left-8 top-[45%] pointer-events-none flex flex-col gap-1.5">
        <div className="w-24 h-px bg-brand/40 dark:bg-brand/60" />
        <div className="w-16 h-px bg-brand/20 dark:bg-brand/40" />
      </div>
      <div className="absolute right-8 top-[55%] pointer-events-none flex flex-col gap-1.5 items-end">
        <div className="w-24 h-px bg-brand/40 dark:bg-brand/60" />
        <div className="w-16 h-px bg-brand/20 dark:bg-brand/40" />
      </div>

      {/* Diamond Accents */}
      <svg className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-35 dark:opacity-60" width="20" height="20" viewBox="0 0 20 20">
        <polygon points="10,1 19,10 10,19 1,10" fill="none" className="stroke-brand" strokeWidth="1.5" />
        <polygon points="10,5 15,10 10,15 5,10" className="fill-brand" opacity="0.4" />
      </svg>
      <svg className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-25 dark:opacity-50" width="16" height="16" viewBox="0 0 16 16">
        <polygon points="8,1 15,8 8,15 1,8" fill="none" className="stroke-brand" strokeWidth="1.2" />
      </svg>
      <svg className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-25 dark:opacity-50" width="16" height="16" viewBox="0 0 16 16">
        <polygon points="8,1 15,8 8,15 1,8" fill="none" className="stroke-brand" strokeWidth="1.2" />
      </svg>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen text-slate-900 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}