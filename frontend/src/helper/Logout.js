const handleLogout = async (navigate) => {
    localStorage.clear();
    navigate("/");
};

export default handleLogout