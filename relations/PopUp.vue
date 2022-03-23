<template>
  <div class="wrap" v-if="value">
    <div class="header">
      <span>详情</span>
      <span @click="handleClose">&#215;</span>
    </div>
    <div class="main">
      <!-- 字段关系-->
      <div v-if="tipData.nodeType === 'ATTR'" class="sql-content">
        <div v-for="(item, index) in tipData.processExecution" :key="index">
          <div class="title">
            加工逻辑{{ index + 1 }}
            <span class="icon iconfont" v-clipboard:copy="format(item)" v-clipboard:success="onCopy"
              >&#xe6a2;</span
            >
          </div>
          <div class="sql">
            <highlightjs :code="format(item)" language="sql" />
          </div>
        </div>
      </div>
      <div class="inner-box" v-else>
        <div class="inner-header">
          <div class="row">
            <div class="left">信息项</div>
            <div class="right">详情</div>
          </div>
        </div>
        <div class="inner-main">
          <template v-if="tipData.nodeType === 'TABLE'">
            <div class="row">
              <div class="left">表中文名</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.tableAlias, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">表英文名</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.tableName, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">负责人</div>
              <div class="right">
                <Timeline :userNames="tipData.personInCharge"></Timeline>
              </div>
            </div>
          </template>
          <template v-else-if="tipData.nodeType === 'JOB'">
            <div class="row">
              <div class="left">作业名</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.name, 200, 14) }}</div>
            </div>
          </template>
          <template v-else-if="tipData.nodeType === 'TOPIC'">
            <div class="row">
              <div class="left">Topic中文名</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.topicAlias, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">Topic英文名</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.topicName, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">负责人</div>
              <div class="right">
                <Timeline :userNames="tipData.personInCharge"></Timeline>
              </div>
            </div>
          </template>
          <template v-else-if="tipData.nodeType === 'NAME'">
            <div class="row">
              <div class="left">对象类型</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.objectType, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">对象ID</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.objectId, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">对象名称</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.objectName, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">对象描述</div>
              <div class="right">{{ $utils.textOverflowPerfect(tipData.objectDes, 200, 14) }}</div>
            </div>
            <div class="row">
              <div class="left">负责人</div>
              <div class="right">
                <Timeline :userNames="tipData.personInCharge"></Timeline>
              </div>
            </div>
          </template>
          <div class="row">
            <div class="left">详细信息</div>
            <div class="right">
              <a class="link" href="javascript:void(0)" @click="detailClick">查看</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'sql-formatter';
export default {
  name: 'PopUp',
  props: ['value', 'tipData'],
  created() {},
  methods: {
    handleClose() {
      this.$emit('input', false);
    },
    onCopy() {
      this.$message({
        message: 'sql语句复制成功',
        type: 'success',
      });
    },
    detailClick() {
      if (this.tipData.nodeType === 'TABLE' || this.tipData.nodeType === 'TOPIC') {
        let { activeName } = this.$route.query;
        let id = this.tipData.id;
        const url = this.$router.resolve({
          name: 'field_details',
          query: {
            activeName,
            id,
          },
        });
        window.open(url.href);
      } else if (this.tipData.nodeType === 'JOB') {
        window.open(
          `http://linking-scheduler.101bank.sh/operation#/base/operationCenter/listApp?etlJob=${this.tipData.name.toUpperCase()}`
        );
      } else if (this.tipData.nodeType === 'NAME') {
        window.open(
          `http://anteater.jd.com/#/tb/layout/quotaDetail?taskId=${this.tipData.objectId}`
        );
      }
    },
  },
  computed: {
    format() {
      return format;
    },
  },
};
</script>

<style scoped lang="scss">
.wrap {
  width: 325px;
  position: absolute;
  right: 0px;
  top: 60px;
  border-radius: 5px;
  .header {
    width: 100%;
    height: 50px;
    background: #6f96cc;
    border-radius: 5px 5px 0 0;
    display: flex;
    font-size: 14px;
    color: white;
    justify-content: space-between;
    line-height: 50px;
    padding-left: 20px;
    padding-right: 20px;
    span:last-child {
      font-size: 20px;
      cursor: pointer;
      font-weight: lighter;
      transition: 0.3s;
      &:hover {
        font-size: 23px;
      }
    }
  }
  .main {
    padding: 20px 10px 10px 10px;
    border: 1px solid #e4e7ec;
    border-radius: 0 0 5px 5px;
    background: white;
    max-height: 385px;
    overflow-y: auto;
    .inner-box {
      border: 1px solid #e4e7ec;
      border-radius: 5px;
      .row {
        height: 50px;
        display: flex;
        line-height: 50px;
        padding-left: 30px;
        border-bottom: 1px solid #e4e7ec;
      }
      .left {
        flex: 1;
      }
      .right {
        flex: 2;
        white-space: nowrap;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        min-width: 0;
      }

      .inner-header {
        border-radius: 5px 5px 0 0;
        height: 50px;
        background: #fafafa;
        font-weight: bolder;
        border-bottom: 1px solid #e4e7ec;
      }
      .inner-main {
        color: #666666;
      }
    }
    .sql-content {
      .title {
        border-left: 3px solid #4190f7;
        padding-left: 5px;
        font-size: 14px;
        font-weight: bolder;
        line-height: 16px;
        .icon {
          transition: 0.3s;
          color: #919498;
          font-size: 14px;
          &:hover {
            cursor: pointer;
            font-weight: bolder;
            color: #303132;
          }
        }
      }
      .sql {
        &::v-deep .hljs {
          overflow: visible;
        }
        min-width: max-content;
      }
    }
  }
  .link {
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
