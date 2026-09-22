import type { SVGProps } from "react";

const artwork = {
  "target": (<><circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="m11 13 9-9M16 3v5h5"/></>),
  "dashboard": (<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></>),
  "work": (<><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></>),
  "scenes": (<><rect x="3" y="3" width="12" height="13" rx="2"/><path d="M9 8h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-3M6 7h5M6 11h3"/></>),
  "characters": (<><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5.65"/></>),
  "search": (<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>),
  "notification": (<><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4M12 2V1"/></>),
  "plus": (<><path d="M12 5v14M5 12h14"/></>),
  "edit": (<><path d="m4 16-1 5 5-1L20 8a2.83 2.83 0 0 0-4-4ZM14 6l4 4"/></>),
  "delete": (<><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>),
  "more": (<><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>),
  "duplicate": (<><rect x="8" y="3" width="12" height="15" rx="2"/><path d="M16 18v3H4V7h4"/></>),
  "arrow-left": (<><path d="M20 12H4m6-6-6 6 6 6"/></>),
  "arrow-right": (<><path d="M4 12h16m-6-6 6 6-6 6"/></>),
  "chevron-down": (<><path d="m6 9 6 6 6-6"/></>),
  "check": (<><path d="m5 12 4 4L19 6"/></>),
  "list": (<><path d="M9 5h12M9 12h12M9 19h12"/><circle cx="3" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="19" r="1" fill="currentColor" stroke="none"/></>),
  "summary": (<><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>),
  "content": (<><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h4M9 12h3M9 16h3"/></>),
  "genre": (<><circle cx="12" cy="12" r="9"/><path d="m8 9 4 6 4-6"/></>),
  "feather": (<><path d="M4 20C5 10 11 4 22 2c-1 5-4 10-8 13l-5 1-2 4Z" fill="currentColor" stroke="none"/><path d="M2 23 18 6"/><path d="m9 14 5-1M12 10l1-4" stroke="white" strokeWidth=".8"/></>),
} as const;

export type IconName = keyof typeof artwork;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "name"> & {
  name: IconName;
  size?: number | string;
};

/** Decorative by default. Supply aria-label for a standalone meaningful icon. */
export function Icon({ name, size = 20, ...props }: IconProps) {
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {artwork[name]}
    </svg>
  );
}
