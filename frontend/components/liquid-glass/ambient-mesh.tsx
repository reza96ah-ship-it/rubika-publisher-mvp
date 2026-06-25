type AmbientMeshProps = {
  fixed?: boolean;
  className?: string;
};

export function AmbientMesh({
  fixed = true,
  className = ""
}: AmbientMeshProps) {
  return (
    <div
      aria-hidden="true"
      className={`${fixed ? "fixed" : "absolute"} inset-0 n-liquid-ambient-mesh ${className}`}
    />
  );
}
