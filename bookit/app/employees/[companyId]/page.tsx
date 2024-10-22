"use client"
import Wrapper from '@/app/components/Wrapper'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import React, { useEffect, useState } from 'react'
import Notification from '@/app/components/Notification'

interface Employee {
  id: string;
  email: string;
  givenName: string | null;
  famillyName: string | null
}

const page = ({ params }: { params: { companyId: string } }) => {

  const { user } = useKindeBrowserClient()
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])


  const [notification, setNotification] = useState<string>('')
  const closeNotification = () => {
    setNotification("")
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/companies', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.companyId,
          creatorEmail: user?.email,
          employeeEmail: employeeEmail,
          action: 'ADD'

        })
      })
      const data = await response.json()

      if (response.ok) {
        setNotification('Employé ajouté avec succès !')
        fetchEmployees()
      } else {
        setNotification(`${data.message}`)
      }

      setEmployeeEmail('')

    } catch (error) {
      console.error(error)
      setNotification('Erreur interne du serveur')
    }

  }

  const handleRemoveEmployee = async (employeeEmail : string) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.companyId,
          creatorEmail: user?.email,
          employeeEmail: employeeEmail,
          action: 'DELETE'

        })
      })
      const data = await response.json()

      if (response.ok) {
        setNotification('Employé supprimé avec succès !')
        fetchEmployees()
      } else {
        setNotification(`${data.message}`)
      }

      setEmployeeEmail('')

    } catch (error) {
      console.error(error)
      setNotification('Erreur interne du serveur')
    }

  }

  useEffect(() => {
    fetchEmployees()
  }, [params.companyId])


  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees?companyId=${params.companyId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      const data = await response.json()
      setEmployees(data.employees)
      setCompanyName(data.companyName)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }



  return (

    <Wrapper>

      {notification && (
        <Notification message={notification} onclose={closeNotification}></Notification>
      )}
      <div>
        {loading ? (
          <div className='text-center mt-32'>
            <span className="loading loading-spinner loading-lg"></span>
          </div>

        ) : (
          <div>
            <div className="badge badge-secondary badge-outline mb-2">{companyName}</div>
            <h1 className='text-2xl mb-4'>Ajouter un Nouvel Employé</h1>

            <form onSubmit={handleAddEmployee}>
              <div className='mb-4 flex flex-row'>
                <input
                  type="email"
                  placeholder="Email de l'employé"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  className='input input-bordered max-w-xs'
                  required
                />
                <button type='submit' className='btn btn-secondary ml-2'>Ajouter l'employé</button>

              </div>
            </form>

            <h1 className='text-2xl mb-4'>Liste des Employés</h1>
            <div className='mt-4'>
              {employees.length > 0 ? (
                <ol className='divide-base-200 divide-y'>
                  {employees.map((employee) => {
                    const hasFullname = employee.givenName && employee.famillyName
                    return (
                      <li key={employee.id} className='py-4 flex flex-col md:flex-row items-start md:items-center justify-between'>

                        <div className='flex items-center md:mb-0'>

                          <span className={`relative flex h-3 w-3 mr-2 rounded-full ${hasFullname ? "bg-green-500" : "bg-red-500"}`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75  ${hasFullname ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 "></span>
                          </span>

                          <div>
                            <span className='font-bold'>
                              {employee.email}
                            </span>
                            <div className='md:mb-0 italic mt-1 text-gray-400'>
                              {hasFullname ? `${employee.givenName} ${employee.famillyName}` : "Pas encore inscrit"}
                            </div>
                            <button
                              className='btn btn-outline btn-secondary btn-sm mt-2 md:mt-0 flex md:hidden'
                              onClick={ () => handleRemoveEmployee(employee.email)}
                            >
                              Enlever
                            </button>
                          </div>

                        </div>

                        <div>
                          <button
                            className='btn btn-outline btn-secondary btn-sm mt-2 md:mt-0  hidden md:flex'
                            onClick={ () => handleRemoveEmployee(employee.email)}
                          >
                            Enlever
                          </button>
                        </div>

                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p>Aucun employé trouvé.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default page
