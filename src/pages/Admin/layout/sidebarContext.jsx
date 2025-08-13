// import { createContext, useReducer, useEffect } from "react";
// import reducer from "./sidebarReducer";
// import PropTypes from "prop-types";

// const initialState = {
//   isSidebarOpen: false,
//   selectedLinkTitle: "",
// };

// export const SidebarContext = createContext({});

// export const SidebarProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   const toggleSidebar = () => {
//     // Dispatch action to toggle sidebar state (if needed)
//     dispatch({ type: "TOGGLE_SIDEBAR" });

//     // Get the elements by their IDs
//     const sidebar = document.getElementById("admin_sidebar");
//     const content = document.getElementById("admin_content");

//     // Toggle the margin-left for the sidebar and content
//     if (sidebar && content) {
//       // Check current state of the sidebar and toggle accordingly
//       if (sidebar.style.marginLeft === "0px") {
//         // If sidebar is visible, hide it
//         sidebar.style.marginLeft = "-260px";
//         content.style.marginLeft = "0"; // Reset content's margin
//       } else {
//         // If sidebar is hidden, show it
//         sidebar.style.marginLeft = "0";
//         content.style.marginLeft = "260px"; // Push content to the right
//       }
//     } else {
//       console.warn("One or more elements not found.");
//     }
//   };

//   // useEffect to set initial state when the page loads
//   useEffect(() => {
//     // Get the elements by their IDs
//     const sidebar = document.getElementById("admin_sidebar");
//     const content = document.getElementById("admin_content");

//     if (sidebar && content) {
//       if (window.innerWidth > 768) {
//         // Set the sidebar and content margin for desktop (normal behavior)
//         sidebar.style.marginLeft = "0px";
//         content.style.marginLeft = "260px"; // Content should be shifted to the right
//       } else {
//         // On mobile (small screens), sidebar is hidden by default
//         sidebar.style.marginLeft = "-260px";
//         content.style.marginLeft = "0"; // Content should align with no sidebar
//       }
//     }
//   }, []);

//   const setSelectedLinkTitle = (title) => {
//     dispatch({ type: "SET_SELECTED_LINK_TITLE", payload: title });
//   };

//   return (
//     <SidebarContext.Provider
//       value={{
//         ...state,
//         toggleSidebar,
//         setSelectedLinkTitle,
//       }}
//     >
//       {children}
//     </SidebarContext.Provider>
//   );
// };

// SidebarProvider.propTypes = {
//   children: PropTypes.node,
// };



import { createContext, useReducer, useEffect } from "react";
import reducer from "./sidebarReducer";
import PropTypes from "prop-types";

const initialState = {
  isSidebarOpen: false,
  selectedLinkTitle: "",
};

export const SidebarContext = createContext({});

export const SidebarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });

    const sidebar = document.getElementById("admin_sidebar");
    const content = document.getElementById("admin_content");

    if (sidebar && content) {
      if (window.innerWidth <= 768) {
        if (sidebar.style.marginLeft === "0px") {
          sidebar.style.marginLeft = "-260px";
          content.style.marginLeft = "0"; 
        } else {
          sidebar.style.marginLeft = "0"; 
          content.style.marginLeft = "260px"; 
        }
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.getElementById("admin_sidebar");
      const content = document.getElementById("admin_content");

      if (window.innerWidth > 768) {
        if (sidebar && content) {
          sidebar.style.marginLeft = "0";
          content.style.marginLeft = "260px";
        }
      } else {
        if (sidebar && content) {
          sidebar.style.marginLeft = "-260px"; 
          content.style.marginLeft = "0"; 
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const setSelectedLinkTitle = (title) => {
    dispatch({ type: "SET_SELECTED_LINK_TITLE", payload: title });
  };

  return (
    <SidebarContext.Provider
      value={{
        ...state,
        toggleSidebar,
        setSelectedLinkTitle,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node,
};
