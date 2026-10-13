import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const LeafIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
    <path d="M5 19c3-4 6-7 10-9" />
  </svg>
);

export const WheatOffIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21V9" />
    <path d="M12 13c-2 0-4-1.5-4-4 2 0 4 1.5 4 4Zm0 0c2 0 4-1.5 4-4-2 0-4 1.5-4 4Z" />
    <path d="M12 8c-1.2-1-1.2-3 0-5 1.2 2 1.2 4 0 5Z" />
    <path d="M4 4l16 16" />
  </svg>
);

export const ChiliIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 7c-4 1-6 4-7 8-.6 2.4-2 4-4 5 6 1 13-2 15-9 .5-2-1.5-4.5-4-4Z" />
    <path d="M14 7c0-2 1-3.5 3-4" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const BagIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

export const StarIcon = ({ filled = true, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"} strokeWidth={1.4}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
  </svg>
);

/** Znak marki: słońce wschodzące nad linią stołu. */
export const SunMark = ({ size = 28, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...p}>
    <circle cx="16" cy="19" r="10" fill="var(--color-zafferano)" />
    <rect x="2" y="23" width="28" height="2.4" rx="1.2" fill="currentColor" />
  </svg>
);
