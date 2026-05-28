"use client"
import { job_service, useAppData } from '@/context/AppContext'
import React, { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/components/loading'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import {
  BriefcaseBusiness,
  Building2,
  Eye,
  FileTextIcon,
  Globe,
  ImageIcon,
  Plus,
  Trash2Icon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Company as CompanyType } from '@/type'
import Image from 'next/image'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const Company = () => {
  const { loading } = useAppData()

  const addRef = useRef<HTMLButtonElement | null>(null)

  const openDialog = () => {
    addRef.current?.click()
  }

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const [companies, setCompanies] = useState<CompanyType[]>([]) // Fixed typo: comapnies -> companies

const [comapnyLoading,setCompanyLoading]=useState(true)

  const clearData = () => {
    setName("")
    setDescription("")
    setWebsite("")
    setLogo(null)
  }

  const token = Cookies.get("token")

  async function fetchCompanies() {
    try {
      const { data } = await axios.get(
        `${job_service}/api/jobs/company/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setCompanies(data.companies)
    } catch (error: any) {
      console.log(error)
    }finally{
      setCompanyLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function addCompanyHandler() {
    if (!name || !description || !website || !logo) {
      toast.error("Please provide all the Following Details")
      return
    }

    const formData = new FormData()

    formData.append("name", name)
    formData.append("description", description)
    formData.append("website", website)
    formData.append("file", logo)
  
    try {
      setBtnLoading(true)

      const { data } = await axios.post(
        `${job_service}/api/jobs/company/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
              // "Content-Type": "multipart/form-data",
          }
        }
      )

      toast.success(data.message)

      clearData()
      fetchCompanies()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create company"
      )
    } finally {
      setBtnLoading(false)
    }
  }

  async function deleteCompany(id: string) {
    try {
      setBtnLoading(true)

      const { data } = await axios.delete(
        `${job_service}/api/jobs/company/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.success(data.message)

      fetchCompanies()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete company"
      )
    } finally {
      setBtnLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className='max-w-7xl mx-auto px-4 pt-6'>
      <Card className='shadow-lg border-2 overflow-hidden'>
        <div className="bg-blue-500 p-6 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Building2 size={20} className='text-blue-600' />
              </div>

              <div>
                <CardTitle className='text-2xl text-white'>
                  My Companies
                </CardTitle>

                <CardDescription className='text-sm mt-1 text-white'>
                  Manage Your Registered Companies ({companies.length}/3)
                </CardDescription>
              </div>
            </div>

            {companies.length < 3 && (
              <Button onClick={openDialog} className='gap-2'>
                <Plus size={18} />
                Add company
              </Button>
            )}
          </div>
        </div>

       {comapnyLoading ? <Loading/> : <div className="p-6">
          {companies.length > 0 ? (
            <div className="grid gap-4">
              {companies.map((c) => (
                <div
                  key={c.company_id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-600 border-2 transition-all bg-background"
                >
                  <div className="h-16 w-16 rounded-full border-2 overflow-hidden shrink-0 bg-background">
                    <Image
                      src={c.logo}
                      alt="Company Logo"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>

                  {/* info company */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {c.name}
                    </h3>

                    <p className='text-sm opacity-70 line-clamp-2 mb-2'>
                      {c.description}
                    </p>

                    <a
                      href={c.website}
                      target='_blank'
                      rel="noopener noreferrer"
                      className='text-xs text-blue-500 hover:underline flex items-center gap-1'
                    >
                      <Globe size={12} />
                      {c.website}
                    </a>
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/company/${c.company_id}`}>
                      <Button
                        variant={'outline'}
                        size={'icon'}
                        className='h-9 w-9'
                      >
                        <Eye size={16} />
                      </Button>
                    </Link>

                    {/* Alert Dialog for Deletion */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={'destructive'}
                          size={'icon'}
                          className='h-9 w-9'
                        >
                          <Trash2Icon size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the company 
                            "{c.name}" and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteCompany(c.company_id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Building2 size={32} className='opacity-40' />
              </div>

              <CardDescription className='text-base mb-4'>
                No Companies Registered Yet
              </CardDescription>

              <p className='text-sm opacity-60'>
                Add Your first Company posting jobs
              </p>
            </div>
          )}
        </div>}

      </Card>

      {/* dialog box */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className='hidden' ref={addRef}></Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-137.5'>
          <DialogHeader>
            <DialogTitle className='text-2xl flex items-center gap-2'>
              <Building2 className='text-blue-600' />
              Add New Company
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new company to your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor='name'
                className='text-sm font-medium flex items-center gap-2'
              >
                <BriefcaseBusiness size={15} />
                Company Name
              </Label>

              <Input
                id='name'
                type='text'
                placeholder='enter company name'
                className='h-11'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor='description'
                className='text-sm font-medium flex items-center gap-2'
              >
                <FileTextIcon size={15} />
                Description
              </Label>

              <Input
                id='description'
                type='text'
                placeholder='enter description'
                className='h-11'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor='website'
                className='text-sm font-medium flex items-center gap-2'
              >
                <Globe size={15} />
                Website
              </Label>

              <Input
                id='website'
                type='text'
                placeholder='enter website'
                className='h-11'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor='logo'
                className='text-sm font-medium flex items-center gap-2'
              >
                <ImageIcon size={15} />
                Company Logo
              </Label>

              <Input
                id='logo'
                type='file'
                className='h-11 cursor-pointer'
                accept='image/*'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLogo(e.target.files?.[0] || null)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={btnLoading}
              onClick={addCompanyHandler}
              className='w-full h-11'
            >
              {btnLoading ? "adding company...." : "add company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Company