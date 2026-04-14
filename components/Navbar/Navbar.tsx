import Search from "./Search"
import Logo from "./Logo"
import { Darkmode } from "./Darkmode"
import DropdownListMenu1 from "./DropdownListMenu1"



const Navbar = () => {
  return (
<nav>
      <div className="container flex flex-col justify-between
      py-8 sm:flex-row sm:items-center gap-4
      ">
        <Logo />
        <Search />
        <div className="flex gap-2">

        <Darkmode />
        <DropdownListMenu1 />
        </div>
      </div>
</nav>
    )
}
export default Navbar