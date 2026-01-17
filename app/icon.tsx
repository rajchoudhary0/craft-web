import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#C67B5C',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'white' }}
        >
          {/* Star */}
          <path
            d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
            fill="currentColor"
          />
          {/* Sparkle */}
          <circle cx="19" cy="5" r="1.5" fill="currentColor" />
          <path d="M19 2.5V7.5M16.5 5H21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
