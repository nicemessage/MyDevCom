<template>
  <div class="out-wrapper">
    <el-upload
      style="display: none"
      :action="curAction"
      :show-file-list="false"
      :on-success="handleSuccess"
    >
      <el-button size="small" type="primary" id="upload-btn">点击上传</el-button>
    </el-upload>
    <quill-editor
      class="ql-editor"
      :style="{ '--height': height }"
      v-model="content"
      :options="editorOption"
      ref="QuillEditor"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
    >
    </quill-editor>
  </div>
</template>

<script>
// @ is an alias to /src
// require styles
import Vue from 'vue';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import './modify.scss';
import './image-format';
import VueQuillEditor from 'vue-quill-editor';
import { ImageDrop } from 'quill-image-drop-module';
import ImageResize from 'quill-image-resize-module';

const fontSizeStyle = Quill.import('attributors/style/size');
fontSizeStyle.whitelist = ['12px', '14px', '16px', '20px', '24px', '36px'];
Quill.register(fontSizeStyle, true);
Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/imageResize', ImageResize);
Vue.use(VueQuillEditor);
// align改成行内样式 (默认是类名需要引入css)
const Align = Quill.import('attributors/style/align');
Align.whitelist = ['right', 'center', 'justify'];
Quill.register(Align, true);
export default {
  name: 'JRichText',
  props: ['value', 'height', 'no-image'],
  created() {
    this.content = this.value;
  },
  data() {
    return {
      content: '',
      editorOption: {
        placeholder: '',
        modules: {
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ size: fontSizeStyle.whitelist }],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }, 'blockquote', 'code-block'],
              [{ align: [] }],

              ['link', `${this.noImage === '' ? '' : 'image'}`],
            ],
            handlers: {
              image(value) {
                if (value) {
                  document.querySelector('#upload-btn').click();
                } else {
                  this.quill.format('image', false);
                }
              },
            },
          },
          imageDrop: true,
          imageResize: {
            // 调整大小组件。
            displayStyles: {
              backgroundColor: 'black',
              border: 'none',
              color: 'white',
            },
            modules: ['Resize', 'DisplaySize', 'Toolbar'],
          },
        },
      },
    };
  },

  components: {},
  methods: {
    onEditorBlur() {},
    onEditorFocus() {},
    onEditorReady() {},
    handleSuccess(res) {
      // 获取富文本组件实例
      res = res.result.fileUrl;
      const quill = this.$refs.QuillEditor.quill;
      // 如果上传成功
      if (res) {
        // 获取光标所在位置
        const length = quill.getSelection().index;
        // 插入图片，res为服务器返回的图片链接地址
        quill.insertEmbed(length, 'image', res);
        // 调整光标到最后
        quill.setSelection(length + 1);
      } else {
        // 提示信息，需引入Message
        this.$message.error('图片插入失败');
      }
    },
  },
  watch: {
    content(newValue) {
      this.$emit('input', newValue);
    },
    // 解决组件复用不能回显的问题
    value(newVal) {
      this.content = newVal;
    },
  },
  computed: {
    curAction() {
      return '/map/core/galaxy-data-ency/ency/ency-wiki/wiki/uploadPic';
    },
  },
};
</script>

<style scoped lang="scss">
// 设置编辑器高度
::v-deep .ql-container {
  height: var(--height);
  padding: 10px;
  position: relative;
}
::v-deep .ql-editor {
  padding: 0px;
}
</style>
