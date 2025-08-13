const sidebarReducer = (state, action) => {
    if (action.type === "TOGGLE_SIDEBAR") {
        return { ...state, isSidebarOpen: !state.isSidebarOpen };
    }

   
    if (action.type === "SET_SELECTED_LINK_TITLE") {
        return { ...state, selectedLinkTitle: action.payload };
    }

    throw new Error(`No matching "${action.type}" action type`);
};

export default sidebarReducer;


