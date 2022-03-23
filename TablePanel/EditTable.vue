<template>
  <div style="width: 100%" class="auto-table" @drop="dropHandler" @dragover="allowDrop">
    <el-form :model="tableForm" ref="tableForm">
      <table class="table table-bordered" id="hl-tree-table">
        <thead>
          <tr>
            <th v-for="(column, index) in columns" :key="index" :style="tdStyle(column)">
              <label v-html="column.title"></label>
            </th>
          </tr>
        </thead>
        <!-- 有数据这样显示-->
        <draggable
          :list="tableForm.tableData"
          tag="tbody"
          draggable=".tr-draggable__inner"
          handle=".draggable-icon"
          :animation="150"
          class="drag-table"
          :move="listMove"
        >
          <tr v-if="tableForm.tableData.length === 0">
            <td :colspan="columns.length" style="text-align: center; height: 50px">暂无数据</td>
          </tr>
          <tr
            v-for="(item, index) in tableForm.tableData"
            :key="index"
            class="tr-draggable__inner"
            v-else
          >
            <td v-for="(column, cIndex) in columns" :key="cIndex" :style="tdStyle(column)">
              <div>
                <!-- 操作列 -->
                <template v-if="column.type === 'action'">
                  <div class="action-container">
                    <el-button
                      type="text"
                      @click="rowClick(index, 'delete')"
                      :disabled="publishDisable || index === 0 || item.operateStatus === 'audited'"
                      >移除</el-button
                    >
                    <el-button
                      type="text"
                      @click="rowClick(index, 'append')"
                      :disabled="publishDisable || item.operateStatus === 'audited'"
                      >插入</el-button
                    >
                  </div>
                </template>
                <!-- 拖动列 -->
                <template v-else-if="column.type === 'drag'">
                  <span class="draggable-icon" v-if="item.operateStatus !== 'audited'">
                    <i class="iconfont icon-jiantou_shangxiaqiehuan"></i>
                  </span>
                  <span class="draggable-icon-no" v-else>
                    <i class="iconfont icon-jiantou_shangxiaqiehuan"></i>
                  </span>
                </template>
                <!-- 非操作列 -->
                <template v-else>
                  <!--  下面这些是表格里边涉及的element组件 -->
                  <!--  如果是分区字段且发布的状态单独走if -->
                  <template v-if="publishDisable">
                    <div v-if="column.type === 'index'">
                      <span class="tr-index">{{ index + 1 }}</span>
                    </div>
                    <div v-else-if="column.type === 'Input'">
                      <el-input disabled v-model="item[column.key]" />
                    </div>
                    <!-- checkbox -->
                    <div v-else-if="column.type === 'Checkbox'">
                      <el-checkbox v-model="item[column.key]" disabled />
                    </div>
                    <!-- el-select group -->
                    <div v-else-if="column.type === 'SelectGroup'" class="select-container">
                      <el-select
                        v-model="item[column.key]"
                        disabled
                        @change="groupChange(column.options, item[column.key], item)"
                      >
                        <el-option-group
                          v-for="group in column.options"
                          :key="group.label"
                          :label="group.label"
                        >
                          <el-option
                            v-for="item in group.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          >
                          </el-option>
                        </el-option-group>
                      </el-select>
                    </div>
                    <!-- el-select -->
                    <div v-else-if="column.type === 'Select'" class="select-container">
                      <el-select v-model="item[column.key]" disabled>
                        <el-option
                          v-for="(item, index) in column.options"
                          :value="item.value"
                          :key="index"
                          :label="item.label"
                        />
                      </el-select>
                    </div>
                    <!-- 普通文本-->
                    <div v-else>
                      <span>{{ item[column.key] }}</span>
                    </div>
                  </template>
                  <!--  else是正常逻辑 -->
                  <template v-else>
                    <div v-if="column.type === 'index'">
                      <span class="tr-index">{{ index + 1 }}</span>
                    </div>
                    <div v-else-if="column.type === 'Input'">
                      <el-form-item
                        v-if="column.validate"
                        class="form-item"
                        :prop="'tableData.' + index + '.' + column.key"
                        :rules="column.rules"
                      >
                        <!--英文名-->
                        <el-input
                          v-if="column.popup"
                          ref="popup"
                          v-model="item[column.key]"
                          :disabled="item.operateStatus === 'audited'"
                          @focus="openTip($event, item, columns[cIndex - 1].key, column.key, index)"
                          @blur="closeTip($event)"
                        />
                        <!--长度、精度-->
                        <el-input
                          v-else-if="column.setDisable"
                          v-model="item[column.key]"
                          :disabled="!item[column.disableKey]"
                        />
                        <!--中文名、备注等-->
                        <el-input v-else v-model="item[column.key]" />
                      </el-form-item>
                      <template v-else>
                        <!--英文名-->
                        <el-input
                          v-if="column.popup"
                          ref="popup"
                          v-model="item[column.key]"
                          :disabled="item.operateStatus === 'audited'"
                          @focus="openTip($event, item, columns[cIndex - 1].key, column.key, index)"
                          @blur="closeTip($event)"
                        />
                        <!--长度、精度-->
                        <el-input
                          v-else-if="column.setDisable"
                          v-model="item[column.key]"
                          :disabled="!item[column.disableKey]"
                        />
                        <el-input v-else v-model="item[column.key]" />
                      </template>
                    </div>
                    <!-- checkbox -->
                    <div v-else-if="column.type === 'Checkbox'">
                      <el-checkbox
                        v-model="item[column.key]"
                        @change="(val) => handleChange(val, column.key, item)"
                      />
                    </div>
                    <!-- el-select group -->
                    <div v-else-if="column.type === 'SelectGroup'" class="select-container">
                      <el-select
                        v-model="item[column.key]"
                        @change="groupChange(column.options, item[column.key], item)"
                      >
                        <el-option-group
                          v-for="(group, index) in column.options"
                          :key="index"
                          :label="group.label"
                        >
                          <el-option
                            v-for="(item, index) in group.options"
                            :key="index"
                            :label="item.label"
                            :value="item.value"
                          >
                          </el-option>
                        </el-option-group>
                      </el-select>
                    </div>
                    <!-- el-select -->
                    <div v-else-if="column.type === 'Select'" class="select-container">
                      <el-select v-model="item[column.key]">
                        <el-option
                          v-for="(item, index) in column.options"
                          :value="item.value"
                          :key="index"
                          :label="item.label"
                        />
                      </el-select>
                    </div>
                    <div v-else>
                      <span>{{ item[column.key] }}</span>
                    </div>
                  </template>
                </template>
              </div>
            </td>
          </tr>
          <tr>
            <template>
              <td :colspan="3">
                <div class="next-container">
                  <el-input
                    v-model="addValue"
                    :placeholder="publishDisable ? '' : '请输入'"
                    style="width: 70%"
                    :disabled="publishDisable"
                    @keydown.native.enter="addRow()"
                  />
                  <el-button
                    type="text"
                    style="width: 30%; text-align: center; color: #666666; font-weight: normal"
                    @click="addRow()"
                    :disabled="publishDisable"
                    >添加</el-button
                  >
                </div>
              </td>
              <td :colspan="columns.length - 3"></td>
            </template>
          </tr>
        </draggable>
      </table>
    </el-form>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import { cloneDeep } from 'lodash';

export default {
  name: 'EditTable',
  props: {
    columns: Array,
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    type: String,
    publishDisable: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    draggable,
  },
  data() {
    return {
      tableForm: {
        tableData: this.items,
      },
      addValue: '',
      addObject: {},
    };
  },
  created() {
    this.columns.forEach((item) => {
      if (item.key) {
        switch (item.key) {
          case 'filedType':
            this.addObject[item.key] = 'string';
            break;
          case 'attriType':
            this.addObject[item.key] = '0';
            break;
          default:
            this.addObject[item.key] = '';
        }
      }
    });
    if (this.type !== 'PROCESS') {
      this.addObject.canUseLength = 0;
      this.addObject.canUseAccuracy = 0;
      this.addObject.fieldConf = '';
    }
  },
  watch: {
    items(newValue) {
      this.tableForm.tableData = this.items;
    },
  },
  mounted() {},
  methods: {
    // 打开提示并定位
    openTip(e, item, preKey, key, index) {
      const { target } = e;
      this.$emit('open-tip', target, item, preKey, key, index);
    },
    // 关闭提示
    closeTip(e) {
      if (e.relatedTarget) {
        this.$emit('close-tip');
      }
    },
    // 添加一行数据
    addRow(data) {
      const newAddObject = cloneDeep(this.addObject);
      newAddObject.fieldSourceId = '';
      newAddObject.fieldSource = 'custom';
      if (data) {
        // 表外字段拖拽进来逻辑
        newAddObject.filedDesc = data.fieldCnName;
        newAddObject.filedName = data.fieldEnName;
        this.tableForm.tableData.push(newAddObject);
      } else {
        // 点击添加按钮逻辑
        // 处理addValue
        if (this.type !== 'PROCESS') {
          newAddObject.filedDesc = this.addValue;
        } else {
          newAddObject.fieldCnName = this.addValue;
        }
        this.tableForm.tableData.push(newAddObject);
        this.addValue = '';
        this.$nextTick(() => {
          this.$refs.popup[this.tableForm.tableData.length - 1].focus();
        });
      }
    },
    // 设置td宽度
    tdStyle(column) {
      const style = {};
      if (column.minWidth) {
        style['min-width'] = `${column.minWidth}px`;
      }
      return style;
    },
    // 删除 插入按钮点击事件
    rowClick(index, type) {
      if (type === 'delete') {
        this.tableForm.tableData.splice(index, 1);
      } else {
        const newAddObject = cloneDeep(this.addObject);
        newAddObject.fieldSourceId = '';
        newAddObject.fieldSource = 'custom';
        this.tableForm.tableData.splice(index + 1, 0, newAddObject);
      }
    },
    // 数据类型选择器事件
    groupChange(options, val, obj) {
      options = options[0].options.concat(options[1].options);
      const cur = options.filter((item) => item.value === val);
      obj.canUseLength = cur[0].fieldLength ? 1 : 0;
      obj.canUseAccuracy = cur[0].fieldPrecision ? 1 : 0;
      obj.filedLength = '';
      obj.filedAccuracy = '';
    },
    dropHandler(e) {
      if (this.publishDisable) {
        return;
      }
      try {
        const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));
        this.addRow(fieldData);
      } catch (err) {
        console.log(err);
      }
    },
    allowDrop(e) {
      e.preventDefault();
    },
    // 发布过的字段定死逻辑 未发布的字段不能拖动到发布字段前面
    listMove({ draggedContext }) {
      if (draggedContext.futureIndex > this.publishEndIndex) {
        return true;
      } else {
        return false;
      }
    },
    handleChange(val, key, item) {
      if (key === 'isSensitive' && val) {
        this.$confirm(
          '按照公司安全管理规定，敏感字段需使用AKS加密存储数据，禁止明文或非标加密写入!',
          '',
          {
            confirmButtonText: '我已了解',
            cancelButtonText: '取消',
            type: 'warning',
            showClose: false,
          }
        )
          .then(() => {})
          .catch(() => {
            item[key] = false;
          });
      }
    },
  },
  computed: {
    publishEndIndex() {
      let auditedNum = 0;
      this.tableForm.tableData.forEach((item) => {
        if (item.operateStatus === 'audited') {
          auditedNum++;
        }
      });
      return auditedNum - 1;
    },
  },
};
</script>
<style scoped>
.next-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.auto-table {
  overflow: auto;
}
table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
}
.table-bordered {
  font-size: 13px;
  border: 1px solid #ebebeb;
}
.table > tbody > tr > td,
.table > tbody > tr > th,
.table > thead > tr > td,
.table > thead > tr > th {
  border-top: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}
.drag-table:focus {
  outline: none;
}

.drag-table > .draggable-mirror {
  width: 100%;
  background: #ffffff;
}
/* .drag-table .draggable-disabled:hover {
  outline: 1px solid rgba(255, 0, 0, .4);
} */

.table-bordered > tbody > tr > td,
.table-bordered > tbody > tr > th,
.table-bordered > tfoot > tr > td,
.table-bordered > tfoot > tr > th,
.table-bordered > thead > tr > td,
.table-bordered > thead > tr > th {
  border: 1px solid #e7e7e7;
}
.table > thead > tr > th {
  border-bottom: 1px solid #ddd;
}
.table-bordered > thead > tr > td,
.table-bordered > thead > tr > th {
  background-color: #f5f5f6;
}

#hl-tree-table > tbody > tr:hover {
  background-color: #fbfbfb;
}
#hl-tree-table > tbody > .child-tr {
  background-color: #fff;
}
label {
  margin: 0 8px;
}
.ms-tree-space {
  position: relative;
  top: 1px;
  display: inline-block;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  width: 14px;
  height: 14px;
}
.ms-tree-space::before {
  content: '';
}
#hl-tree-table th > label {
  margin: 0;
}
.ios-arrow-forward:before {
  content: '\F11F';
}
.ios-arrow-down:before {
  content: '\F116';
}
.ivu-icon {
  cursor: pointer;
  margin-right: 2px;
}
.ref-container {
  min-height: 12px;
  max-width: 200px;
  word-wrap: break-word;
  word-break: normal;
  cursor: pointer;
}

.action-container {
  min-width: 100px;
  width: 100%;
  max-width: 100%;
  color: #2d8cf0;
  cursor: pointer;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.next-container .ivu-input-wrapper {
  width: auto !important;
  max-width: 80%;
}
.select-container .meta-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.select-container .meta-container .meta {
  min-width: 100px;
}
.is-dropping {
  outline: 2px dashed #589ef8;
}
.draggable-icon {
  cursor: crosshair;
}
.draggable-icon-no {
  cursor: not-allowed;
}
.el-form-item {
  padding: 0;
  margin-bottom: 0px;
}
.auto-table ::v-deep .el-form-item__error {
  position: absolute;
  top: 70%;
  left: 8px;
  background: white;
}
</style>
