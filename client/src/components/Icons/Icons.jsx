export function PencilIcon({ size = 18, strokeWidth = 2, className = '' }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}

export function TrashIcon({ size = 18, strokeWidth = 2, className = '' }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
        </svg>
    );
}

export function BookmarkIcon({ size = 24, strokeWidth = 2, className = '', filled = false }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M8 4h8c1.1 0 2 .9 2 2v14l-6-4-6 4V6c0-1.1.9-2 2-2z" />
        </svg>
    );
}

export function HeartIcon({ size = 24, strokeWidth = 2, className = '', filled = false }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M19.84 4.61a5.5 5.5 0 0 0-7.78 0L12 4.67l-.06-.06a5.5 5.5 0 0 0-7.78 7.78l.06.06L12 20.23l7.78-7.78.06-.06a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
    );
}

export function DiscIcon({ size = 24, strokeWidth = 2, className = '' }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M12 3a9 9 0 0 1 9 9" opacity="0.65" />
        </svg>
    );
}
