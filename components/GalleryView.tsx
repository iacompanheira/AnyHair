// components/GalleryView.tsx
import React from 'react';
import { ArrowLeftIcon } from './Icons';
import type { BackgroundSettings } from '../types';

const GalleryView: React.FC<{ onBack: () => void, images: BackgroundSettings[] }> = ({ onBack, images }) => {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-full text-gray-800 p-4 sm:p-8">
            <header className="flex items-center mb-6 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-black/10 mr-4" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h3 className="text-2xl font-light tracking-wider">Galeria</h3>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md group">
                            <img src={image.url} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                    ))}
                    {/* Add more placeholder images if needed */}
                     <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md group">
                        <img src="https://i.imgur.com/eY1g51F.jpeg" alt="Galeria extra 1" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                     <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md group">
                        <img src="https://i.imgur.com/4YUa1T2.jpeg" alt="Galeria extra 2" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                     <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md group">
                        <img src="https://i.imgur.com/8b4Y3s2.jpeg" alt="Galeria extra 3" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GalleryView;