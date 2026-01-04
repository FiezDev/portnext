import { motion } from 'framer-motion';
import GoldHeading from '../../shared/GoldHeading';
import { PageId } from './useComplexTransition';

const MOTTO_TEXT = "PASSIONATE TO MAKE THE REMARKABLE THING";

export const PageContent = ({ page }: { page: PageId }) => {
  switch (page) {
    case 'Main':
      return (
        <div className="flex flex-col justify-center h-full p-6 md:p-12">
          <GoldHeading as="h1" className="text-5xl md:text-8xl mb-4">PORT<br/>FOLIO</GoldHeading>
          <p className="text-lg md:text-xl text-gray-500 max-w-md">
            Welcome to the digital playground. Built with Golden Ratio precision.
          </p>
        </div>
      );
    case 'About':
      return (
        <div className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent">
           <GoldHeading as="h2" className="text-4xl md:text-6xl mb-4 md:mb-6">About Me</GoldHeading>
           
           <div className="space-y-4 md:space-y-6 max-w-2xl">
                <div>
                   <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ittipol Vongapai</h3>
                   <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
                     A self-driven, introverted software developer with 5 years of experience, I'm based in Thailand and powered by a steady diet of ramen and juice. My current focus areas include ReactJS, generative AI technologies, and frontend development.
                   </p>
                </div>

                <div>
                    <h4 className="text-sm uppercase tracking-widest text-gray-400 mb-3 font-bold border-b border-gray-200 pb-1 w-max">Favorites</h4>
                    <div className="flex flex-wrap gap-2">
                        {['Blue', 'Cat', 'Basketball', 'Motorcycle', 'Mobile MOBA'].map(item => (
                            <span key={item} className="px-3 py-1 bg-yellow-100/80 text-yellow-800 border border-yellow-200 text-sm rounded-full font-medium shadow-sm backdrop-blur-sm">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                
                {/* Tagline Motto */}
                <motion.div 
                    className="pt-6 md:pt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 font-medium">
                        "{MOTTO_TEXT}"
                    </p>
                </motion.div>
           </div>
        </div>
      );
    case 'Skill':
      return (
         <div className="flex flex-col justify-center h-full p-12 bg-gray-900 text-white">
            <GoldHeading as="h2" className="text-6xl mb-8">Skills</GoldHeading>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-2">Frontend</h3>
                    <p className="text-gray-400">React, Next.js, Three.js, Tailwind</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Backend</h3>
                    <p className="text-gray-400">Node.js, Python, PostgreSQL</p>
                </div>
            </div>
         </div>
      );
    case 'Projects':
      return (
        <div className="flex flex-col justify-center h-full p-12">
            <GoldHeading as="h2" className="text-6xl mb-8">Selected Work</GoldHeading>
             <ul className="space-y-4 text-2xl font-light">
                <li className="border-b border-gray-200 py-2 hover:text-yellow-600 cursor-pointer transition-colors">Portfolio V1</li>
                <li className="border-b border-gray-200 py-2 hover:text-yellow-600 cursor-pointer transition-colors">E-Commerce Dashboard</li>
                <li className="border-b border-gray-200 py-2 hover:text-yellow-600 cursor-pointer transition-colors">AI Content Generator</li>
             </ul>
        </div>
      );
    case 'Contact':
        return (
            <div className="flex flex-col justify-center h-full p-12 bg-yellow-50">
                <GoldHeading as="h2" className="text-6xl mb-8">Let's Talk</GoldHeading>
                <form className="space-y-4 max-w-md">
                    <input type="email" placeholder="Your Email" className="w-full p-4 border-b border-yellow-600 bg-transparent focus:outline-none" />
                    <textarea placeholder="Message" className="w-full p-4 border-b border-yellow-600 bg-transparent focus:outline-none h-32"></textarea>
                    <button className="px-8 py-3 bg-gray-900 text-white font-bold tracking-widest hover:bg-black transition-colors">SEND</button>
                </form>
            </div>
        );
    default:
      return null;
  }
};
