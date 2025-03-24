import React from 'react';

const UserAvatar = ({ user, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-300 flex-shrink-0`}>
      <img 
        src={user.avatar} 
        alt={user.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default UserAvatar;