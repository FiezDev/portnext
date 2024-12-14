import Link from 'next/link';
import ActiveLink from './ActiveLink';
import ThemeToggle from './ThemeToggle';


const Navigation = () => {
  const routes = [
    { href: '/', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '/work', label: 'Work' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="border-b">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Portfolio
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {routes.map((route) => (
              <ActiveLink key={route.href} href={route.href}>
                {route.label}
              </ActiveLink>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
