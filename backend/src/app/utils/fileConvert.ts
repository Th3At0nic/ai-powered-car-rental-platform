// import libre from 'libreoffice-convert';
// import { promisify } from 'util';
// import pdfParse from 'pdf-parse';
// import * as XLSX from 'xlsx';
// import * as path from 'path';
// import * as fs from 'fs';
// import * as os from 'os';

// const libreConvertAsync = promisify(libre.convert);

// export const convertPdfToDocx = async (pdfBuffer: Buffer): Promise<Buffer> => {
//   try {
//     const docxBuffer = await libreConvertAsync(pdfBuffer, '.docx', undefined);
//     return docxBuffer;
//   } catch (error: any) {
//     throw new Error(`PDF to DOCX conversion failed : ${error.message}`);
//   }
// };

// export const convertPdfToXlsx = async (pdfBuffer: Buffer): Promise<Buffer> => {
//   try {
//     const pdfData = await pdfParse(pdfBuffer);
//     const rawText = pdfData.text;

//     const lines = rawText
//       .split('\n')
//       .map((line: string) => line.trim())
//       .filter((line: string) => line.length > 0);

//     const rows: string[][] = lines.map((line: string) => {
//       return line.split(/\s{2,}/).map((col: string) => col.trim());
//     });

//     const worksheet = XLSX.utils.aoa_to_sheet(rows);

//     const colWidths = rows.reduce((acc: number[], row) => {
//       row.forEach((cell, i) => {
//         acc[i] = Math.max(acc[i] || 10, cell.length + 2);
//       });
//       return acc;
//     }, []);
//     worksheet['!cols'] = colWidths.map((w) => ({ wch: w }));

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

//     const xlsxBuffer = XLSX.write(workbook, {
//       type: 'buffer',
//       bookType: 'xlsx',
//     }) as Buffer;

//     return xlsxBuffer;
//   } catch (error: any) {
//     throw new Error(`PDF to XLSX conversion failed: ${error.message}`);
//   }
// };
