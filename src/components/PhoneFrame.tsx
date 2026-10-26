import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export const PhoneFrame = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function PhoneFrame({ children }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 375,
          borderRadius: 6,
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        {children}
      </div>
    );
  },
);
