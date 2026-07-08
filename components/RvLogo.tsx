type RvLogoProps = {
  className?: string;
  hollow?: boolean;
};

export default function RvLogo({ className, hollow }: RvLogoProps) {
  const rectProps = hollow
    ? { fill: "none", stroke: "currentColor", strokeWidth: 4 }
    : {};

  return (
    <svg
      width="580"
      height="325"
      viewBox="0 0 580 325"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="RV logo"
    >
      <rect y="3.00001" width="240" height="40" fill="#1900A7" {...rectProps} />
      <rect x="40" y="121" width="204" height="40" transform="rotate(90 40 121)" fill="#858585" {...rectProps} />
      <rect y="62" width="40" height="40" fill="#1900A7" {...rectProps} />
      <rect x="200" y="62" width="40" height="40" fill="#1900A7" {...rectProps} />
      <rect x="120" y="121" width="120" height="40" fill="#1900A7" {...rectProps} />
      <rect x="120" y="175" width="40" height="40" fill="#1900A7" {...rectProps} />
      <rect x="160" y="230" width="40" height="40" fill="#1900A7" {...rectProps} />
      <rect x="200" y="285" width="40" height="40" fill="#1900A7" {...rectProps} />
      <rect x="520" y="173" width="60" height="40" fill="#994D0F" {...rectProps} />
      <rect x="540.529" width="39.4707" height="149.111" fill="#858585" {...rectProps} />
      <rect x="440" y="282" width="60" height="40" fill="#994D0F" {...rectProps} />
      <rect x="480" y="227" width="60" height="40" fill="#994D0F" {...rectProps} />
      <rect width="60" height="40" transform="matrix(1 0 0 -1 360 149)" fill="#CFA901" {...rectProps} />
      <rect width="39.4707" height="160.076" transform="matrix(1 0 0 -1 380.454 324.537)" fill="#858585" {...rectProps} />
      <rect width="60" height="40" transform="matrix(1 0 0 -1 280 40)" fill="#A70000" {...rectProps} />
      <rect width="60" height="40" transform="matrix(1 0 0 -1 320 95)" fill="#A74600" {...rectProps} />
    </svg>
  );
}
