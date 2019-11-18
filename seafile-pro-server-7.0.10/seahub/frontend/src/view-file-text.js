import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import toaster from './components/toast';
import { Utils } from './utils/utils';
import { gettext } from './utils/constants';
import FileView from './components/file-view/file-view';
import FileViewTip from './components/file-view/file-view-tip';
import { seafileAPI } from './utils/seafile-api';

import CodeMirror from 'react-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/php/php';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/go/go';
import 'codemirror/mode/python/python';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/lib/codemirror.css';

import './css/text-file-view.css';

const {
  err, fileExt, fileContent, repoID, filePath, fileName, canEditFile
} = window.app.pageOptions;

const options = {
  lineNumbers: true,
  mode: Utils.chooseLanguage(fileExt),
  extraKeys: {'Ctrl': 'autocomplete'},
  theme: 'default',
  textWrapping: true,
  lineWrapping: true,
  readOnly: !canEditFile,
  cursorBlinkRate: canEditFile ? 530 : -1,   // default is 530ms
};

class ViewFileText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: fileContent,
      needSave: false,
      isSaving: false,
    };
    this.onSave=this.onSave.bind(this);
  }


  updateContent = (newContent) => {
    this.setState({
      needSave: true,
      content: newContent,
    });
  }

  onSave () {
    let dirPath = '/';
    return (
      seafileAPI.getUpdateLink(repoID, dirPath).then((res) => {
        const uploadLink = res.data;
        this.setState({
          isSaving: true
        });
        return seafileAPI.updateFile(
          uploadLink,
          filePath,
          fileName,
          this.state.content
        ).then(() => {
          toaster.success(gettext('Successfully saved'), {
            duration: 2
          });
          this.setState({
            isSaving: false,
            needSave: false
          });
        });
      })
    );
  }

  render() {
    return (
      <FileView 
        content={
          <FileContent
            content={this.state.content}
            updateContent={this.updateContent}
          />
        }
        isSaving={this.state.isSaving}
        needSave={this.state.needSave}
        onSave={this.onSave}
      />
    );
  }
}

const propTypes = {
  updateContent: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
};

class FileContent extends React.Component {
  render() {
    if (err) {
      return <FileViewTip />;
    }
    return (
      <div className="file-view-content flex-1 text-file-view">
        <CodeMirror
          ref="code-mirror-editor"
          value={this.props.content}
          options={options}
          onChange={this.props.updateContent}
        />
      </div>
    );
  }
}

FileContent.propTypes = propTypes;

ReactDOM.render (
  <ViewFileText />,
  document.getElementById('wrapper')
);
