import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaHistory,
  FaUser,
  FaWpforms,
} from "react-icons/fa";

import "../assets/css/BottomNavigation.css";


function BottomNavigation({ active }) {

  const navigate =
    useNavigate();
  const navigationItems = [

    {
      key:
        "home",

      label:
        "Home",

      path:
        "/dashboard",

      icon:
        <FaHome />,
    },

    {
      key:
        "forms",

      label:
        "Forms",

      path:
        "/forms",

      icon:
        <FaWpforms />,
    },

    {
      key:
        "history",

      label:
        "History",

      path:
        "/history",

      icon:
        <FaHistory />,
    },

    {
      key:
        "profile",

      label:
        "Profile",

      path:
        "/profile",

      icon:
        <FaUser />,
    },

  ];
  const openPage = (
    path
  ) => {

    navigate(
      path
    );

  };

  return (

    <nav
      className="bottom-navigation"
      aria-label="User navigation"
    >

      {navigationItems.map(
        (item) => (

          <button
            key={
              item.key
            }
            type="button"
            className={
              active === item.key
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              openPage(
                item.path
              )
            }
            aria-label={
              `Open ${item.label}`
            }
            aria-current={
              active === item.key
                ? "page"
                : undefined
            }
          >

            {item.icon}

            <span>
              {item.label}
            </span>

          </button>

        )
      )}

    </nav>

  );

}


export default BottomNavigation;