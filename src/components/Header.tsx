import React from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Make sure lucide-react is installed

const Heading: React.FC = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    const goToAbout = () => {
        navigate('/about');
    };

    const goToProjects = () => {
        navigate('/projects');
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "resume.pdf";
        link.download = "My Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 w-full">
            <div className="flex flex-row items-center max-w-full px-6 py-3">
                <button
                    onClick={goToHome}
                    className="text-white font-semibold text-lg px-3 py-1 hover:text-blue-500 transition"
                >
                    <h1>My Portfolio</h1>
                </button>

                <nav className="flex ml-auto space-x-4">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg transition duration-300"
                    >

                        Download Resume
                    </button>

                    <button
                        onClick={goToAbout}
                        className="text-white hover:text-blue-400 transition"
                    >
                        About
                    </button>

                    <button
                        onClick={goToProjects}
                        className="text-white hover:text-blue-400 transition"
                    >
                        Projects
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Heading;
