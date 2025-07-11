import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  let currentLink = '';

  const crumbs = location.pathname.split('/')
    .filter(crumb => crumb !== '')
    .map(crumb => {
      currentLink =+ '/${crumb}'

      return (
        <li className="breadcrumb-item" key={crumb}><Link to={currentLink}>{crumb.replace(/-/g, " ")}</Link></li>
      )
    });

  return (
    <div className="container-fluid px-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb my-0">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          {crumbs}
        </ol>
      </nav>
    </div>
  ) 
}