import React, { useState } from 'react';
import { Card, Upload, Button, notification } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { uploadFile } from '../../services/api';

const { Dragger } = Upload;

const FileUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    
    try {
      const response = await uploadFile(file);
      if (response.status === 'success') {
        notification.success({
          message: 'File Uploaded',
          description: response.message || 'File has been successfully uploaded and processed.',
          placement: 'topRight',
        });
        setFileList([]);
      } else {
        notification.error({
          message: 'Upload Failed',
          description: response.message || 'Failed to upload and process the file.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Upload Failed',
        description: error.message || 'An error occurred while uploading the file.',
        placement: 'topRight',
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <Card title="Upload Document to Knowledge Base" className="site-layout-content">
      <Dragger {...uploadProps} className="upload-container">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single file upload. Text files are preferred for optimal results.
        </p>
      </Dragger>
      
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          onClick={() => handleUpload(fileList[0])}
          disabled={fileList.length === 0 || uploading}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? 'Uploading' : 'Upload to Knowledge Base'}
        </Button>
      </div>
    </Card>
  );
};

export default FileUpload; 