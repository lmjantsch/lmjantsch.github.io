import { useState } from "react"
import {ChevronDown} from "lucide-react"

export function CvListItem({data, key}: {data:{ title: string; note: string ; details?: string[]; links?: {title:string, link:string}[]}, key:number}) {
    const [showDetails, setShowDetails] = useState<boolean>(false)

    return(
        <li className="ml-5 mb-2">
            <div className={`relative flex flex-row items-center ${data.details && "cursor-pointer"}`} onClick={()=>setShowDetails(!showDetails)}>
                {data.details && <div className={`absolute -left-5 z-10 text-primary dark:text-primary_dark ${showDetails && "-rotate-90"} transition-transform duration-300 ease-in-out`}><ChevronDown size={18}/></div>}
                <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-base text-primary dark:text-primary_dark">{data.title}</strong> — {data.note}</p>
            </div>
            {data.details &&
                <div className="relative overflow-hidden">
                    <ul data-status={showDetails}
                    className={`list-disc pl-5 mb-1 data-[status=false]:max-h-0 data-[status=true]:max-h-500 data-[status=true]:ease-[cubic-bezier(1,0,1,0.2)]  data-[status=false]:ease-[cubic-bezier(0,1,0,1)] delay-0 transition-[max-height] duration-300 `} //ease-[cubic-bezier(1,0,1,0)] 
                    >
                        {data.details.map((item:string, index:number) => (
                            <li className="text-sm text-primary dark:text-primary_dark" key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            }
            {'links' in data && data.links && 
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-primary dark:text-primary_dark">
                    {data.links.map((item: {title:string, link:string}, index:number) => (
                        <a href={item.link} className="hover:underline" key={index}>{item.title}</a>
                    ))}
                </div>
            }
        </li>
    )

}