import { FaLinkedin, FaGithub,  } from 'react-icons/fa';
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-br from-gray-900 to-gray-500  text-white py-2  px-8 flex flex-col sm:flex-row justify-between items-center">

            <div className='flex flex-row items-start '>
                <img src='isat.png'
                    title='Iloilo State University of Science and Technology'
                    className='w-12 h-12 rounded-sm m-2 transition transform hover:scale-150'
                >
                </img>

                <img src='kwadra.png'
                    title='Kwadra TBI'
                    className='w-12 h-12 rounded-lg m-2 transition transform hover:scale-150'
                >
                </img>

                <img src='isatech.png'
                    title='ISATECH Society'
                    className='w-12 h-12 rounded-lg m-2 transition transform hover:scale-150'
                >
                </img>
            </div>

            <div className="flex space-x-4">

                <div className='flex flex-col'>

                    <div className="flex space-x-4 text-white text-2xl">
                        
                        <a
                            href="https://www.linkedin.com/in/leandro-jose-untal-a82864291/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                        >
                            <FaLinkedin className="hover:text-blue-600 transition transform hover:scale-150" />
                        </a>

                        <a
                            href="https://github.com/dJangg0"
                            target='blank'
                            rel="noopener noreferrer"
                            title="Facebook"
                        >
                            <FaGithub className="hover:text-blue-600 transition transform hover:scale-150" />
                        </a>
                    </div>

                    <p className=''>Contact me: 0961 909 8620</p>
                    <p className=''>Gmail: lndrjs.untal@gmail.com</p>
                </div>
            </div>
        </footer>
    );
};


export default Footer;