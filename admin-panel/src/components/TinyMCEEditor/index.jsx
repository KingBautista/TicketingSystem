import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import DOMPurify from 'dompurify';
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import './styles.css';

const TinyMCEEditor = ({ value, onChange, height = 300 }) => {
  const isDarkTheme = document.documentElement.getAttribute('data-coreui-theme') === 'dark';

  const darkModeCss = `
    body, html {
      background-color: #1e1e2d !important;
      color: #fff !important;
    }
    p, div, span {
      background-color: #1e1e2d !important;
      color: #fff !important;
    }
    a { color: #321fdb; }
    blockquote {
      border-left: 2px solid #321fdb;
      margin: 0;
      padding-left: 1rem;
      color: #fff;
    }
  `;

  const lightModeCss = `
    body, html {
      background-color: #fff;
      color: #333;
    }
    p, div, span {
      background-color: #fff;
      color: #333;
    }
    a { color: #321fdb; }
    blockquote {
      border-left: 2px solid #321fdb;
      margin: 0;
      padding-left: 1rem;
      color: #666;
    }
  `;

  return (
    <div className="tinymce-container">
      <Editor
        value={value || ''}
        onEditorChange={(content) => onChange(DOMPurify.sanitize(content))}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: isDarkTheme ? darkModeCss : lightModeCss,
          base_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3',
          suffix: '.min',
          license_key: 'gpl',
          skin: isDarkTheme ? 'oxide-dark' : 'oxide',
          content_css: isDarkTheme ? 'dark' : 'default'
        }}
      />
    </div>
  );
};

export default TinyMCEEditor; 