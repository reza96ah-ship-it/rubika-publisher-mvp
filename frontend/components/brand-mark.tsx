function initials(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "SO";
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase();
  return `${words[0][0]}${words.at(-1)?.[0] ?? ""}`.toLocaleUpperCase();
}

const sizeClasses = {
  sm: "h-7 w-7 rounded-md",
  md: "h-9 w-9 rounded-lg",
  lg: "h-12 w-12 rounded-lg"
};

export function ProductMark({ size = "md", className = "" }: { size?: keyof typeof sizeClasses; className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 overflow-hidden bg-app-primary shadow-accent ${sizeClasses[size]} ${className}`} aria-label="SocialOps Studio">
      <span className="absolute inset-y-[22%] right-[24%] w-[12%] rounded-full bg-white/95" />
      <span className="absolute inset-y-[22%] right-[47%] w-[12%] rounded-full bg-white/75" />
      <span className="absolute right-[24%] top-[22%] h-[12%] w-[36%] rounded-full bg-white/95" />
    </span>
  );
}

export function WorkspaceAvatar({
  name,
  size = "md",
  className = "",
  color,
  imageUrl
}: {
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  color?: string;
  imageUrl?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-app-tealSoft text-[10px] font-black text-app-teal shadow-hairline ${sizeClasses[size]} ${className}`}
      style={color ? { backgroundColor: `${color}18`, color } : undefined}
    >
      {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : initials(name)}
      <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
    </span>
  );
}
