"use client"

import React, { useEffect, useState } from 'react'
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Wrapper from '../components/Wrapper';

const page = () => {
  const { user } = useKindeBrowserClient()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCompanyId = async () => {
    if (user) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user.email,
            famillyName: user.family_name,
            givenName: user.given_name
          })
        });

        const data = await response.json()
        setCompanyId(data.companyId || null)
        setLoading(false)

      } catch (error) {
        console.error('erreur', error)
        setCompanyId(null)
      }
    }
  }


  useEffect(() => {
    const inititializeDate = async () => {
      await fetchCompanyId()
    }

    inititializeDate()

  }, [user])


  if (loading) {
    return (
      <Wrapper>
        <div className='w-full flex justify-center'>
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div>
        <div>
          <div className="badge badge-secondary badge-outline">
            companyId : {companyId}
          </div>
        </div>
      </div>
    </Wrapper>

  )
}

export default page