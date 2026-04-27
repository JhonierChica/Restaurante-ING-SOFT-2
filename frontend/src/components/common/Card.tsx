import React, { ReactNode } from 'react';
import '../../styles/Card.css';

interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, actions, className = '' }) => {
  return (
    <div className={`card overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <div className="card-header px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="card-title text-gray-800 font-black flex items-center gap-2">
            {title}
          </div>
          {actions && <div className="card-actions flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="card-body p-6">{children}</div>
    </div>
  );
};

export default Card;