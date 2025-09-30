import React from "react";

const Main: React.FC = () => {
    return (
        <div className="flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 text-white">

            {/* Particle Background */}
            <div className="absolute inset-0 z-0 particle-background">

            </div>

            <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-8 relative z-10">

                {/* Left */}
                <div className="md:w-1/2">
                    <h2 className="text-4xl font-bold mb-6">This is Me</h2>
                    <p className="text-lg leading-relaxed text-gray-300 max-w-xl">
                        👋 Hello, I'm Leandro Jose Endriga Untal — welcome to my corner of the internet!

I’m a 22-year-old developer and tech enthusiast from the Philippines who loves turning ideas into working solutions. My focus has always been on building projects that merge innovation with real-world impact.

I’ve worked on projects like a mobile application for American Sign Language interpretation using Convolutional Neural Networks (CNNs) and TensorFlow Lite, designed to help bridge communication gaps by processing and interpreting videos directly on mobile devices. I’ve also developed a panel board monitoring system that connects web and mobile applications, providing insights on temperature, current, and voltage through real-time data visualization and notifications.

Along the way, I’ve joined several hackathons, where I gained valuable experience in rapid prototyping, collaboration, and design sprints, sharpening my ability to work under pressure and turn concepts into functional solutions.


                    </p>
                </div>

                {/* Right */}
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <img
                        src="me.jpg"
                        alt="Hack4Gov"
                        className="w-[300px] h-[400px] rounded-lg"
                    />
                </div>
            </div>


            <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-8 relative z-10">

                {/* Left */}
                <div className="md:w-1/2">
                    <h2 className="text-4xl font-bold mb-6">Hack4Gov 3 Region 6</h2>
                    <p className="text-lg leading-relaxed text-gray-300 max-w-xl">
                        🚀 The ISATECH Tradeans reigned supreme once again as we clinched the top spot at the Hack4Gov Regional Finals! <br></br><br></br>

I had the privilege of leading my team through a day-long cybersecurity hackathon in a Capture-the-Flag format, where collaboration under pressure and sharp problem-solving were the keys to victory. It was an intense but rewarding experience that showcased the strength of teamwork, innovation, and resilience.

💙💛 Proudly representing ISAT U on the big stage!
📅 July 16, 2024
                    </p>
                </div>

                {/* Right */}
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <img
                        src="ez.jpg"
                        alt="Hack4Gov"
                        className="w-[400px] h-[400px] rounded-lg"
                    />
                </div>
            </div>

            <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-8 relative z-10">

                {/* Left */}
                <div className="md:w-1/2">
                    <h2 className="text-4xl font-bold mb-6">DOH Hack4Health Top 10 Philippine Finalist</h2>
                    <p className="text-lg leading-relaxed text-gray-300 max-w-xl">
                        🚀 Hack for Impact. Code for Health.
Proud to represent our team at the DOH Hack4Health held at the Development Academy of the Philippines, Tagaytay! 🏥💡 <br></br><br></br>

We built AbTech, a quick-response mobile app designed to save lives. With just a single tap, it automates the process for responders to locate accidents instantly. Beyond emergency response, AbTech also serves as a daily companion app, offering screening and assessment tools, plus a Drive Mode that detects accidents — and if the user cannot respond, it will automatically send a signal to the nearest response team, powered by Dijkstra’s Algorithm for optimal routing.

Together with brilliant minds from across the nation, we’re pushing the boundaries of health tech innovation — because every second counts when it comes to saving lives. 💻🌿

🌟 Let the ideas flow and the impact grow!
#Hack4Health #DOHInnovation #TechForGood #DAPTagaytay #TeamPH #HealthTech
                    </p>
                </div>

                {/* Right */}
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <img
                        src="h4h1.jpg"
                        alt="Hack4Gov"
                        className="w-[350px] h-[600px] rounded-lg"
                    />
                </div>
            </div>

            <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-8 relative z-10">

                {/* Left */}
                <div className="md:w-1/2">
                    <h2 className="text-4xl font-bold mb-6">The DEVels</h2>
                    <p className="text-lg leading-relaxed text-gray-300 max-w-xl">
                        🎓 To the people who made the journey worth it.
                        Thank you, classmates — for the laughter, sleepless nights, shared deadlines, and memories that made college more than just classes and exams. 🫶📚

                        We started as strangers, but ended as a family bound by the same goals, struggles, and growth. Here's to the journey we walked together — every group chat, every “kaya pa ‘to,” every small win that meant the world. 💛

                        From first day to graduation day — thank you for being part of my story. 🙌 More Achievements ahead! <br></br>

                        #CollegeJourney #ThankYouClassmates #FromStrangersToFamily #GratefulHeart #OneForTheBooks
                    </p>
                </div>

                {/* Right */}
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <img
                        src="DEVels.jpg"
                        alt="Hack4Gov"
                        className="w-[500px] h-[400px] rounded-lg"
                    />
                </div>
            </div>




        </div>
    );
};

export default Main;
