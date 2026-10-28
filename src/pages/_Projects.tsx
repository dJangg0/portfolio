import React from "react";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import Footer from "../components/Footer";

// ProjectsSection.tsx
const Projects: React.FC = () => {

    const projectData = [
        {
            imageUrl: "coop.png",
            title: "Online Coop",
            description: "A digital payment and transaction system built for our school cafeteria, developed using Node.js, React, TypeScript, Tailwind CSS, Firebase, and OAuth authentication. Features include a secure admin dashboard for sales tracking and a user-friendly interface for students to manage balances and make cashless payments."

        },
        {
            imageUrl: "hack1.png",
            title: "HACKAFEST VULNERABLE WEB APP",
            description: "Hackafest.ct.ws is a custom-built vulnerable web application designed for cybersecurity enthusiasts and Hack4Gov aspirants. It serves as a safe, simulated environment to practice web exploitation techniques, identify security flaws, and enhance ethical hacking skills. Built to help participants prepare for real-world CTF challenges.",

        },
        {
            imageUrl: "ojt1.png",
            title: " 'THRIBO APP' Status:On-going",
            description: "An Screening and Assessment Tool designed to streamline applicant evaluation using a responsive and user-friendly interface. Built with Node.js,React Ionic, Tailwind CSS, and TypeScript, this cross-platform solution ensures accessibility across both mobile and web — enabling seamless screening wherever you go. Access : https://thribo-app.web.app/",
        },
        {
            imageUrl: "ppe.png",
            title: "Real-time Electrical Monitoring System",
            description: "A real-time electrical monitoring system designed to track voltage, current, and temperature in a home environment. Built with a Node.js backend and socket-based data flow, the system delivers live updates directly to a mobile-responsive interface. It alerts users through sound notifications when anomalies like overvoltage, undervoltage, or thermal spikes are detected — making home safety smart and proactive.",

        },
    ];
    return (
        <div>
            <Header />
            <div className=" p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

                <div className="max-w-7xl mx-auto px-4 py-12">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">My Projects</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                        {projectData.map((project, index) => (
                            <ProjectCard
                                key={index}
                                imageUrl={project.imageUrl}
                                title={project.title}
                                description={project.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Projects;
