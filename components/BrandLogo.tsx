import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "wordmark" | "mark" | "hero";
  href?: string | null;
  className?: string;
  priority?: boolean;
};

const VARIANTS = {
  wordmark: {
    src: "/brand/logo-wordmark.png",
    alt: "Riple",
    width: 146,
    height: 32,
    className: "brand-logo brand-logo-wordmark"
  },
  mark: {
    src: "/brand/logo-mark.png",
    alt: "Riple",
    width: 40,
    height: 38,
    className: "brand-logo brand-logo-mark"
  },
  hero: {
    src: "/brand/logo-hero.png",
    alt: "Riple — One change. Infinite outcomes.",
    width: 420,
    height: 126,
    className: "brand-logo brand-logo-hero"
  }
} as const;

export function BrandLogo({
  variant = "wordmark",
  href = "/",
  className = "",
  priority = false
}: BrandLogoProps) {
  const config = VARIANTS[variant];
  const image = (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      className={`${config.className} ${className}`.trim()}
      priority={priority}
    />
  );

  if (href === null) {
    return image;
  }

  return (
    <Link href={href} className="brand" aria-label="Riple home">
      {image}
    </Link>
  );
}
