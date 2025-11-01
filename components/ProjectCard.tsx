
import React from 'react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg border border-purple-500/20 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/30">
      <img className="w-full h-56 object-cover" src={project.gifUrl} alt={`${project.title} preview`} />
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-purple-300">{project.title}</h3>
        <p className="text-gray-400 mb-4">{project.description}</p>
        <div className="flex justify-end gap-4 mt-4">
          <a
            href={project.demoUrl}
            className="px-5 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            View Demo
          </a>
          <a
            href={project.downloadUrl}
            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};
