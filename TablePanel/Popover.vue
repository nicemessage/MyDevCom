<template>
  <div
    class="field-popover-container"
    v-if="visible"
    :style="position"
    v-clickOutside:pointerdown="closeTip"
  >
    <el-table
      ref="tipsTable"
      :data="data"
      max-height="300"
      highlight-current-row
      :row-class-name="setHighlightRows"
      @row-click="setSelectedRow"
    >
      <el-table-column prop="cnName" label="中文描述" align="center"></el-table-column>
      <el-table-column label="推荐名称" align="center">
        <template v-slot="scope">
          {{ scope.row.standardType === 'StandardName' ? scope.row.enShortName : scope.row.enName }}
        </template>
      </el-table-column>
      <el-table-column prop="convention" label="命名约定" align="center"></el-table-column>
      <el-table-column prop="standardType" label="类型" align="center">
        <template v-slot="scope">
          <span v-if="scope.row.standardType === 'PUBLIC'">标准信息项</span>
          <span v-else-if="scope.row.standardType === 'StandardName'">命名标准</span>
          <span v-else-if="scope.row.standardType === 'BusinessTerms'">业务术语</span>
        </template>
      </el-table-column>
    </el-table>
    <p class="bottom-tips">以上信息由系统自动匹配推荐，可使用↑↓键选择，Enter键确认选择</p>
  </div>
</template>
<script>
export default {
  name: 'Popover',
  props: ['visible', 'position', 'data'],
  data() {
    return {
      selectedRow: -1,
    };
  },
  watch: {
    visible(v) {
      if (v) {
        this.listenKeyBoard();
      } else {
        this.removeListers();
      }
    },
  },
  methods: {
    // 设置选中的行的类名
    setHighlightRows({ rowIndex }) {
      if (this.selectedRows === rowIndex) {
        return 'selected-row';
      }
      return '';
    },
    closeTip() {
      this.selectedRow = -1;
      this.$emit('close-tip');
    },
    listenKeyBoard() {
      document.addEventListener('keydown', this.listenedFn);
    },
    // keydown事件
    listenedFn(e) {
      const { keyCode } = e;
      // 下箭头
      if (keyCode === 40) {
        if (this.selectedRow < 0) {
          this.selectedRow = 0;
          this.$refs.tipsTable.setCurrentRow(this.data[this.selectedRow]);
        } else if (this.selectedRow === this.data.length - 1) {
          this.selectedRow = 0;
          this.$refs.tipsTable.setCurrentRow(this.data[this.selectedRow]);
        } else {
          this.$refs.tipsTable.setCurrentRow(this.data[++this.selectedRow]);
        }
      } else if (keyCode === 38) {
        // 上箭头
        if (this.selectedRow < 0) {
          this.selectedRow = this.data.length - 1;
          this.$refs.tipsTable.setCurrentRow(this.data[this.selectedRow]);
        } else if (this.selectedRow === 0) {
          this.selectedRow = this.data.length - 1;
          this.$refs.tipsTable.setCurrentRow(this.data[this.selectedRow]);
        } else {
          this.$refs.tipsTable.setCurrentRow(this.data[--this.selectedRow]);
        }
      }
      // enter
      if (keyCode === 13) {
        this.$emit('get-tip', this.data[this.selectedRow]);
      }
      // ESC
      if (keyCode === 27) {
        this.closeTip();
      }
    },
    // 点击行事件
    setSelectedRow(row) {
      this.$emit('get-tip', row);
    },
    removeListers() {
      this.selectedRow = -1;
      this.$refs.tipsTable.setCurrentRow();
      document.removeEventListener('keydown', this.listenedFn);
    },
  },
};
</script>
<style scoped>
.field-popover-container {
  position: fixed;
  width: 600px;
  height: 350px;
  border-radius: 5px;
  background-color: white;
  z-index: 999999;
  box-shadow: 0 3px 10px 0 rgba(59, 74, 116, 0.14);
}
.bottom-tips {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
}
.selected-row td {
  background-color: #e6f1ff;
}
.field-popover-container {
  cursor: pointer;
}
</style>
