const handleLogout = async (navigate) => {
    localStorage.removeItem("user");
    navigate("/");
};

export default handleLogout