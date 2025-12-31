import GoldHeading from '../../shared/GoldHeading';
import { PageId } from './useComplexTransition';

export const PageContent = ({ page }: { page: PageId }) => {
  switch (page) {
    case 'Main':
      return (
        <div className="flex flex-col justify-center h-full p-12">
          <GoldHeading as="h1" className="text-8xl mb-4">PORT<br/>FOLIO</GoldHeading>
          <p className="text-xl text-gray-500 max-w-md">
            Welcome to the digital playground. Built with Golden Ratio precision.
          </p>
        </div>
      );
    case 'About':
      return (
        <div className="flex flex-col justify-center h-full p-12 bg-gray-50">
           <GoldHeading as="h2" className="text-6xl mb-8">About Me</GoldHeading>
           <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
             I am a developer who believes in the intersection of logic and beauty. 
             Every line of code is a brush stroke on the canvas of the web.
           </p>
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
