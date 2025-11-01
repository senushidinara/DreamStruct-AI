
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 md:py-10">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            DreamStruct AI
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Designing The Impossible Architecture of Tomorrow.
        </p>
      </div>
    </header>
  );
};
