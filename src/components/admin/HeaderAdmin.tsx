export const HeaderAdmin = () => {
  return (
    <div className="h-full flex p-5 flex-col md:flex-row items-center bg-normal justify-between">
      <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
        <span className="ml-3 text-base">FIEZ ADMIN</span>
      </a>
      <nav className="flex flex-wrap items-center text-base justify-center text-black">
        <a className="mr-5 text-black">First Link</a>
        <a className="mr-5 text-black">Second Link</a>
        <a className="mr-5 text-black">Third Link</a>
        <a className="mr-5 text-black">Fourth Link</a>
      </nav>
      <button className="inline-flex items-center bg-head border-0 py-1 px-3 focus:outline-none hover:bg-normal rounded text-base ">
        Button
      </button>
    </div>
  );
};
