<!--
 * @Descripttion: 表格面板
 * @Author: wangxiaoxiao
 -->
<template>
  <div class="table-container">
    <div class="panel">
      <el-collapse v-model="panel">
        <el-collapse-item :title="title" name="panel">
          <edit-table
            :items="list"
            :columns="columns"
            :type="type"
            @open-tip="openTip"
            @close-tip="closeTip"
            ref="editTable"
            :publishDisable="publishDisable"
            v-if="columns.length"
          ></edit-table>
        </el-collapse-item>
      </el-collapse>
    </div>
    <popover
      :visible="visible"
      :position="position"
      :data="tipsData"
      @close-tip="closeTip"
      @get-tip="getSelectedTip"
    ></popover>
  </div>
</template>
<script>
import EditTable from './EditTable.vue';
import columns from './columns';
import Popover from './Popover';

export default {
  name: 'TablePanel',
  components: {
    EditTable,
    Popover,
  },
  props: {
    list: Array,
    // 用于分区字段发布状态不可编辑的判断 isAudit代表字段是否发布 publishDisable代表发布过 发布字段和非发布字段可以共存
    publishDisable: {
      type: Boolean,
      default: false,
    },
    title: String,
    type: String,
  },
  async created() {
    this.columns = await columns(this.type);
  },
  mounted() {},
  data() {
    return {
      panel: 'panel',
      columns: [],
      visible: false,
      focusRow: -1,
      key: '',
      // 控制弹出框位置
      position: {
        left: '0px',
        top: '0px',
      },
      tipsData: [],
    };
  },
  methods: {
    // 关闭提示
    closeTip() {
      this.visible = false;
    },

    // 获取名称选中的提示行
    getSelectedTip({ enName, enShortName, standardType, id }) {
      const preName = this.list[this.focusRow][this.key];
      let setName;
      if (standardType === 'StandardName') {
        setName = preName ? `${preName}_${enShortName}` : enShortName;
      } else {
        setName = preName ? `${preName}_${enName}` : enName;
      }
      this.$set(this.list[this.focusRow], [this.key], setName);
      this.$set(this.list[this.focusRow], 'fieldSourceId', id);
      this.$set(this.list[this.focusRow], 'fieldSource', standardType);
    },
    // 打开提示面板
    openTip(dom, item, preKey, key, index) {
      this.focusRow = index;
      this.key = key;
      const { bottom, left, height } = dom.getBoundingClientRect();
      const winHeight = window.innerHeight;
      const domBottom = winHeight - bottom;

      if (domBottom > 400) {
        this.position = {
          left: `${left}px`,
          top: `${bottom + 4}px`,
        };
      } else {
        this.position = {
          left: `${left}px`,
          bottom: `${domBottom + height}px`,
        };
      }
      if (item[preKey]) {
        this.getPopData(item[preKey]);
      }
    },
    async getPopData(val) {
      const popList = await Promise.all([
        this.$api.post('/udmp-web/udmp/stdField/fieldInfoSearching', { likeKey: val }),
        this.$api.post('/udmp-web/udmp/stdName/fieldSearching', { likeKey: val }),
      ]);
      this.tipsData = [];
      popList.filter(Boolean).forEach((item) => {
        this.tipsData = this.tipsData.concat(item);
      });
      this.visible = true;
    },
  },
};
</script>
<style lang="scss">
.table-container {
  .panel {
    .el-collapse {
      border-left: 1px solid #ebeef5;
      border-right: 1px solid #ebeef5;
    }
    .el-collapse-item__header {
      background: #ededf1;
      height: 40px;
      line-height: 40px;
      position: relative;
      &:first-child {
        padding-left: 40px;
      }
    }
    .el-collapse-item__content {
      padding: 16px 30px 16px 25px;
    }
    .el-collapse-item__arrow::before {
      content: '\e791';
    }
    .el-collapse-item__arrow {
      position: absolute;
      left: 18px;
    }
  }
  .partition {
    margin-top: 40px;
  }
}
</style>
