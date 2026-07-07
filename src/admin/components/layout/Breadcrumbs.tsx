import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';


export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  // Remove 'admin' from the paths array for breadcrumb display
  const adminIndex = paths.indexOf('admin');
  const displayPaths = adminIndex !== -1 ? paths.slice(adminIndex + 1) : paths;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-admin-text-muted">
        <li>
          <Link to="/admin" className="hover:text-admin-text transition-colors">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {displayPaths.map((path, index) => {
          const isLast = index === displayPaths.length - 1;
          const href = `/admin/${displayPaths.slice(0, index + 1).join('/')}`;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

          return (
            <li key={path} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4" />
              {isLast ? (
                <span className="font-medium text-admin-text">{formattedPath}</span>
              ) : (
                <Link to={href} className="hover:text-admin-text transition-colors">
                  {formattedPath}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
