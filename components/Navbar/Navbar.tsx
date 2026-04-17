import Search from "./Search"
import Logo from "./Logo"
import { Darkmode } from "./Darkmode"
import DropdownListMenu1 from "./DropdownListMenu1"

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex flex-col justify-between py-4 sm:flex-row sm:items-center gap-4">
        <Logo />
        <div className="flex items-center gap-4">
          <Darkmode />
          <div className="h-8 w-[1px] bg-border hidden sm:block" />
          <DropdownListMenu1 />
        </div>
      </div>
    </nav>
  )
}
export default Navbar
