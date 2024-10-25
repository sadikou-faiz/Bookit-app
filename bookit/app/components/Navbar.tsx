"use client";

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { CalendarCheck, Menu, X } from 'lucide-react'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

const Navbar = () => {
    const { user } = useKindeBrowserClient()
    const pathname = usePathname();
    const [loading, setLoading] = useState<boolean>(true)
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    useEffect(() => {
        if (user) {
            setLoading(false)
        } else {
            setLoading(true)
        }
    }, [user])

    const isActive = (link: string) => pathname === link

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <div className=' fixed top-0 w-full bg-white backdrop-blur-sm'>
            <nav className='md:px-[10%] p-5 border-b border-base-200 w-full bg-white'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold flex items-center'>
                            <div className='bg-secondary p-1 mr-1 rounded-md text-white'>
                                <CalendarCheck />
                            </div>
                            <span>Book<span className='text-secondary'>It</span></span>
                        </h1>
                        {loading ? (
                            <div className=' flex justify-end mt-2'>
                                <span className="loading loading-spinner loading-xs"></span>
                            </div>
                        ) : (
                            <div className=' flex justify-end mt-2'>
                                <div className="badge badge-ghost">{user?.email}</div>
                            </div>
                        )

                        }
                    </div>

                    <div className=' hidden md:flex items-center space-x-6'>

                        <Link href={'/create-company'} className={`link link-hover font-extrabold ${isActive('/create-company') ? 'text-secondary' : ''} `}>
                            Vos entreprises
                        </Link>

                        <Link href={'/dashboard'} className={`link link-hover font-extrabold ${isActive('/dashboard') ? 'text-secondary' : ''} `}>
                            Réserver
                        </Link>
                        
                        <Link href={'/my-reservations'} className={`link link-hover font-extrabold ${isActive('/my-reservations') ? 'text-secondary' : ''} `}>
                            Mes réservations
                        </Link>


                    </div>

                    <LogoutLink className='btn btn-secondary btn-sm hidden md:flex'>Déconnexion</LogoutLink>

                    <div className='md:hidden'>
                        <button className='btn btn-ghost mb-2' onClick={toggleMenu}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                </div>
            </nav>

            {isMenuOpen && (
                <div className='md:hidden shadow-lg p-4 rounded-lg space-y-4 flex flex-col mt-3'>
                    <Link href={'/create-company'} className={`link link-hover font-extrabold ${isActive('/create-company') ? 'text-secondary' : ''} `}>
                        Vos entreprises
                    </Link>
                    <Link href={'/dashboard'} className={`link link-hover font-extrabold ${isActive('/dashboard') ? 'text-secondary' : ''} `}>
                        Réserver
                    </Link>

                    <Link href={'/my-reservations'} className={`link link-hover font-extrabold ${isActive('/my-reservations') ? 'text-secondary' : ''} `}>
                            Mes réservations
                    </Link>

                    <LogoutLink className='btn btn-secondary btn-sm  '>Déconnexion</LogoutLink>
                </div>
            )}
        </div>
    )
}

export default Navbar