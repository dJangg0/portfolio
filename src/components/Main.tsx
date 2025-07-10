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
                        👋 Hello, I'm Leandro Jose Endriga Untal
                        Welcome to my corner of the internet! I'm a passionate developer,
                        creative problem-solver, and tech enthusiast from the Philippines. At 21 years old,
                        I've already had the opportunity to work on projects that bridge innovation and impact — from mobile
                        apps powered by AI to data-driven systems that make a difference.
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
                        The ISATECH Tradeans reign supreme once again as they clinch the top spot in the Hack4Gov Regional Finals!
                        A huge win for innovation, collaboration, and excellence. Proudly representing ISAT U on the big stage! 💙💛
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
                    <h2 className="text-4xl font-bold mb-6">DOH Hack4Health Top 10 Finalist</h2>
                    <p className="text-lg leading-relaxed text-gray-300 max-w-xl">
                        🚀 Hack for Impact. Code for Health.
                        Proud to represent our team as we join the DOH Hack4Health at the Development Academy of the Philippines, Tagaytay! 🏥💡

                        Together with brilliant minds from across the nation, we’re innovating solutions that can transform public health — one line of code at a time. 💻🌿

                        Let the ideas flow and the impact grow! 🌟
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
