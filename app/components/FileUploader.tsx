import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file)

    }, [onFileSelect])

    const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 20 * 1024 * 1024,
    })

    const file = acceptedFiles[0] || null;



    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                             <img src="/images/pdf%20(1).png" alt="pdf" className="size-10" />
                            <div className="flex item-center space-x-3">
                                <div>
                                    <p className="text-small font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
                                    <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer" onClick={(e) => {
                                onFileSelect?.(null)
                            }}>
                                <img src="/icon/cross%20(2).svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">PDF (max 20MB)</p>
                        </div>
                    )}

                    {fileRejections.length > 0 && (
                        <p role="alert" className="text-sm text-red-600">
                            {fileRejections[0].errors
                                .map((error) => error.message)
                                .join(", ")}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader