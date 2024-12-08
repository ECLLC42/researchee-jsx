import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { uploadFile, getFile } from './blob';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const downloadPDF = async () => {
  const element = document.querySelector('.chat-container') as HTMLElement;
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
  // Convert PDF to blob
  const pdfBlob = pdf.output('blob');
  
  // Upload to Blob storage
  const key = `pdfs/${Date.now()}-research.pdf`;
  const { url } = await uploadFile(key, pdfBlob, {
    access: 'public',
    addRandomSuffix: true
  });
  
  // Trigger download
  window.open(url);
};

export const downloadHistory = async (messages: Message[]) => {
  const content = messages
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}\n\n`)
    .join('---\n\n');
    
  // Upload to Blob storage
  const key = `history/${Date.now()}-chat-history.txt`;
  const { url } = await uploadFile(key, content, {
    access: 'public',
    addRandomSuffix: true
  });
  
  // Trigger download
  window.open(url);
};

export const debugBlob = async (blob: Blob) => {
  console.log('Blob Debug Info:', {
    size: blob.size,
    type: blob.type,
    stream: blob.stream !== undefined,
    arrayBuffer: blob.arrayBuffer !== undefined,
  });
  
  try {
    const text = await blob.text();
    console.log('Blob content preview:', text.substring(0, 100) + '...');
  } catch (error) {
    console.error('Error reading blob:', error);
  }
}; 