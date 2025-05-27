import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../document.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css']
})
export class DocumentManagementComponent implements OnInit {
  docTitle: string = '';
  selectedFile: File | null = null;
  uploadMessage: string | null = null;
  documents: any[] = [];
  editDocId: string | null = null;
  editDocTitle: string = '';
  docId = 'abc123'; // Replace dynamically as needed
  ingestionStatus: string = '';
  isPolling = false;
  private ingestionPollSub?: Subscription;

  constructor(private documentService: DocumentService) {}
  ngOnInit(): void {
    this.loadDocuments();
  }

  startIngestion(doc_id: string) {
  this.documentService.triggerIngestion(doc_id).subscribe({
    next: (res) => {
      console.log('Ingestion triggered:', res);
      this.pollIngestionStatus(doc_id, 'pending');
    },
    error: (err) => {
      console.error('Failed to trigger ingestion', err);
    }
  });
}
editSelectedFile: File | null = null;

onEditFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.editSelectedFile = input.files[0];
  } else {
    this.editSelectedFile = null;
  }
}

updateDocument(doc: any): void {
  const formData = new FormData();
  formData.append('title', this.editDocTitle);
  if (this.editSelectedFile) {
    formData.append('file', this.editSelectedFile); // Only append if file is selected
  }
  this.documentService.updateDocument(doc.id, formData).subscribe({
    next: () => {
      // handle success (e.g., refresh list, show message)
      this.editDocId = null;
      this.editSelectedFile = null;
      this.loadDocuments();
    },
    error: (err) => {
      // handle error
      this.uploadMessage = 'Update failed.';
    }
  });
}
   pollIngestionStatus(doc_id: string = this.docId, status: string) {
    this.isPolling = true;
    console.log('status', status);
    if (status === 'Document uploaded' || status === 'failed') {
      this.ingestionPollSub?.unsubscribe();
    }
    else {

    this.ingestionPollSub = this.documentService.pollJobStatus(doc_id).subscribe({
      next: (statusRes) => {
        console.log('Polling ingestion status:', statusRes);
        this.ingestionStatus = statusRes.status;
        // Update the doc.status
        const docIndex = this.documents.findIndex(doc => doc.id === doc_id);
        if (docIndex !== -1) {
          this.documents[docIndex].status = this.ingestionStatus;
        }
        if (
          ['completed', 'failed'].includes(this.ingestionStatus) ||
          status === 'completed' ||
          status === 'failed'
        ) {
          this.isPolling = false;
          this.ingestionPollSub?.unsubscribe();
        }
      },
      error: (err) => {
        console.error('Polling error', err);
        this.isPolling = false;
        this.ingestionPollSub?.unsubscribe();
      }
    });
  }
  }

onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.docTitle || !this.selectedFile) {
      this.uploadMessage = 'Please provide a title and select a file.';
      return;
    }
    const formData = new FormData();
    formData.append('title', this.docTitle);
    formData.append('file', this.selectedFile);
    this.documentService.uploadDocument(formData).subscribe({
      next: (res) => {
        console.log('Upload response:', res);
        this.uploadMessage = 'Upload successful!';
        this.docTitle = '';
        this.selectedFile = null;
        this.docId = res.id; // Assuming the response contains the document ID
        this.loadDocuments();
        this.startIngestion(this.docId);           // <-- Only here
        this.pollIngestionStatus(this.docId, res.msg);      // <-- Only here

      },
      error: () => this.uploadMessage = 'Upload failed.'
    });

  }

  loadDocuments() {
    this.documentService.getDocuments().subscribe({
      next: (docs) => this.documents = docs,
      error: () => this.uploadMessage = 'Failed to load documents.'
    });
  }

  startEdit(doc: any) {
    this.editDocId = doc.id;
    this.editDocTitle = doc.title;
  }

  saveDocument(doc: any) {
    const formData = new FormData();
    formData.append('title', this.editDocTitle);
    this.documentService.updateDocument(doc.id, formData).subscribe({
      next: () => {
        this.editDocId = null;
        this.loadDocuments();
      },
      error: () => this.uploadMessage = 'Update failed.'
    });
  }

  deleteDocument(doc: any) {
    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => this.loadDocuments(),
      error: () => this.uploadMessage = 'Delete failed.'
    });
  }

  downloadDocument(doc: any) {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (doc.title || 'document') + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.uploadMessage = 'Download failed.';
      }
    });
  }
}
