import React from 'react';

const UserAvatar = ({ user, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  const fontSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };
  
  // If no user or avatar, show placeholder
  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center`}>
        <span className={`${fontSizeClasses[size]} font-medium text-gray-600`}>?</span>
      </div>
    );
  }
  
  // Get first letter of username for fallback
  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-300 flex-shrink-0 flex items-center justify-center`}>
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `<span class="${fontSizeClasses[size]} font-medium text-gray-600">${firstLetter}</span>`;
          }}
        />
      ) : (
        <span className={`${fontSizeClasses[size]} font-medium text-gray-600`}>{firstLetter}</span>
      )}
    </div>
  );
};

export default UserAvatar;
