import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export const Logo = ({ size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  let dimensions = 'w-8 h-8';
  if (size === 'sm') dimensions = 'w-6 h-6';
  if (size === 'lg') dimensions = 'w-12 h-12';
  if (size === 'xl') dimensions = 'w-16 h-16';

  return (
    <div className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shadow-md shadow-blue-500/20 ${dimensions} ${className}`}>
      {!imgError ? (
        <img
          src="/military_logo.jpg"
          alt="Military Command Logo"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-xl border border-amber-500/30"
        />
      ) : (
        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white">
          <Shield className="w-2/3 h-2/3" />
        </div>
      )}
    </div>
  );
};

export default Logo;
