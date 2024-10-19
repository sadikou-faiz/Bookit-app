"use client"

import React from 'react'
import {useKindeBrowserClient} from "@kinde-oss/kinde-auth-nextjs";
import {LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";



const page = () => {
    const {user} = useKindeBrowserClient()
  return (
   <div>
     <div>Bienvenu {user?.email}</div>
     <LogoutLink className='btn'>Log out</LogoutLink>
   </div>
  )
}

export default page