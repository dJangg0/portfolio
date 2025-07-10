// components/ProjectCard.tsx
import React from "react";

type ProjectCardProps = {
    imageUrl: string;
    title: string;
    description: string;
    link?: string;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ imageUrl, title, description }) => {
    return (
        <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-125 transition-transform duration-300  max-w-sm">
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <p className="text-white-600 mt-2 text-sm">{description}</p>

            </div>
        </div>
    );
};

export default ProjectCard;
