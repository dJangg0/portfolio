import React from 'react';
import Header from '../components/Header';

const About: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
            <Header />

            <section className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-5xl font-extrabold text-center mb-12">
                    Get to Know Me
                </h1>

                <div className="flex flex-col md:flex-row items-start md:items-stretch justify-between gap-12">

                    {/* About Me Section */}
                    <div className="md:w-1/2 bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300">
                        <h2 className="text-3xl font-bold mb-4 border-b border-gray-500 pb-2">About Me</h2>
                        <p className="text-gray-300 leading-relaxed">
                            I’m Leandro Jose Untal — a driven and creative undergraduate developer from the Philippines.
                            My journey in tech has been shaped by hands-on experience in full-stack development, AI/ML research, 
                            cybersecurity, and innovative cross-platform app development.
                            </p>

                           <p> I consider myself a versatile developer, able to adapt to different fields and challenges. However, I aspire to focus more deeply on a single career path — either in software development or cybersecurity red teaming — 
                            where I can further sharpen my skills and make a long lasting impact.
                            </p>
                        <p className="text-gray-300 leading-relaxed mt-4">
                            I’ve had the privilege of competing in and winning national hackathons such as
                            <strong> Hack4Gov 2024</strong>, and contributing to various real-world solutions —
                            including an AI-powered sign language interpreter and a real-time electrical monitoring system.
                            I'm deeply passionate about using technology to solve meaningful problems and create impact.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-4">
                            Beyond coding, I value teamwork, continuous learning, and turning ideas into real, usable systems.
                            My goal is to keep growing as a software engineer and build tools that empower others.
                        </p>
                    </div>

                    {/* Skills Section */}
                    <div className="md:w-1/2 bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300">
                        <h2 className="text-3xl font-bold mb-4 border-b border-gray-500 pb-2">Skills</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><strong>Languages:</strong> Java, Python, JavaScript, Kotlin, TypeScript</li>
                            <li><strong>Web & Mobile:</strong> React, Ionic React, Android Studio, Tailwind CSS</li>
                            <li><strong>AI & Tools:</strong> TensorFlow Lite, CNN Models, FFmpeg, MediaPipe</li>
                            <li><strong>Cybersecurity:</strong> Kali Linux, Wireshark, Nmap, OSINT tools</li>
                            <li><strong>Databases:</strong> Firebase, MySQL, PostgreSQL, Supabase</li>
                            <li><strong>Soft Skills:</strong> Adaptable, Detail-Oriented, Problem-Solver, Team Player</li>
                        </ul>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default About;
