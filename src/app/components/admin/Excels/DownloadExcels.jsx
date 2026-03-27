"use client";
import exportFromJSON from "export-from-json";
import Image from "next/image";
import { useState } from "react";
import { getRequest } from "@/app/lib/apicall.js"
const DownloadExcels = ({ excel_url }) => {

  const [loading, setLoading] = useState(false);
  const exportType = exportFromJSON.types.csv;

  const downloadFile = ({ excelData, KeyArray, fileName }) => {
    
    try {
      const newArr = [];
      excelData.forEach((value) => {
        const myObj = {};

        for (const key of KeyArray) {
          if (key === "createdAt" || key === "updatedAt") {
            myObj[key] = value[key].split("T")[0];
            continue;
          }
          if (key === "Name") {
            const {
              Name = "",
              Salutation = "",
              MiddleName = "",
              LastName = "",
            } = value;
            myObj["Name"] = `${Salutation ?? ""} ${Name ?? ""} ${MiddleName ?? ""
              } ${LastName ?? ""}`;
            continue;
          }
          myObj[key] = value[key] ?? "";
          newArr.push(myObj);
        }
      });
      const jsonObject = newArr.map(JSON.stringify);
      const uniqueSet = new Set(jsonObject);
      const uniqueArray = Array.from(uniqueSet).map(JSON.parse);
      exportFromJSON({
        data: uniqueArray,
        fileName: fileName,
        exportType: exportType,
      });
    } catch (error) {
      
    }
  };
  const getData = async () => {
    try {
      setLoading(true);
      const excel_responce_data = await getRequest(`${excel_url}`)
      
      if (excel_responce_data.success) {
        downloadFile({ excelData: excel_responce_data.excelData, KeyArray: excel_responce_data.KeyArray, fileName: excel_responce_data.fileName })
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }

  }
  return (
    <>
      {loading ? (
        <Image
          src={'/images/admin/Download.gif'}
          alt="My GIF"
          width={35}
          height={35}
          unoptimized
        />
      ) :
        <div className="excel-image searchicon" onClick={getData}>

          <Image
            src={'/images/admin/excel.svg'}
            alt="My excel"
            width={24}
            height={24}

          />
        </div>
      }
    </>
  );
};

export default DownloadExcels;
