import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();

  let currentLink = "";
  const crumbs = location.pathname
  .split('/')
  .filter(crumb => crumb !== '')
  .map((crumb, index) => {
    currentLink += `${crumb}`;
    return (
      <li className="breadcrumb-item" key={crumb}>
        <Link to={currentLink}>
          {crumb.replace(/-/g, " ")} {/* no need to remove '/' */}
        </Link>
      </li>
    );
  });

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb-modern">
        {crumbs}
      </ol>
    </nav>
  ) 
}