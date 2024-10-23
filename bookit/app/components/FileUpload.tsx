import { ImageDown } from 'lucide-react';
import React, { useRef } from 'react'

interface FileUploadProps {
    onFilechange: (file: File | null) => void;
    accept?: string
    buttonLabel?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilechange, accept = "image/*", buttonLabel = "Uploader une image" }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        onFilechange(file)
    }
    const handleClick = () => {
        fileInputRef.current?.click()
    }
    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                accept={accept}
                onChange={handleFileChange}
                className='hidden'
            />
            <div
                onClick={handleClick}
                className='cursor-pointer w-full flex justify-center items-center flex-col-reverse'
            >
                <ImageDown className='mt-5 w-8' />
                <span className='ml-2 font-bold'>{buttonLabel}
                </span>
            </div>
        </div>
    )
}

export default FileUpload
