import {Link} from "react-router";
import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";

const Navbar= () =>{
    const {auth} = usePuterStore();
    useEffect(() => {
    }, [auth.isAuthenticated]);

    return(
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <div className="flex flex-row gap-2">
                <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
                <button className="secondary-button w-fit" onClick={auth.signOut}>Log Out</button>
            </div>
        </nav>
    )
}

export default Navbar;