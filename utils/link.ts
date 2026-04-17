type NavLinks = {
  href:string,
  label:string
}

export const links: NavLinks[] =[
  { href:'/',label:'Home' },
  { href:'/library',label:'Library'},
  { href:'/song/create', label: 'Add Song' },
  { href:'/profile',label:'Profile'}
]