import Link from 'next/link';

const Sidenav_admin: React.FC = () => {
  const adminMenu = [
    {
      id: 1,
      display: 'Chat',
      url: '/admin/chat',
    },
    {
      id: 2,
      display: 'Project',
      url: '/admin/project',
    },
    {
      id: 3,
      display: 'Contact',
      url: '/admin/contact',
    },
  ];

  return (
    <nav className="text-white h-screen z-30 w-[200px] text-2xl">
      <div
        className={`bg-black z-20 pt-40 h-screen ease-in-out duration-300
        `}
      >
        <ul className="flex flex-col">
          {adminMenu.map(({ id, display, url }) => {
            return (
              <a
                key={id}
                className="hover:text-white text-center text-white block uppercase tracking-wider h-[100px]"
              >
                <Link href={url}>
                  <li className=" flex items-center justify-center p-[10px] hover:bg-normal hover:duration-500 h-[80px] w-[200px] ">
                    <span className="hover:scale-x-100">{display}</span>
                  </li>
                </Link>
              </a>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Sidenav_admin;
